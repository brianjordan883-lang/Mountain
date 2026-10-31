import Skeleton from "./Skeleton";

export default function ReviewSkeleton() {
  return (
    <div className="review skeleton-stack" aria-hidden="true">
      <Skeleton width="50%" height={20} />
      <Skeleton width="30%" height={14} />
      <Skeleton />
      <Skeleton width="85%" />
    </div>
  );
}
