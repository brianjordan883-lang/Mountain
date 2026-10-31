import { useData } from "../../hooks/useData";
import ErrorMessage from "../ErrorMessage";
import CottageSkeleton from "./CottageSkeleton";
import ReviewSkeleton from "./ReviewSkeleton";
import Spinner from "./Spinner";
import errorText from "../../utils/errorText";

export default function DataState({ skeleton = "spinner", count = 3, children }) {
  const { loading, error, reload } = useData();

  if (error) return <ErrorMessage message={errorText(error)} onRetry={error.code === "not_configured" ? undefined : reload} />;
  if (loading) {
    if (skeleton === "cottages")
      return (
        <div className="grid">
          {Array.from({ length: count }, (_, index) => (
            <CottageSkeleton key={index} />
          ))}
        </div>
      );
    if (skeleton === "reviews")
      return (
        <div className="grid grid--reviews">
          {Array.from({ length: count }, (_, index) => (
            <ReviewSkeleton key={index} />
          ))}
        </div>
      );
    return <Spinner />;
  }
  return children;
}
