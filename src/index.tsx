import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ContextProvider, OffscreenContext } from "./context";

const ctx = new OffscreenContext();

ReactDOM.render(
  <React.StrictMode>
    <ContextProvider ctx={ctx}>
      <App />
    </ContextProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
