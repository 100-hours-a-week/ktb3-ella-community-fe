import React from "react";

const renderHTML = (markdown = "") => {
  if (!markdown) return "";

  // HTML 이스케이프
  const escapeHtml = (text) =>
    text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  return markdown
    .split(/\n/)
    .map((line) => {
      const trimmed = line.trim();

      const escaped = escapeHtml(line).replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
      );

      if (!trimmed) return "<br />";

      if (/^##\s+/.test(trimmed)) {
        return `<h2>${escaped.replace(/^##\s+/, "")}</h2>`;
      }
      return `<p>${escaped}</p>`;
    })
    .join("");
};

const MarkdownRenderer = ({ content }) => {
  return (
    <div
      className="post-detail-content"
      dangerouslySetInnerHTML={{ __html: renderHTML(content) }}
    />
  );
};

export default MarkdownRenderer;
