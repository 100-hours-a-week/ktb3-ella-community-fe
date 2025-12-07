import React from "react";

const Button = ({
  children, // 버튼 안에 들어갈 글자
  type = "button",
  onClick,
  disabled = false,
  Icon,
  className = "",
}) => {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-form-primary ${!disabled ? "active" : ""} ${className}`}
    >
      {Icon && <Icon size={20} color="#ffffff" />}

      {children}
    </button>
  );
};

export default Button;
