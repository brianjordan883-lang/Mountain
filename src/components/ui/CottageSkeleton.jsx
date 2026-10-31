import Skeleton from "./Skeleton";

export default function CottageSkeleton() {
  return (
    <article className="card" aria-hidden="true">
      <Skeleton height={220} radius={0} />
      <div className="card__body skeleton-stack">
        <Skeleton width="40%" height={12} />
        <Skeleton width="60%" height={24} />
        <Skeleton />
        <Skeleton width="80%" />
        <Skeleton height={48} radius={999} />
      </div>
    </article>
  );
}
