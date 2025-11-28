import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPencil } from "react-icons/fa6";
import { FaUserCircle } from "react-icons/fa";
import { useAuthStore } from "@/shared/stores/use-auth-store";
import logoImg from "@/assets/images/logo.svg";

import "@/styles/global.css";
import "@/styles/header.css";

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();

  const { user, logout } = useAuthStore();

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/login");
  };

  return (
    <header className="header">
      <div className="header-block">
        <div className="header-front">
          <img src={logoImg} alt="로고 이미지" className="logo-image" />
          <h1 className="title-xl">D'velop</h1>
        </div>
        <div className="header-back">
          <button type="button" className="post-create-button">
            <FaPencil color="#fff" size={14} />
            <Link to="/post-create" className="link-post">
              글쓰기
            </Link>
          </button>

          <div
            className={`profile-dropdown ${isProfileOpen ? "open" : ""}`}
            onBlur={() => setIsProfileOpen(false)}
          >
            <button
              type="button"
              className="profile-dropdown-toggle"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              onClick={toggleProfileMenu}
            >
              {user?.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  width="30"
                  height="30"
                  alt="프로필"
                  style={{ borderRadius: "50%", objectFit: "cover" }}
                />
              ) : (
                <FaUserCircle size={30} color="#d1d5db" />
              )}
            </button>

            {isProfileOpen && (
              <div className="profile-dropdown-menu" role="menu">
                <a
                  href="./user-info-update.html"
                  className="profile-dropdown-item"
                  role="menuitem"
                >
                  회원정보 수정
                </a>
                <a
                  href="./user-password-update.html"
                  className="profile-dropdown-item"
                  role="menuitem"
                >
                  비밀번호 수정
                </a>
                <button
                  type="button"
                  className="profile-dropdown-item profile-dropdown-logout"
                  role="menuitem"
                  onClick={handleLogout}
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
