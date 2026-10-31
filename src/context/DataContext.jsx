import { useCallback, useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { AppError } from "../services/db";
import * as cottagesApi from "../services/cottagesService";
import * as reviewsApi from "../services/reviewsService";
import * as contentApi from "../services/contentService";
import { removeImages } from "../services/storageService";
import { DEFAULT_CONTACTS } from "../config";
import { extras } from "../data/info";
import { slugify } from "../utils/format";
import { DataContext } from "./contexts";

const notConfigured = new AppError("not_configured");

const uniqueSlug = (name, list) => {
  const base = slugify(name);
  let slug = base;
  let index = 2;
  while (list.some((c) => c.slug === slug)) slug = `${base}-${index++}`;
  return slug;
};

// Удаляет файлы, которые больше не используются. Ошибка не отменяет уже сохранённую запись,
// поэтому её не бросаем, а возвращаем — форма покажет предупреждение.
async function cleanupImages(urls) {
  try {
    await removeImages(urls);
    return null;
  } catch (error) {
    console.error("Image cleanup failed:", error);
    return error;
  }
}

// Общие данные сайта: домики, одобренные отзывы, настройки и FAQ.
// Брони и модерация отзывов загружаются отдельно на своих страницах.
export function DataProvider({ children }) {
  const [cottages, setCottages] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rawSettings, setRawSettings] = useState({});
  const [faqs, setFaqs] = useState([]);
  const [status, setStatus] = useState(isSupabaseConfigured ? "loading" : "error");
  const [loadError, setLoadError] = useState(isSupabaseConfigured ? null : notConfigured);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined;
    let active = true;
    Promise.all([cottagesApi.listCottages(), reviewsApi.listApprovedReviews(), contentApi.getSettings(), contentApi.listFaqs()])
      .then(([c, r, s, f]) => {
        if (!active) return;
        setCottages(c);
        setReviews(r);
        setRawSettings(s);
        setFaqs(f);
        setStatus("ready");
      })
      .catch((error) => {
        if (!active) return;
        setLoadError(error);
        setStatus("error");
      });
    return () => {
      active = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => {
    if (!isSupabaseConfigured) return;
    setStatus("loading");
    setLoadError(null);
    setReloadKey((key) => key + 1);
  }, []);

  const value = useMemo(() => {
    const settings = {
      contacts: { ...DEFAULT_CONTACTS, ...rawSettings.contacts },
      stay: { ...extras, ...rawSettings.stay },
    };

    return {
      cottages,
      reviews,
      settings,
      faqs,
      status,
      loading: status === "loading",
      error: status === "error" ? loadError : null,
      reload,

      async addCottage(data) {
        const sortOrder = Math.max(0, ...cottages.map((c) => c.sortOrder ?? 0)) + 1;
        const item = await cottagesApi.createCottage({ ...data, slug: uniqueSlug(data.name, cottages), sortOrder });
        setCottages((list) => [...list, item]);
        return item;
      },
      async updateCottage(id, data) {
        const previous = cottages.find((c) => c.id === id);
        const item = await cottagesApi.updateCottage(id, data);
        setCottages((list) => list.map((c) => (c.id === id ? item : c)));
        // Старые фото удаляем только ПОСЛЕ сохранения — так на сайте не появится битых ссылок.
        const removed = (previous?.images ?? []).filter((url) => !item.images.includes(url));
        return { item, cleanupError: await cleanupImages(removed) };
      },
      async removeCottage(id) {
        const previous = cottages.find((c) => c.id === id);
        await cottagesApi.deleteCottage(id);
        setCottages((list) => list.filter((c) => c.id !== id));
        return { cleanupError: await cleanupImages(previous?.images ?? []) };
      },

      submitReview: reviewsApi.submitReview,
      // Тихое обновление публичных отзывов после модерации (без skeleton на всей странице).
      async refreshReviews() {
        setReviews(await reviewsApi.listApprovedReviews());
      },

      async saveSettings(key, next) {
        const saved = await contentApi.saveSetting(key, next);
        setRawSettings((current) => ({ ...current, [key]: saved }));
      },

      async addFaq(data) {
        const item = await contentApi.createFaq(data);
        setFaqs((list) => [...list, item]);
      },
      async updateFaq(id, data) {
        const item = await contentApi.updateFaq(id, data);
        setFaqs((list) => list.map((f) => (f.id === id ? item : f)));
      },
      async removeFaq(id) {
        await contentApi.deleteFaq(id);
        setFaqs((list) => list.filter((f) => f.id !== id));
      },
    };
  }, [cottages, reviews, rawSettings, faqs, status, loadError, reload]);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
