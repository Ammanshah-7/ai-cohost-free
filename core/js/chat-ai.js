// core/js/chat-ai.js — v9999.9 REALTIME ENGINE
const API_URL = "https://syedcohost.onrender.com";

export function initRealtimeChat() {
  try {
    const socket = io(API_URL, {
      transports: ["websocket", "polling"],
      reconnection: true
    });

    const widget = document.getElementById("chat-widget");
    if (!widget) return;

    widget.innerHTML = `
      <div class="chat-bubble" id="chat-bubble">AI</div>
      <div class="chat-box hidden" id="chat-box">
        <div class="chat-header">Neural AI Assistant</div>
        <div class="chat-body" id="chat-body"></div>
        <input type="text" id="chat-input" placeholder="Ask AI..." />
      </div>
    `;

    const chatBox = document.getElementById("chat-box");
    const bubble = document.getElementById("chat-bubble");
    const input = document.getElementById("chat-input");
    const body = document.getElementById("chat-body");

    // Toggle chat
    const toggleChat = () => chatBox.classList.toggle("hidden");

    // Attach bubble click
    bubble.addEventListener("click", toggleChat);

    // User sending message
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter" && input.value.trim()) {
        const msg = input.value;
        body.innerHTML += `
          <p class="user-msg"><strong>You:</strong> ${msg}</p>
        `;
        socket.emit("user_message", { prompt: msg });
        input.value = "";
        body.scrollTop = body.scrollHeight;
      }
    });

    // AI reply
    socket.on("ai_response", (data) => {
      body.innerHTML += `
        <p class="ai-msg"><strong>AI:</strong> ${data.response}</p>
      `;
      body.scrollTop = body.scrollHeight;
    });

  } catch (err) {
    console.error("CHAT INIT FAIL:", err);
  }
}
