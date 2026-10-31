export default function FormField({ label, error, children }) {
  return (
    <label className="field">
      <span className="field__label">{label}</span>
      {children}
      {error && (
        <span className="field__error" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}
