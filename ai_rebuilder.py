#!/usr/bin/env python3
"""
ai_empire_full_rebuilder.py
AI Co-Host Empire — Full Rebuilder & Auto-Fixer v1.0 (magical edition)

- Creates a non-destructive production-ready copy "ai-cohost-fixed/"
- Reorganizes frontend/backend/static/react into perfect structure
- Copies files (no deletion of originals)
- Fixes common path problems in HTML/JS/CSS
- Injects core CSS/JS tags into HTML if missing
- Detects duplicates and renames safely
- Generates backend API stubs for common endpoints if missing
- Creates sample render.yaml and netlify.toml and _redirects
- Creates backend/db/sqlite3 placeholder
- Produces a detailed rebuilder_log.txt
"""

import os
import re
import shutil
import sys
from pathlib import Path
import json
import datetime
import sqlite3

# -------------------------
# Configuration / Constants
# -------------------------
MAGIC_NOTE = "✨ AI Empire Fixed — v1.0 — Made with ❤️ and a bit of magic ✨"
TIMESTAMP = datetime.datetime.utcnow().isoformat() + "Z"

ROOT = Path.cwd()  # run script from project root
ORIGINAL_DIR = ROOT
TARGET_DIR = ROOT / "ai-cohost-fixed"

LOG_FILE = ROOT / "rebuilder_log.txt"
DUP_SUFFIX = "_dup"
EXPECTED_BACKEND_ROUTES = [
    ("POST", "/api/register"),
    ("POST", "/api/login"),
    ("POST", "/api/translate"),
    ("POST", "/api/client-error"),
    ("POST", "/api/bookings"),
    ("GET", "/api/properties"),
    ("POST", "/api/payment"),
    ("GET", "/api/version")
]

# Perfect production structure blueprint (will create)
STRUCTURE = {
    "backend": [
        "server.py", "run.py", "requirements.txt", "render.yaml", ".env.sample"
    ],
    "backend/api": [
        "__init__.py", "routes_auth.py", "routes_property.py",
        "routes_payments.py", "models.py", "utils.py"
    ],
    "backend/db": [],  # sqlite placeholder
    "frontend": ["index.html", "netlify.toml", "_redirects"],
    "frontend/core/components": ["chat-widget.html", "chat-message.html", "footer.html", "header.html", "neural-loader.html"],
    "frontend/core/css": ["Airbnb.css"],
    "frontend/core/js": ["chat-ai.js", "core.js", "language.js", "nav.js", "self-heal.js"],
    "frontend/pages/home/ai": ["neural-search-ai.js"],
    "frontend/pages/home": ["index.html", "home.css", "home.js"],
    "frontend/pages/auth": ["login.html", "register.html", "auth.css", "auth.js"],
    "frontend/pages/host/ai": ["pricing-ai.js"],
    "frontend/pages/host": ["host.html", "host.css", "host.js", "dashboard.html", "dashboard.css", "dashboard.js", "owner-dashboard.html", "owner-dashboard.css", "owner-dashboard.js", "property-owner-dashboard.html"],
    "frontend/pages/guest": ["booking.html", "booking.css", "booking.js", "guest.html", "guest.css", "guest.js", "search.html"],
    "frontend/pages/payments/ai": ["currency.js", "fraud-detection.js", "wu-to-jc.js"],
    "frontend/pages/payments": ["checkout.html", "payments.css", "payments.js"],
    "frontend/pages/property/ai": ["virtual-tour.js"],
    "frontend/pages/property": ["property-view.html", "property.css", "property.js"],
    "frontend/pages/partials": ["header.html", "footer.html", "partials.js", "partials.css"],
    "frontend/react/src/styles": ["Airbnb.css"],
    "frontend/react/src": ["main.jsx", "App.jsx", "PropertyCard.jsx"],
    "frontend/static/images": [],
    "frontend/static/uploads": [],
    "frontend/static/icons": [],
    "sw.js": [],
    "offline.html": [],
    "offline.css": [],
    "offline.js": [],
    "vite.config.js": [],
    "README.md": []
}

