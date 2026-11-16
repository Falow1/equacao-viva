/**
 * Tema do site. O padrão é o claro; o escuro só entra quando a pessoa escolhe no botão
 * do cabeçalho, e a escolha fica salva neste navegador.
 */
export type Theme = "light" | "dark";

const KEY = "tema";
const BAR_COLOR: Record<Theme, string> = { light: "#f8f6f1", dark: "#15171b" };

export function currentTheme(): Theme {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export function applyTheme(t: Theme) {
  document.documentElement.dataset.theme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", BAR_COLOR[t]);
}

/** Aplica o tema salvo (ou o claro) antes do primeiro render. */
export function initTheme() {
  let saved: string | null = null;
  try {
    saved = localStorage.getItem(KEY);
  } catch {
    /* sem armazenamento: fica no claro */
  }
  applyTheme(saved === "dark" ? "dark" : "light");
}

export function saveTheme(t: Theme) {
  applyTheme(t);
  try {
    localStorage.setItem(KEY, t);
  } catch {
    /* ignora */
  }
  window.dispatchEvent(new Event("themechange"));
}
