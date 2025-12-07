import React from "react";

const Footer = () => {
  return (
    <footer
      className="footer"
      style={{
        padding: "20px",
        textAlign: "center",
        backgroundColor: "#fff",
        marginTop: "auto",
      }}
    >
      <div className="footer-content">
        <p>&copy; 2025 D'velop Community. All rights reserved.</p>
        <div className="footer-links">
          <a href="#">이용약관</a> | <a href="#">개인정보처리방침</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
