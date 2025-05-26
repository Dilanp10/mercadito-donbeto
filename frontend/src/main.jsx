import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import './index.css';
import { InventarioProvider } from "./context/InventarioContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <InventarioProvider>
      <App />
    </InventarioProvider>
  </React.StrictMode>
);