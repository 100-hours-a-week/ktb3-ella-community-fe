import { $ } from "./utils/dom.js";

function init() {
  const btn = $("#helloBtn");
  btn?.addEventListener("click", () => {
    alert("Hello, Vanilla JS!");
  });
}

// 디자인 토큰/상태, 라우팅 등은 파일을 나눠가며 천천히 추가
init();
