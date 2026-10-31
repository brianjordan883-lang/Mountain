import { useTranslation } from "react-i18next";
import Gallery from "../components/Gallery";
import { galleryImages } from "../data/gallery";

export default function GalleryPage() {
  const { t } = useTranslation();
  return (
    <section className="section page">
      <div className="container">
        <h1>{t("gallery.title")}</h1>
        <Gallery images={galleryImages} />
      </div>
    </section>
  );
}
