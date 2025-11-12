@echo off
echo.
echo ========================================================
echo SYED GLOBAL CO-HOST AI - FINAL PERFECT AIRBNB CLONE
echo ========================================================
echo.

:: === SET ROOT & CHECK ADMIN ===
set "ROOT=D:\ai-cohost-free"
if not exist "%ROOT%" mkdir "%ROOT%"
cd /d "%ROOT%"

:: === TOTAL WIPE ===
echo [DELETING OLD FILES...]
rmdir /s /q pages core api static 2>nul
del *.html *.css *.js *.json *.htaccess 2>nul

:: === CREATE FOLDERS ===
mkdir pages\home pages\property pages\host pages\search pages\auth
mkdir core\css core\js core\components
mkdir api\routes api\data
mkdir static\images\properties static\icons static\uploads

echo [FOLDERS CREATED]
echo.

:: === core/css/airbnb.css ===
(
echo @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
echo @import url('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css');
echo.
echo :root { --airbnb: #FF385C; --gray: #717171; --light: #f7f7f7; --border: #ebebeb; --radius: 12px; --shadow: 0 6px 16px rgba(0,0,0,0.1); --font: 'Inter', sans-serif; }
echo * { box-sizing: border-box; margin: 0; padding: 0; font-family: var(--font); }
echo body { background: #fff; color: #222; }
echo .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
echo header { padding: 16px 0; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: white; z-index: 1000; }
echo .logo { font-weight: 900; font-size: 1.5rem; color: var(--airbnb); text-decoration: none; }
echo nav a { margin: 0 16px; color: #222; font-weight: 500; text-decoration: none; }
echo .search-bar { display: flex; border: 1px solid var(--border); border-radius: 40px; overflow: hidden; box-shadow: var(--shadow); margin: 32px 0; }
echo .search-bar input, .search-bar button { padding: 14px 20px; border: none; outline: none; }
echo .search-bar input { flex: 1; }
echo .search-bar button { background: var(--airbnb); color: white; cursor: pointer; font-weight: 600; }
echo .property-card { border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); transition: 0.2s; cursor: pointer; }
echo .property-card:hover { transform: translateY(-4px); }
echo .property-img { width: 100%; height: 220px; object-fit: cover; }
echo .property-info { padding: 14px; }
echo .rating { font-weight: 600; font-size: 0.9rem; }
echo .price { font-weight: 700; font-size: 1.1rem; }
echo .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 28px; margin-top: 16px; }
) > core\css\airbnb.css

:: === core/js/core.js ===
(
echo document.addEventListener("DOMContentLoaded", () => {
echo   fetch("../../core/components/header.html").then(r => r.text()).then(h => document.getElementById("header").innerHTML = h);
echo   const cw = document.getElementById("chat-widget");
echo   if (cw) fetch("../../core/components/chat-widget.html").then(r => r.text()).then(h => { cw.innerHTML = h; initChat(); });
echo });
echo function initChat() {
echo   const chat = document.getElementById("chat");
echo   const box = document.getElementById("chat-box");
echo   if (chat && box) chat.addEventListener("click", () => box.classList.toggle("hidden"));
echo }
) > core\js\core.js

:: === core/components/header.html ===
(
echo ^<header^>^<div class="container"^>^<a href="../home/" class="logo"^>SYED CO-HOST^</a^>^<nav^>^<a href="../home/"^>Find Stays^</a^>^<a href="../host/"^>Become a Host^</a^>^<a href="../auth/login.html"^>Login^</a^>^</nav^>^</div^>^</header^>
) > core\components\header.html

:: === core/components/chat-widget.html ===
(
echo ^<div id="chat" title="AI Co-Host"^>^<i class="fas fa-robot"^>^</i^>^</div^>
echo ^<div id="chat-box" class="hidden"^>^<div class="chat-header"^>AI Co-Host^</div^>^<div class="chat-body"^>^<p^>Ask me anything!^</p^>^</div^>^<input type="text" placeholder="Ask AI..." onkeypress="if(event.key==='Enter')send(this)" /^>^</div^>
) > core\components\chat-widget.html

:: === pages/home/index.html ===
(
echo ^<!DOCTYPE html^>^<html^>^<head^>^<meta charset="UTF-8"^/^>^<meta name="viewport" content="width=device-width,initial-scale=1"^/^>^<title^>SYED CO-HOST^</title^>^<link rel="stylesheet" href="../../core/css/airbnb.css"^/^>^</head^>^<body^>^<div id="header"^>^</div^>^<div class="container"^>^<div class="search-bar"^>^<input type="text" placeholder="Where to?" /^>^<input type="date" /^>^<input type="date" /^>^<input type="number" placeholder="Guests" min="1" /^>^<button onclick="alert('AI Searching...')"^>Search^</button^>^</div^>^<div class="grid"^>^<div class="property-card"^>^<img src="../../static/images/properties/villa.jpg" class="property-img" /^>^<div class="property-info"^>^<div class="rating"^>★★★★★ 4.9 ^<span style="color:var(--gray)"^>(89)^</span^>^</div^>^<div^>Luxury Villa^</div^>^<div class="price"^>$120 ^<small^>/ night^</small^>^</div^>^</div^>^</div^>^</div^>^</div^>^<div id="chat-widget"^>^</div^>^<script src="../../core/js/core.js"^>^</script^>^</body^>^</html^>
) > pages\home\index.html

:: === api/server.py ===
(
echo from flask import Flask, jsonify
echo app = Flask(__name__)
echo @app.route('/api/ask', methods=['POST'])
echo def ask(): return jsonify({"reply": "AI: Found 12 villas in Lahore!"})
echo if __name__ == '__main__': app.run(port=5000)
) > api\server.py

:: === .htaccess ===
(
echo RewriteEngine On
echo RewriteRule ^$ pages/home/index.html [L]
) > .htaccess

echo.
echo ========================================================
echo FINAL BUILD 100% COMPLETE - FOLDERS CREATED
echo ========================================================
echo.
echo [OPEN] start pages\home\index.html
echo [RUN AI] cd api && python server.py
echo.
pause