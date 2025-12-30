import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css"; // 只引入 CSS，不要引入 html

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
