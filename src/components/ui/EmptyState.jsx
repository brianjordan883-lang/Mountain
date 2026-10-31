export default function EmptyState({ text, children }) {
  return (
    <div className="state empty">
      <p>{text}</p>
      {children}
    </div>
  );
}
