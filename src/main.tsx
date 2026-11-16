import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router";
import "@fontsource-variable/inter";
import "katex/dist/katex.min.css";
import "mafs/core.css";
import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/components.css";
import "./styles/layout.css";
import "./styles/module.css";
import "./styles/lab.css";
import { App } from "./App";

try {
  const t = localStorage.getItem("tema");
  if (t === "light" || t === "dark") document.documentElement.dataset.theme = t;
} catch {
  /* sem armazenamento: segue o sistema */
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
);
