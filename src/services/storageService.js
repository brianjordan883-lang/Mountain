import { AppError, db, toAppError } from "./db";

export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5 МБ
const TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" };
export const ACCEPTED_TYPES = Object.keys(TYPES).join(",");

// ---------- Cloudinary (основной способ загрузки) ----------
// Нужны две переменные в .env (см. README → «Cloudinary»):
//   VITE_CLOUDINARY_CLOUD_NAME    — Cloud name из Dashboard
//   VITE_CLOUDINARY_UPLOAD_PRESET — имя unsigned upload preset
// API Secret в сайт НЕ вставляется: загрузка идёт через unsigned preset.
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME?.trim();
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET?.trim();
const CLOUDINARY_FOLDER = "calma-mountain/cottages";
export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

const cloudinaryApi = (action) => `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${action}`;

// Cloudinary сам подбирает формат (WebP/AVIF) и качество, и не отдаёт картинку шире 1600px.
const optimizedUrl = (url) => url.replace("/image/upload/", "/image/upload/f_auto,q_auto,c_limit,w_1600/");

// delete_token выдаётся при загрузке (если в preset включено «Return delete token»)
// и действует 10 минут. Позволяет удалить только что загруженное фото, если нажали «Отмена».
const deleteTokens = new Map(); // url -> token

async function uploadToCloudinary(file) {
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", UPLOAD_PRESET);
  body.append("folder", CLOUDINARY_FOLDER);

  let response;
  try {
    response = await fetch(cloudinaryApi("image/upload"), { method: "POST", body });
  } catch (error) {
    throw new AppError("network", error);
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok || !data.secure_url) {
    console.error("Cloudinary upload error:", data?.error?.message || response.status);
    throw new AppError("upload_failed", data?.error);
  }

  const url = optimizedUrl(data.secure_url);
  if (data.delete_token) deleteTokens.set(url, data.delete_token);
  return url;
}

const isCloudinaryUrl = (url) => typeof url === "string" && url.includes("res.cloudinary.com/");

async function removeFromCloudinary(urls) {
  // Удалить можно только свежие фото с delete_token. Остальные удаляются вручную
  // в Cloudinary → Media Library: для этого нужен API Secret, которому не место в браузере.
  await Promise.all(
    urls.map(async (url) => {
      const token = deleteTokens.get(url);
      if (!token) return;
      deleteTokens.delete(url);
      const body = new FormData();
      body.append("token", token);
      const response = await fetch(cloudinaryApi("delete_by_token"), { method: "POST", body });
      if (!response.ok) console.warn("Cloudinary delete_by_token failed:", response.status);
    }),
  );
}

// ---------- Supabase Storage (запасной вариант, если Cloudinary не настроен) ----------
const BUCKET = "cottage-images";

async function uploadToSupabase(file) {
  const path = `cottages/${crypto.randomUUID()}.${TYPES[file.type]}`;
  const storage = db().storage.from(BUCKET);
  const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) throw toAppError(error);
  return storage.getPublicUrl(path).data.publicUrl;
}

// Путь файла внутри bucket. Для картинок из /public/images и Cloudinary вернёт null.
export function storagePath(url) {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const index = typeof url === "string" ? url.indexOf(marker) : -1;
  return index === -1 ? null : decodeURIComponent(url.slice(index + marker.length));
}

// ---------- Общий интерфейс ----------
export function validateImage(file) {
  if (!TYPES[file.type]) throw new AppError("file_type");
  if (file.size > MAX_IMAGE_SIZE) throw new AppError("file_size");
}

// Загружает фото домика и возвращает его публичный URL.
export async function uploadCottageImage(file) {
  validateImage(file);
  return isCloudinaryConfigured ? uploadToCloudinary(file) : uploadToSupabase(file);
}

// Удаляет фото, которые больше не используются. Картинки из /public/images не трогает.
export async function removeImages(urls) {
  await removeFromCloudinary(urls.filter(isCloudinaryUrl));

  const paths = urls.map(storagePath).filter(Boolean);
  if (!paths.length) return;
  const { error } = await db().storage.from(BUCKET).remove(paths);
  if (error) throw toAppError(error);
}