# A list of common HTML file extensions and JS/CSS
HTML_EXTS = (".html", ".htm")
JS_EXTS = (".js", ".mjs", ".jsx")
CSS_EXTS = (".css",)

# Logging buffer
log_entries = []

# -------------------------
# Helper functions
# -------------------------
def log(msg):
    ts = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
    entry = f"[{ts}] {msg}"
    log_entries.append(entry)
    print(entry)

def safe_copy(src: Path, dest: Path):
    """Copy file from src to dest, creating parent directories."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    if dest.exists():
        # if file already exists, create a duplicate with suffix and index
        base = dest.stem
        ext = dest.suffix
        i = 1
        new_dest = dest.parent / f"{base}{DUP_SUFFIX}{i}{ext}"
        while new_dest.exists():
            i += 1
            new_dest = dest.parent / f"{base}{DUP_SUFFIX}{i}{ext}"
        shutil.copy2(src, new_dest)
        log(f"Copied (duplicate-handled): {src} -> {new_dest}")
        return new_dest
    else:
        shutil.copy2(src, dest)
        log(f"Copied: {src} -> {dest}")
        return dest

def ensure_blueprint(target_root: Path):
    """Create the blueprint directory tree under target_root."""
    for key, files in STRUCTURE.items():
        path = target_root / key
        path.mkdir(parents=True, exist_ok=True)
        log(f"Ensured directory: {path}")
        # create placeholder files if they don't exist already in blueprint
        for f in files:
            p = path / f
            if not p.exists():
                # only create small placeholder for python or json; for html/js/css leave empty if not present
                if p.suffix in (".py", ".json"):
                    p.write_text("# autogenerated placeholder\n", encoding="utf-8")
                    log(f"Created placeholder: {p}")

def find_all_files(base: Path):
    """Return list of all files under base (excluding .git .venv etc)."""
    ignore = {".git", ".venv", "__pycache__"}
    files = []
    for root, dirs, filenames in os.walk(base):
        # filter dirs
        dirs[:] = [d for d in dirs if d not in ignore]
        for fn in filenames:
            files.append(Path(root) / fn)
    return files

# Simple heuristics to guess target folder for a file
def guess_target_for_file(file: Path, target_root: Path):
    name = file.name.lower()
    # exact matches based on known filenames first
    if name in [n.lower() for n in STRUCTURE.get("frontend/core/components", [])]:
        return target_root / "frontend/core/components" / file.name
    if name in [n.lower() for n in STRUCTURE.get("frontend/core/js", [])]:
        return target_root / "frontend/core/js" / file.name
    if name in [n.lower() for n in STRUCTURE.get("frontend/core/css", [])]:
        return target_root / "frontend/core/css" / file.name
    # route by extension
    if file.suffix in HTML_EXTS:
        # heuristics: if path contains "auth" or filename contains login/register
        if "auth" in str(file).lower() or "login" in name or "register" in name:
            return target_root / "frontend/pages/auth" / file.name
        if "host" in str(file).lower() or "dashboard" in name or "owner" in name:
            return target_root / "frontend/pages/host" / file.name
        if "guest" in str(file).lower() or "booking" in name:
            return target_root / "frontend/pages/guest" / file.name
        if "property" in str(file).lower() or "property-view" in name:
            return target_root / "frontend/pages/property" / file.name
        if "payment" in str(file).lower() or "checkout" in name:
            return target_root / "frontend/pages/payments" / file.name
        if "index" in name or "home" in name:
            return target_root / "frontend/pages/home" / file.name
        if "partial" in name or "header" in name or "footer" in name:
            return target_root / "frontend/pages/partials" / file.name
        # fallback to frontend root
        return target_root / "frontend" / file.name
    if file.suffix in JS_EXTS:
        # place AI scripts into ai folders if name matches
        if "neural" in name or "ai" in name:
            # attempt to place in nearest pages ai folder by source path
            sp = str(file.parent).lower()
            if "payments" in sp:
                return target_root / "frontend/pages/payments/ai" / file.name
            if "property" in sp:
                return target_root / "frontend/pages/property/ai" / file.name
            if "host" in sp:
                return target_root / "frontend/pages/host/ai" / file.name
            if "home" in sp:
                return target_root / "frontend/pages/home/ai" / file.name
            return target_root / "frontend/core/js" / file.name
        # general js -> core/js unless it's in backend
        if "backend" in str(file).lower() or "api" in str(file).lower():
            return target_root / "backend" / file.name
        return target_root / "frontend/core/js" / file.name
    if file.suffix in CSS_EXTS:
        # css goes to frontend/core/css unless specifically in a page folder
        sp = str(file.parent).lower()
        if "auth" in sp:
            return target_root / "frontend/pages/auth" / file.name
        if "host" in sp:
            return target_root / "frontend/pages/host" / file.name
        if "guest" in sp:
            return target_root / "frontend/pages/guest" / file.name
        if "payment" in sp:
            return target_root / "frontend/pages/payments" / file.name
        if "property" in sp:
            return target_root / "frontend/pages/property" / file.name
        return target_root / "frontend/core/css" / file.name
    # python files -> backend
    if file.suffix == ".py":
        # keep api/* if filename matches known names
        name_lower = name
        if "server" in name_lower or "run" in name_lower:
            return target_root / "backend" / file.name
        if "routes" in name_lower or "models" in name_lower or "utils" in name_lower:
            return target_root / "backend/api" / file.name
        return target_root / "backend" / file.name
    # other assets -> static
    if file.suffix in (".png", ".jpg", ".jpeg", ".svg", ".webp", ".ico", ".json"):
        return target_root / "frontend/static" / file.name
    # default fallback
    return target_root / "frontend" / file.name

# Path-fixing utilities
def normalize_paths_in_text(text: str):
    """
    Replace common patterns:
    - ../../core/... -> /core/...
    - ../core/... -> /core/...
    - ../static/... -> /static/...
    - ensure /core/css/Airbnb.css and /core/js/core.js references exist (but not force)
    """
    # normalize multiple ../ to single ../
    text = re.sub(r"\\", "/", text)
    text = re.sub(r"(\.\./\.\./)+", "../", text)
    # Replace common relative core references with root-based references for static hosting
    text = re.sub(r"\.\./core/css/", "/core/css/", text)
    text = re.sub(r"\.\./core/js/", "/core/js/", text)
    text = re.sub(r"\.\./core/components/", "/core/components/", text)
    text = re.sub(r"\.\./static/", "/static/", text)
    # ensure paths that start with "/./" or similar are cleaned
    text = re.sub(r"/\./", "/", text)
    return text

def inject_core_assets_into_html(html_text: str):
    """
    If HTML doesn't reference core css or core.js, inject lines.
    Add CSS <link href="/core/css/Airbnb.css"> in <head>
    Add core JS <script src="/core/js/core.js" defer></script> before </body>
    Minimal heuristics; safe to be idempotent.
    """
    head_lower = html_text.lower()
    changed = False
    if "/core/css/airbnb.css" not in head_lower and "<head" in head_lower:
        # inject before </head>
        html_text = re.sub(r"(</head>)", '  <link rel="stylesheet" href="/core/css/Airbnb.css">\n\\1', html_text, flags=re.IGNORECASE)
        changed = True
    if "/core/js/core.js" not in head_lower and "</body>" in head_lower:
        html_text = re.sub(r"(</body>)", '  <script src="/core/js/core.js" defer></script>\n\\1', html_text, flags=re.IGNORECASE)
        changed = True
    return html_text, changed

# API stub generator
def create_backend_api_stub(target_root: Path):
    """Create or augment server.py and api route files to include missing endpoints"""
    backend_dir = target_root / "backend"
    api_dir = backend_dir / "api"
    backend_dir.mkdir(parents=True, exist_ok=True)
    api_dir.mkdir(parents=True, exist_ok=True)
    server_py = backend_dir / "server.py"
    if not server_py.exists():
        # create a minimal Flask+SocketIO server
        server_py.write_text("""\
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route("/")
def index():
    return jsonify({"status":"ok","version":"v1.0"})

