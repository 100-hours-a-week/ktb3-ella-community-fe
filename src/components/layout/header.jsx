import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaPencil } from "react-icons/fa6";

import "@/styles/header.css";

const Header = () => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  return (
    <header className="header">
      <div className="header-block">
        <div className="header-front">
          <img
            src="/public/images/logo.svg"
            alt="KTB3 커뮤니티 로고"
            className="logo-image"
          />
          <h1 className="title-xl">D'velop</h1>
        </div>
        <div className="header-back">
          <button type="button" className="post-create-button">
            <FaPencil color="#fff" size={14} />
            <Link to="/post-create" className="link-post">
              글쓰기
            </Link>
          </button>

          <div className="profile-dropdown">
            <button
              type="button"
              className="profile-dropdown-toggle"
              aria-haspopup="true"
              aria-expanded={isProfileOpen}
              onClick={toggleProfileMenu}
            >
              <img
                src="/public/images/userProfile.png"
                width="30"
                height="30"
                alt="프로필 메뉴"
              />
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
