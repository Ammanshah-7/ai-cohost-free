import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

import "./styles/Airbnb.css";   // ✅ correct CSS import

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
