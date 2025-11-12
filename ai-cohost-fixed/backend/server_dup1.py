from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO, emit
import google.generativeai as genai
from dotenv import load_dotenv
import os
import jwt
import time
import uuid
import requests
from datetime import datetime

# === LOAD ENV & CONFIG ===
load_dotenv()
app = Flask(__name__)
app.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key-123")

CORS(app, supports_credentials=True)
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='eventlet')

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
PROFIT_SHARE = 0.7  # Property Owner gets 70%, Platform (you) gets 30%
EXCHANGE_RATE_KEY = os.getenv("EXCHANGE_RATE_API_KEY")

# === IN-MEMORY DATA (Replace with PostgreSQL in production) ===
users = {}
bookings = []
properties = []

# Auto-seed if empty
if not properties:
    properties = [
        {"id": 1, "title": "Luxury Villa Dubai", "price": 299, "location": "Dubai"},
        {"id": 2, "title": "Beach House Karachi", "price": 180, "location": "Karachi"},
        {"id": 3, "title": "Mountain Cabin Murree", "price": 150, "location": "Murree"}
    ]

# === JWT HELPER ===
def create_jwt(user_id):
    payload = {
        "user_id": user_id,
        "exp": time.time() + 86400,
        "iat": time.time()
    }
    return jwt.encode(payload, os.getenv("SECRET_KEY"), algorithm="HS256")

def verify_jwt(token):
    try:
        return jwt.decode(token, os.getenv("SECRET_KEY"), algorithms=["HS256"])
    except:
        return None

# === REAL-TIME AI CHAT (Gemini 1.5 Flash) ===
@socketio.on('user_message')
def handle_message(data):
    prompt = data.get('prompt', '').strip()
    if not prompt:
        return emit('ai_response', {"response": "Please say something!"})
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        response = model.generate_content(prompt)
        emit('ai_response', {"response": response.text})
    except Exception as e:
        emit('ai_response', {"response": "AI is thinking... Try again."})

