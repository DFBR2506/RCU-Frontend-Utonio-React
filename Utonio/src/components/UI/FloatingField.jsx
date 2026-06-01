import './FloatingField.css';

export default function FloatingField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  required,
  autoComplete,
  inputMode,
  className = '',
  ...rest
}) {
  const hasValue = value !== '' && value !== null && value !== undefined;
  const wrapperClass = [
    'floating-field',
    hasValue ? 'has-value' : '',
    error ? 'error' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClass}>
      <input
        id={id}
        type={type}
        className="floating-input"
        value={value ?? ''}
        onChange={onChange}
        placeholder=" "
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        {...rest}
      />
      <label htmlFor={id} className="floating-label">
        {label}{required ? <span className="floating-required" aria-hidden="true"> *</span> : null}
      </label>
      {error ? (
        <span id={`${id}-error`} className="form-error floating-error">{error}</span>
      ) : null}
    </div>
  );
}