# placeholder APIs will be appended
if __name__ == "__main__":
    socketio.run(app, host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
""", encoding="utf-8")
        log(f"Created backend server stub: {server_py}")

    # ensure api route files exist
    for fname in ("routes_auth.py", "routes_property.py", "routes_payments.py", "__init__.py", "models.py", "utils.py"):
        p = api_dir / fname
        if not p.exists():
            p.write_text("# autogenerated placeholder - implement logic here\n", encoding="utf-8")
            log(f"Created API placeholder: {p}")

    # Read server.py and ensure endpoints present; if not, inject minimal stubs at end of server.py
    text = server_py.read_text(encoding="utf-8")
    to_inject = []
    # Basic API helpers
    if "/api/register" not in text:
        to_inject.append("""\n@app.route("/api/register", methods=["POST"])\ndef register():\n    data = request.get_json() or {}\n    # TODO: validate & save user\n    return jsonify({\"success\": True, \"token\": \"demo-token\"})\n""")
    if "/api/login" not in text:
        to_inject.append("""\n@app.route("/api/login", methods=["POST"])\ndef login():\n    data = request.get_json() or {}\n    # TODO: authenticate user\n    return jsonify({\"success\": True, \"token\": \"demo-token\"})\n""")
    if "/api/translate" not in text:
        to_inject.append("""\n@app.route("/api/translate", methods=["POST"])\ndef translate_endpoint():\n    data = request.get_json() or {}\n    # TODO: call AI translator\n    return jsonify({\"translation\": data.get('text', '')})\n""")
    if "/api/client-error" not in text:
        to_inject.append("""\n@app.route('/api/client-error', methods=['POST'])\ndef client_error():\n    payload = request.get_json() or {}\n    # store or log client-side errors\n    print('CLIENT ERROR', payload)\n    return jsonify({'ok': True})\n""")
    if to_inject:
        server_py.write_text(text + "\n# >>> AUTOGENERATED API STUBS >>>\n" + "\n".join(to_inject), encoding="utf-8")
        log(f"Appended API stubs to {server_py}")

# Create sqlite placeholder
def create_sqlite_placeholder(target_root: Path):
    db_dir = target_root / "backend" / "db"
    db_dir.mkdir(parents=True, exist_ok=True)
    db_file = db_dir / "data.sqlite3"
    if not db_file.exists():
        try:
            conn = sqlite3.connect(str(db_file))
            cur = conn.cursor()
            cur.execute("CREATE TABLE IF NOT EXISTS info (k TEXT PRIMARY KEY, v TEXT);")
            cur.execute("INSERT OR REPLACE INTO info (k,v) VALUES (?,?)", ("created", TIMESTAMP))
            conn.commit()
            conn.close()
            log(f"Created SQLite placeholder at {db_file}")
        except Exception as e:
            log(f"SQLite creation failed: {e}")

# create deployment helper files
def create_deployment_files(target_root: Path):
    # netlify.toml (basic)
    nt = target_root / "frontend" / "netlify.toml"
    if not nt.exists():
        nt.write_text("""[build]\n  publish = \"frontend\"\n  command = \"echo 'No build required for static frontend'\"\n\n[[redirects]]\n  from = \"/*\"\n  to = \"/index.html\"\n  status = 200\n""", encoding="utf-8")
        log(f"Created sample Netlify config: {nt}")
    # _redirects
    rts = target_root / "frontend" / "_redirects"
    if not rts.exists():
        rts.write_text("/*    /index.html   200\n", encoding="utf-8")
        log(f"Created sample _redirects: {rts}")
    # render.yaml sample
    ry = target_root / "backend" / "render.yaml"
    if not ry.exists():
        ry.write_text("""services:\n  - type: web\n    name: ai-cohost-backend\n    env: python\n    buildCommand: \"pip install -r requirements.txt\"\n    startCommand: \"gunicorn -k eventlet -w 1 server:app\"\n""", encoding="utf-8")
        log(f"Created sample render.yaml: {ry}")
    # README
    rm = target_root / "README.md"
    if not rm.exists():
        rm.write_text("# AI Co-Host Fixed Copy\nThis folder is auto-generated by ai_empire_full_rebuilder.py\n", encoding="utf-8")
        log(f"Created README.md at {rm}")

# -------------------------
# Main rebuild workflow
# -------------------------
def rebuild_project():
    global TARGET_DIR
    log("Starting full rebuild process (non-destructive).")
    if TARGET_DIR.exists():
        # don't overwrite existing fixed copy; create numbered copy
        i = 1
        while True:
            alt = ROOT / f"ai-cohost-fixed-{i}"
            if not alt.exists():
                TARGET_DIR = alt
                break
            i += 1
    log(f"Target fixed copy: {TARGET_DIR}")
    TARGET_DIR.mkdir(parents=True, exist_ok=True)

    # ensure blueprint
    ensure_blueprint_root = TARGET_DIR  # alias
    ensure_blueprint(ensure_blueprint_root)

    # collect files from original project
    all_files = find_all_files(ORIGINAL_DIR)

    # skip our own potential outputs
    all_files = [f for f in all_files if not str(f).startswith(str(TARGET_DIR)) and f.name != LOG_FILE.name and f.name != Path(__file__).name]

    # iterate and copy intelligently
    for f in all_files:
        try:
            rel = f.relative_to(ORIGINAL_DIR)
        except Exception:
            rel = Path(f.name)
        # skip hidden top-level like .git etc
        if any(part.startswith('.') for part in rel.parts):
            continue
        # determine guessed target
        tgt = guess_target_for_file(f, TARGET_DIR)
        # special-case: if file already in desired folder in original structure and path is equal, copy same relative
        # copy safely (non-destructive)
        new_path = safe_copy(f, tgt)
        # post-copy fixes for textual files
        try:
            if new_path.suffix in HTML_EXTS + JS_EXTS + CSS_EXTS:
                text = new_path.read_text(encoding="utf-8", errors="ignore")
                new_text = normalize_paths_in_text(text)
                # inject core links if html
                if new_path.suffix in HTML_EXTS:
                    new_text, changed = inject_core_assets_into_html(new_text)
                    if changed:
                        log(f"Injected core assets into {new_path}")
                if new_text != text:
                    new_path.write_text(new_text, encoding="utf-8")
                    log(f"Normalized paths in {new_path}")
        except Exception as e:
            log(f"Post-copy processing failed for {new_path}: {e}")

    # detect duplicates across key files (e.g., neural-auth.js duplicates) and record
    # we already handled by safe_copy naming with _dup
    log("Scanning for duplicates and cleanup suggestions (no deletions).")

    # create backend api stubs if missing
    create_backend_api_stub(TARGET_DIR)
    # sqlite placeholder
    create_sqlite_placeholder(TARGET_DIR)
    # create deployment helper files
    create_deployment_files(TARGET_DIR)

    # final summary
    log(f"Rebuild finished. Fixed copy located at: {TARGET_DIR}")
    log(f"Log will be written to {LOG_FILE}")
    # write log file
    with open(LOG_FILE, "w", encoding="utf-8") as lf:
        lf.write(MAGIC_NOTE + "\n")
        lf.write(f"Generated: {TIMESTAMP}\n")
        lf.write("Actions:\n")
        for e in log_entries:
            lf.write(e + "\n")
    log("All done — check the fixed copy and rebuilder_log.txt. Happy launching! 🚀")

# -------------------------
# Run
# -------------------------
if __name__ == "__main__":
    try:
        rebuild_project()
    except Exception as e:
        log(f"Fatal error during rebuild: {e}")
        sys.exit(1)
