import { clearStoredUser } from "./utils/user.js";

const closeAllDropdowns = (exclude) => {
  document.querySelectorAll(".profile-dropdown").forEach((dropdown) => {
    if (dropdown === exclude) return;
    dropdown.classList.remove("open");
    const toggle = dropdown.querySelector(".profile-dropdown-toggle");
    toggle?.setAttribute("aria-expanded", "false");
  });
};

const initProfileDropdowns = () => {
  const dropdowns = document.querySelectorAll(".profile-dropdown");
  if (!dropdowns.length) return;

  dropdowns.forEach((dropdown) => {
    const toggle = dropdown.querySelector(".profile-dropdown-toggle");
    const menu = dropdown.querySelector(".profile-dropdown-menu");
    const logoutBtn = dropdown.querySelector(".profile-dropdown-logout");

    if (!toggle || !menu) return;

    toggle.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      const isOpen = dropdown.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(isOpen));
      if (isOpen) {
        closeAllDropdowns(dropdown);
      }
    });

    logoutBtn?.addEventListener("click", () => {
      clearStoredUser();
      window.location.href = "./login.html";
    });

    menu.addEventListener("click", (event) => event.stopPropagation());
  });

  document.addEventListener("click", () => closeAllDropdowns());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAllDropdowns();
    }
  });
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initProfileDropdowns);
} else {
  initProfileDropdowns();
}
