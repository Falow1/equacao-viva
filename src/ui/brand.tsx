import { useEffect, type CSSProperties } from "react";
import type { ObjColor } from "../modules/registry";

export const SITE_NAME = "Equação Viva";
export const SITE_TAGLINE = "Geometria Analítica e Álgebra Linear";

/**
 * Logo: dois vetores saindo da origem, o paralelogramo que eles geram e um ponto vazado
 * no vértice oposto (a "alça" de arrastar). As cores vêm dos tokens, então acompanha o tema.
 */
export function Logo({ size = 28, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className={className}>
      <polygon points="5,26 21,26 27,9 11,9" fill="var(--obj1)" opacity="0.16" />
      <path d="M21 26 L27 9 M11 9 L27 9" stroke="var(--obj-muted)" strokeWidth="1.4" strokeDasharray="2.4 2.4" strokeLinecap="round" fill="none" />
      <path d="M5 26 L17.5 26" stroke="var(--obj1)" strokeWidth="2.8" strokeLinecap="round" />
      <polygon points="17,22.6 22.6,26 17,29.4" fill="var(--obj1)" />
      <path d="M5 26 L9.2 14.1" stroke="var(--obj2)" strokeWidth="2.8" strokeLinecap="round" />
      <polygon points="12.5,14.9 6.1,12.6 11,9" fill="var(--obj2)" />
      <circle cx="27" cy="9" r="3" fill="var(--bg)" stroke="var(--text)" strokeWidth="1.8" />
      <circle cx="5" cy="26" r="2" fill="var(--text)" />
    </svg>
  );
}

/** Título da aba do navegador: "<página> · Equação Viva". `null` não mexe no título (outro componente cuida dele). */
export function useTitle(page?: string | null) {
  useEffect(() => {
    if (page === null) return;
    document.title = page ? `${page} · ${SITE_NAME}` : `${SITE_NAME} · ${SITE_TAGLINE}`;
  }, [page]);
}

/** Variável CSS --tc com a cor de uma trilha, para selos, ícones e bordas. */
export const trackColor = (color: ObjColor): CSSProperties => ({ "--tc": `var(--${color})` }) as CSSProperties;
