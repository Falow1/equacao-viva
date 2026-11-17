import { useRef, useState, type HTMLAttributes, type KeyboardEvent, type PointerEvent, type RefObject } from "react";
import { LANDSCAPE } from "./media";
import { useFocusedField } from "./viewport";

/** Alturas do gráfico no celular em pé, em % da área abaixo do cabeçalho. */
const SNAPS = { pequeno: 30, medio: 48, grande: 76 } as const;
type Snap = keyof typeof SNAPS;
const ORDER: Snap[] = ["pequeno", "medio", "grande"];
const KEY = "altura-grafico";

function readSnap(): Snap {
  try {
    const v = sessionStorage.getItem(KEY);
    return v && v in SNAPS ? (v as Snap) : "medio";
  } catch {
    return "medio";
  }
}

/**
 * Alça entre o gráfico e o painel no celular em pé.
 * Arrastar segue o dedo e, ao soltar, encaixa na altura mais próxima (pequeno, médio ou grande).
 * Tocar alterna entre médio e grande (do pequeno, volta ao médio). Com o teclado virtual aberto, o gráfico fica pequeno.
 * A barra inteira recebe o arraste vertical (touch-action: pan-x deixa o gesto horizontal para rolar a fórmula).
 */
export function useGraphSplit(container: RefObject<HTMLElement | null>) {
  const [snap, setSnapState] = useState<Snap>(readSnap);
  const [dragPct, setDragPct] = useState<number | null>(null);
  // Só encolhe para campos desta tela (painel ou lista); a busca do cabeçalho abre por cima e não precisa.
  const field = useFocusedField();
  const kb = !!field && !!container.current?.contains(field);
  const start = useRef<{ y: number; pct: number; cur: number; moved: boolean; id: number } | null>(null);
  const pct = dragPct ?? (kb ? SNAPS.pequeno : SNAPS[snap]);

  const setSnap = (s: Snap) => {
    setSnapState(s);
    try {
      sessionStorage.setItem(KEY, s);
    } catch {
      /* sem armazenamento */
    }
  };
  const nearest = (p: number) => ORDER.reduce((best, s) => (Math.abs(SNAPS[s] - p) < Math.abs(SNAPS[best] - p) ? s : best), "medio" as Snap);
  const toggle = () => setSnap(snap === "medio" ? "grande" : "medio");

  const finish = (tap: boolean) => {
    const s = start.current;
    start.current = null;
    if (!s) return;
    // a altura atual vem da ref: o estado da última renderização pode estar atrasado em relação ao dedo
    if (s.moved) setSnap(nearest(s.cur));
    else if (tap) toggle();
    setDragPct(null);
  };

  const barProps: HTMLAttributes<HTMLDivElement> = {
    onPointerDown: (e: PointerEvent<HTMLDivElement>) => {
      // Deitado não há alça (o gráfico fica ao lado); um toque na fórmula não deve mudar a altura guardada.
      if (e.button !== 0 || window.matchMedia(LANDSCAPE).matches) return;
      start.current = { y: e.clientY, pct, cur: pct, moved: false, id: e.pointerId };
      // com o dedo o navegador já captura sozinho; com o mouse, sem isso o arraste rápido escapa da barra
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* ponteiro já liberado */
      }
    },
    onPointerMove: (e: PointerEvent<HTMLDivElement>) => {
      const s = start.current;
      const h = container.current?.clientHeight ?? 0;
      if (!s || s.id !== e.pointerId || h <= 0) return;
      const dy = e.clientY - s.y;
      if (!s.moved) {
        if (Math.abs(dy) < 6) return;
        s.moved = true;
      }
      s.cur = Math.min(84, Math.max(18, s.pct + (dy / h) * 100));
      setDragPct(s.cur);
    },
    onPointerUp: () => finish(true),
    onPointerCancel: () => finish(false),
  };

  const move = (d: 1 | -1) => setSnap(ORDER[Math.min(2, Math.max(0, ORDER.indexOf(snap) + d))]);
  const handleProps: HTMLAttributes<HTMLDivElement> = {
    role: "separator",
    tabIndex: 0,
    "aria-orientation": "horizontal",
    "aria-label": "Tamanho do gráfico (setas para cima e para baixo)",
    "aria-valuemin": SNAPS.pequeno,
    "aria-valuemax": SNAPS.grande,
    "aria-valuenow": Math.round(pct),
    onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowUp") move(-1);
      else if (e.key === "ArrowDown") move(1);
      else if (e.key === "Enter" || e.key === " ") toggle();
      else return;
      e.preventDefault();
    },
  };

  return {
    /** Vai no contêiner (grid): define a altura da linha do gráfico. */
    style: { "--graph-h": `${pct.toFixed(2)}%` } as Record<string, string>,
    dragging: dragPct !== null,
    barProps,
    handleProps,
  };
}

/** Só a alça (sem equação), usada no Laboratório. */
export function SplitHandle({ split, label }: { split: ReturnType<typeof useGraphSplit>; label?: string }) {
  return (
    <div className="eqbar" {...split.barProps}>
      <div className="eqbar-handle alone" {...split.handleProps} aria-label={label ?? split.handleProps["aria-label"]}>
        <span />
      </div>
    </div>
  );
}
