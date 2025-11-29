import React from "react";

const Toast = ({ open, message }) => {
  return <div className={`toast ${open ? "show" : ""}`}>{message}</div>;
};

export default Toast;