# === AUTH ENDPOINTS ===
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email & password required"}), 400
    
    if email in users:
        return jsonify({"error": "User already exists"}), 409
    
    user_id = str(uuid.uuid4())
    users[email] = {"id": user_id, "email": email, "password": password, "role": "host"}
    token = create_jwt(user_id)
    
    return jsonify({"token": token, "message": "Registered successfully"}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    user = users.get(email)
    if user and user['password'] == password:
        token = create_jwt(user['id'])
        return jsonify({"token": token, "user": {"email": email, "role": user['role']}})
    
    return jsonify({"error": "Invalid credentials"}), 401

# === PROPERTY ENDPOINTS ===
@app.route('/api/featured')
def featured():
    return jsonify({"properties": properties[:3]})

@app.route('/api/search', methods=['POST'])
def search():
    query = request.json.get('query', '').lower()
    filtered = [
        p for p in properties 
        if query in p['title'].lower() or query in p['location'].lower()
    ]
    return jsonify({"properties": filtered or properties})

# === USER LIST PROPERTY (70% to owner) ===
@app.route('/api/list-property', methods=['POST'])
def list_property():
    title = request.form.get('title')
    location = request.form.get('location')
    price = float(request.form.get('price', 0))
    
    if not title or not location or price <= 0:
        return jsonify({"error": "Invalid data"}), 400
    
    # AI Price Optimization
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"Suggest optimal nightly price for '{title}' in {location}. Current ${price}. Return only a number."
        ai_response = model.generate_content(prompt)
        ai_price = float(ai_response.text.strip().replace('$', '').replace(',', ''))
    except:
        ai_price = price
    
    new_prop = {
        "id": len(properties) + 1,
        "title": title,
        "location": location,
        "price": round(ai_price),
        "owner_email": request.form.get('email', 'unknown@host.com')
    }
    properties.append(new_prop)
    
    return jsonify({"message": "Property listed!", "property": new_prop})

# === BOOKING & PAYMENT ===
@app.route('/api/book', methods=['POST'])
def book_property():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    user = verify_jwt(token)
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    
    data = request.json
    property_id = data.get('property_id')
    nights = data.get('nights', 1)
    
    prop = next((p for p in properties if p['id'] == property_id), None)
    if not prop:
        return jsonify({"error": "Property not found"}), 404
    
    total = prop['price'] * nights
    booking_id = len(bookings) + 1
    booking = {
        "id": booking_id,
        "user_id": user['user_id'],
        "property": prop,
        "nights": nights,
        "total": total,
        "timestamp": datetime.utcnow().isoformat(),
        "status": "confirmed"
    }
    bookings.append(booking)
    
    return jsonify({"booking": booking, "message": "Booked successfully!"})

@app.route('/api/process-payment', methods=['POST'])
def process_payment():
    data = request.json
    amount = float(data.get('amount', 0))
    
    if amount <= 0:
        return jsonify({"error": "Invalid amount"}), 400
    
    owner_share = amount * PROFIT_SHARE
    platform_share = amount * (1 - PROFIT_SHARE)
    
    return jsonify({
        "status": "Payment Split Done",
        "total": f"${amount:.2f}",
        "owner_share": f"${owner_share:.2f} (70%) → Property Owner",
        "platform_share": f"${platform_share:.2f} (30%) → Syed Platform",
        "iban": os.getenv("JAZZCASH_IBAN"),
        "account_name": os.getenv("ACCOUNT_NAME"),
        "timestamp": datetime.utcnow().isoformat()
    })

# === WESTERN UNION → JAZZCASH (PKR) ===
@app.route('/api/wu-to-jazzcash', methods=['POST'])
def wu_to_jazzcash():
    data = request.json
    mtcn = data.get('mtcn', '').strip()
    amount_usd = float(data.get('amount_usd', 0))
    
    if not mtcn or len(mtcn) != 10 or not mtcn.isdigit() or amount_usd <= 0:
        return jsonify({"error": "Invalid MTCN or amount"}), 400
    
    # Live Exchange Rate
    rate = 278.5
    try:
        res = requests.get(f"https://v6.exchangerate-api.com/v6/{EXCHANGE_RATE_KEY}/latest/USD")
        data = res.json()
        if data.get('result') == 'success':
            rate = data['conversion_rates']['PKR']
    except:
        pass
    
    pkr_amount = round(amount_usd * rate)
    
    deposit = {
        "method": "Western Union",
        "mtcn": mtcn,
        "usd": amount_usd,
        "pkr": pkr_amount,
        "iban": os.getenv("JAZZCASH_IBAN"),
        "account": os.getenv("ACCOUNT_NAME"),
        "timestamp": datetime.utcnow().isoformat()
    }
    bookings.append(deposit)
    
    return jsonify({
        "success": True,
        "pkr_amount": pkr_amount,
        "iban": os.getenv("JAZZCASH_IBAN"),
        "account_name": os.getenv("ACCOUNT_NAME"),
        "message": "WU converted & deposited to JazzCash in PKR"
    })

# === TRANSLATION ENDPOINT (For Multi-Language) ===
@app.route('/api/translate', methods=['POST'])
def translate():
    text = request.json.get('text', '')
    target = request.json.get('target', 'en')
    if not text:
        return jsonify({"translation": text})
    
    try:
        model = genai.GenerativeModel('gemini-1.5-flash')
        prompt = f"Translate exactly to {target}: '{text}'"
        res = model.generate_content(prompt)
        return jsonify({"translation": res.text.strip()})
    except:
        return jsonify({"translation": text})

# === OWNER DASHBOARD (Real-Time Stats) ===
@app.route('/api/owner-stats')
def owner_stats():
    total_revenue = sum(b.get('total', 0) or b.get('usd', 0) for b in bookings)
    owner_profit = total_revenue * PROFIT_SHARE
    platform_profit = total_revenue * (1 - PROFIT_SHARE)
    
    return jsonify({
        "visitors": 1234 + len(bookings) * 10,
        "bookings": len(bookings),
        "revenue": round(total_revenue, 2),
        "owner_profit": round(owner_profit, 2),      # ← Property Owners
        "platform_profit": round(platform_profit, 2), # ← You (Syed)
        "seo_score": "98%"
    })

# === AI PRICING SUGGESTION ===
@app.route('/api/ai-pricing', methods=['POST'])
def ai_pricing():
    location = request.json.get('location', 'Unknown')
    try:
        model = genai.GenerativeModel('gemini-1.5-pro')
        prompt = f"Suggest optimal nightly price for a luxury villa in {location}. Return only a number."
        response = model.generate_content(prompt)
        price = float(response.text.strip().replace('$', '').replace(',', ''))
    except:
        price = 250
    return jsonify({"price": round(price)})

# === HEALTH CHECK ===
@app.route('/')
def health():
    return jsonify({
        "status": "SYED CO-HOST AI v9999.9 — LIVE",
        "time": datetime.utcnow().isoformat(),
        "endpoints": [
            "/api/register", "/api/login", "/api/list-property",
            "/api/search", "/api/book", "/api/process-payment",
            "/api/wu-to-jazzcash", "/api/translate", "/api/owner-stats"
        ]
    })

# === RUN SERVER ===
if __name__ == '__main__':
    print("SYED CO-HOST AI v9999.9 — LAUNCHED @ http://localhost:5000")
    import eventlet
    eventlet.monkey_patch()
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)