// core/js/nav.js — v9999.9
document.addEventListener("DOMContentLoaded", () => {
  fetch("/core/components/header.html")
    .then(r => r.text())
    .then(html => {
      document.body.insertAdjacentHTML("afterbegin", html);

      const btn = document.getElementById("mobile-menu-btn");
      const menu = document.getElementById("mobile-menu");
      if (btn && menu) btn.onclick = () => menu.classList.toggle("hidden");
    });

  const current = window.location.pathname.split("/").pop();
  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href")?.split("/").pop();
    if (href === current || (current === "" && href === "index.html")) {
      link.classList.add("text-yellow-400", "font-bold");
    }
  });
});
