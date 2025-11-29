import React from "react";

const Input = ({
  label,
  Icon,
  name,
  type = "text",
  placeholder,
  value,
  onChange,
  onBlur,
  error,
}) => {
  return (
    <div className="field">
      <div className="field-label-wrapper">
        {Icon && <Icon size={20} color="#2563EB" className={`logo-${name}`} />}
        <label htmlFor={name} className="field-label">
          {label}
        </label>
      </div>
      <input
        id={name}
        name={name}
        type={type}
        className="field-input"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      <p className="error-text" id={`${name}-error`}>
        {error}
      </p>
    </div>
  );
};

export default Input;
