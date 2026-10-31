import { useTranslation } from "react-i18next";

export default function AmenityList({ amenities }) {
  const { t } = useTranslation();
  return (
    <ul className="tags">
      {amenities.map((amenity) => (
        <li key={amenity}>{t(`amenities.${amenity}`, { defaultValue: amenity })}</li>
      ))}
    </ul>
  );
}
