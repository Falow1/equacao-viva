import { createContext } from "react";

/**
 * Qual equação viva aparece na barra do celular (entre o gráfico e o painel).
 * Cada LiveEquation se registra; vale a primeira registrada que estiver habilitada.
 * O Map guarda a ordem de inserção, e atualizar uma entrada não muda a posição dela.
 */
export interface EqPin {
  set(id: string, tex: string, eligible: boolean): void;
  remove(id: string): void;
  subscribe(cb: () => void): () => void;
  get(): { id: string | null; tex: string | null };
}

export function createEqPin(): EqPin {
  const entries = new Map<string, { tex: string; eligible: boolean }>();
  const listeners = new Set<() => void>();
  let snap: { id: string | null; tex: string | null } = { id: null, tex: null };
  const recompute = () => {
    let id: string | null = null;
    let tex: string | null = null;
    for (const [k, e] of entries) {
      if (e.eligible) {
        id = k;
        tex = e.tex;
        break;
      }
    }
    if (id !== snap.id || tex !== snap.tex) {
      snap = { id, tex };
      listeners.forEach((l) => l());
    }
  };
  return {
    set(id, tex, eligible) {
      entries.set(id, { tex, eligible });
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
