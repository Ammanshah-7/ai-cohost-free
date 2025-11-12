from api.server import app, socketio

if __name__ == "__main__":
    print("SYED CO-HOST AI v9999.9 — LIVE")
    socketio.run(app, host='0.0.0.0', port=5000, debug=False)