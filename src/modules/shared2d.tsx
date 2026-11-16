import { useEffect, useRef, useState } from "react";
import { Arrow, BasisGrid, F_SHAPE, Fill, applyM, type P2 } from "../viz2d";

/** Grade transformada + figura F + imagens de e1 e e2 para uma matriz 2×2. */
export function TransformView({ M, showF = true, labels = true, gridColor = "var(--obj4)" }: { M: number[][]; showF?: boolean; labels?: boolean; gridColor?: string }) {
  const b1: P2 = [M[0][0], M[1][0]];
  const b2: P2 = [M[0][1], M[1][1]];
  return (
    <>
      <BasisGrid b1={b1} b2={b2} n={10} color={gridColor} opacity={0.5} />
      {showF && <Fill points={F_SHAPE} color="var(--obj-muted)" opacity={0.18} />}
      {showF && <Fill points={F_SHAPE.map((p) => applyM(M, p))} color="var(--obj3)" opacity={0.45} stroke />}
      <Arrow tip={b1} color="var(--obj1)" label={labels ? "Ae₁" : undefined} />
      <Arrow tip={b2} color="var(--obj2)" label={labels ? "Ae₂" : undefined} />
    </>
  );
}

/** Animação de 0 até `to` em `ms` milissegundos (respeita movimento reduzido). */
export function useTween(initial: number) {
  const [v, setV] = useState(initial);
  const raf = useRef(0);
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const run = (from: number, to: number, ms = 1200) => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(to);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const e = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      setV(from + (to - from) * e);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  const stop = () => cancelAnimationFrame(raf.current);
  return [v, setV, run, stop] as const;
}
