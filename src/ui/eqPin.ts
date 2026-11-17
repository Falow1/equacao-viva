import { createContext } from "react";

/**
 * Qual equação viva aparece na barra do celular (entre o gráfico e o painel).
 * Cada LiveEquation se registra; vale a primeira habilitada na ordem da página
 * (pela posição no documento, para uma equação que aparece depois ao trocar de modo não passar na frente).
 */
export interface EqPin {
  set(id: string, tex: string, eligible: boolean, el?: Element | null): void;
  remove(id: string): void;
  subscribe(cb: () => void): () => void;
  get(): { id: string | null; tex: string | null };
}

type Entry = { tex: string; eligible: boolean; el: Element | null };

/** a vem antes de b na página? Sem elemento (ou fora do documento), vale a ordem de registro. */
const before = (a: Entry, b: Entry) =>
  !!a.el && !!b.el && a.el.isConnected && b.el.isConnected && !!(a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING);

export function createEqPin(): EqPin {
  const entries = new Map<string, Entry>();
  const listeners = new Set<() => void>();
  let snap: { id: string | null; tex: string | null } = { id: null, tex: null };
  const recompute = () => {
    let id: string | null = null;
    let best: Entry | null = null;
    for (const [k, e] of entries) {
      if (!e.eligible) continue;
      if (!best || before(e, best)) {
        id = k;
        best = e;
      }
    }
    const tex = best?.tex ?? null;
    if (id !== snap.id || tex !== snap.tex) {
      snap = { id, tex };
      listeners.forEach((l) => l());
    }
  };
  return {
    set(id, tex, eligible, el = null) {
      entries.set(id, { tex, eligible, el });
      recompute();
    },
    remove(id) {
      entries.delete(id);
      recompute();
    },
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    get: () => snap,
  };
}

export const EqPinContext = createContext<EqPin | null>(null);
