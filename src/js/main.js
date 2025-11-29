import { initHeader } from "./header.js";

const domReady = () =>
  new Promise((resolve) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve, { once: true });
    } else {
      resolve();
    }
  });

export const bootstrapApp = async (initPage) => {
  await domReady();
  await initHeader();
  if (typeof initPage === "function") {
    await initPage();
  }
};
