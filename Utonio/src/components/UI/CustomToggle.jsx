import './CustomToggle.css';

export default function CustomToggle({ checked, onChange, label, description, disabled = false }) {
  return (
    <label className={`custom-toggle ${checked ? 'on' : ''} ${disabled ? 'disabled' : ''}`}>
      <span className="custom-toggle-text">
        <span className="custom-toggle-label">{label}</span>
        {description && <span className="custom-toggle-description">{description}</span>}
      </span>
      <span className="custom-toggle-track">
        <span className="custom-toggle-thumb" />
        <input
          type="checkbox"
          className="custom-toggle-input"
          checked={!!checked}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
        />
      </span>
    </label>
  );
}
