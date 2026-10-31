import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ACCEPTED_TYPES, MAX_IMAGE_SIZE, uploadCottageImage, validateImage } from "../../services/storageService";
import errorText from "../../utils/errorText";

// Список фото домика: загрузка в Cloudinary (или Supabase Storage, если Cloudinary не настроен),
// превью, удаление, выбор обложки.
// value — массив URL. onUploaded сообщает форме о новых файлах (чтобы удалить их при «Отмене»).
export default function ImageUpload({ value, onChange, onUploaded, onBusyChange }) {
  const { t } = useTranslation();
  const [pending, setPending] = useState([]); // [{ id, preview, error }]
  const busy = pending.some((p) => !p.error);

  useEffect(() => {
    onBusyChange?.(busy);
  }, [busy, onBusyChange]);

  const upload = async (file) => {
    const id = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    setPending((list) => [...list, { id, preview, name: file.name, error: "" }]);
    try {
      validateImage(file);
      const url = await uploadCottageImage(file);
      onUploaded?.(url);
      onChange((images) => [...images, url]);
      setPending((list) => list.filter((p) => p.id !== id));
      URL.revokeObjectURL(preview);
    } catch (error) {
      setPending((list) => list.map((p) => (p.id === id ? { ...p, error: errorText(error) } : p)));
    }
  };

  const handle = (event) => {
    Array.from(event.target.files ?? []).forEach(upload);
    event.target.value = ""; // позволяет выбрать тот же файл ещё раз
  };

  const dismiss = (item) => {
    URL.revokeObjectURL(item.preview);
    setPending((list) => list.filter((p) => p.id !== item.id));
  };

  const remove = (url) => onChange((images) => images.filter((x) => x !== url));
  const makeCover = (url) => onChange((images) => [url, ...images.filter((x) => x !== url)]);

  return (
    <div className="upload">
      <div className="upload__grid">
        {value.map((url, index) => (
          <figure key={url} className="upload__item">
            <img src={url} alt="" className="upload__preview" />
            {index === 0 && <span className="upload__badge">{t("admin.form.cover")}</span>}
            <div className="upload__actions">
              {index > 0 && (
                <button type="button" className="link-btn" onClick={() => makeCover(url)}>
                  {t("admin.form.makeCover")}
                </button>
              )}
              <button type="button" className="link-btn link-btn--danger" onClick={() => remove(url)}>
                {t("common.delete")}
              </button>
            </div>
          </figure>
        ))}
        {pending.map((item) => (
          <figure key={item.id} className={`upload__item ${item.error ? "upload__item--error" : "upload__item--loading"}`}>
            <img src={item.preview} alt="" className="upload__preview" />
            {item.error ? (
              <div className="upload__actions">
                <span className="field__error">{item.name}: {item.error}</span>
                <button type="button" className="link-btn" onClick={() => dismiss(item)}>
                  {t("common.close")}
                </button>
              </div>
            ) : (
              <span className="upload__badge">{t("admin.form.uploading")}</span>
            )}
          </figure>
        ))}
      </div>
      <input type="file" accept={ACCEPTED_TYPES} multiple onChange={handle} />
      <span className="muted">{t("admin.form.imageHint", { size: MAX_IMAGE_SIZE / 1024 / 1024 })}</span>
    </div>
  );
}
