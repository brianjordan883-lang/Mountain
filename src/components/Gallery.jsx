import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

export default function Gallery({ images }) {
  const { t } = useTranslation();
  const [active, setActive] = useState(null);
  const items = images.map((img) => ({ src: img.src, alt: img.alt ?? t(img.altKey) }));

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setActive(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <div className="gallery">
        {items.map((img) => (
          <button
            key={img.src}
            className="gallery__item"
            onClick={() => setActive(img)}
            aria-label={t("gallery.zoom", { alt: img.alt })}
          >
            <img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          </button>
        ))}
      </div>
      {active && (
        <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setActive(null)}>
          <img src={active.src} alt={active.alt} />
          <button className="lightbox__close" aria-label={t("gallery.close")}>
            ×
          </button>
        </div>
      )}
    </>
  );
}
