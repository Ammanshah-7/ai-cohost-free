// core/js/language.js — v9999.9
const API_URL = "https://syedcohost.onrender.com";

const LANGUAGES = {
  en: "English",
  ur: "اردو",
  ar: "العربية",
  fr: "Français",
  es: "Español",
  zh: "中文"
};

async function translatePage(lang) {
  const elements = document.querySelectorAll("[data-i18n]");

  for (const el of elements) {
    const key = el.getAttribute("data-i18n");

    try {
      const res = await fetch(`${API_URL}/api/translate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: key, target: lang })
      });

      const data = await res.json();
      el.innerHTML = data.translation || key;

    } catch (e) {
      console.warn("Translation failed:", e);
    }
  }

  localStorage.setItem("lang", lang);
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("lang") || "en";
  translatePage(saved);

  if (!document.getElementById("lang-select")) {
    const select = document.createElement("select");
    select.id = "lang-select";
    select.style =
      "position:fixed;top:10px;right:10px;z-index:9999;padding:8px;border-radius:12px;background:var(--card);color:var(--text);";

    select.innerHTML = Object.entries(LANGUAGES)
      .map(([k, v]) => `<option value="${k}">${v}</option>`)
      .join("");

    select.value = saved;
    select.onchange = () => translatePage(select.value);
    document.body.appendChild(select);
  }
});
