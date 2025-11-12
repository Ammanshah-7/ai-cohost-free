// core/js/core.js — v9999.9
import { initRealtimeChat } from "./chat-ai.js";

const API_URL = "https://syedcohost.onrender.com";

function loadComponent(id, url, callback) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      const container = document.getElementById(id);
      if (container) container.innerHTML = html;
      if (callback) callback();
    })
    .catch(err => console.error(`LOAD FAIL ${url}:`, err));
}

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("header", "../core/components/header.html");
  loadComponent("footer", "../core/components/footer.html");

  // Load chat LAST because it must attach event listeners
  loadComponent(
    "chat-widget",
    "../core/components/chat-widget.html",
    initRealtimeChat
  );
});
