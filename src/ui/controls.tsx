import { useEffect, useId, useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import { fmt } from "../math/format";
import { Tex } from "./Tex";

/** Campo numérico que aceita vírgula ou ponto e só confirma valores válidos. */
export function NumberField({
  value,
  onChange,
  step = 0.5,
  min,
  max,
  label,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  max?: number;
  label?: string;
  className?: string;
}) {
  const shown = Number.isFinite(value) ? String(Math.round(value * 1000) / 1000).replace(".", ",") : "";
  const [text, setText] = useState(shown);
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    if (!focused) setText(shown);
  }, [shown, focused]);
  const parse = (s: string): number | null => {
    const t = s.trim().replace(",", ".").replace("−", "-");
    if (t === "" || t === "-" || t === ".") return null;
    if (/^-?\d+\/\d+$/.test(t)) {
      const [a, b] = t.split("/").map(Number);
      return b === 0 ? null : a / b;
    }
    const v = Number(t);
    return Number.isFinite(v) ? v : null;
  };
  const parsed = parse(text);
  return (
    <input
      className={`num ${parsed === null && text.trim() !== "" && text.trim() !== "-" ? "invalid" : ""} ${className ?? ""}`}
      inputMode="decimal"
      aria-label={label}
      value={focused ? text : shown}
      onFocus={() => {
        setFocused(true);
        setText(shown);
      }}
      onBlur={() => setFocused(false)}
      onChange={(e) => {
        setText(e.target.value);
        let v = parse(e.target.value);
        if (v !== null) {
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
          e.preventDefault();
          const k = e.shiftKey ? step / 5 : step;
          let v = (Number.isFinite(value) ? value : 0) + (e.key === "ArrowUp" ? k : -k);
          v = Math.round(v * 1000) / 1000;
          if (min !== undefined) v = Math.max(min, v);
          if (max !== undefined) v = Math.min(max, v);
          onChange(v);
          setText(String(v).replace(".", ","));
        }
      }}
    />
  );
}

/** Slider com rótulo (texto ou LaTeX) e campo numérico ao lado. */
export function Slider({
  label,
  tex,
  value,
  onChange,
  min,
  max,
  step = 0.5,
  className,
}: {
  label?: ReactNode;
  tex?: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  className?: string;
}) {
  const id = useId();
  return (
    <div className="control-row">
      <label htmlFor={id} className={className}>
        {tex ? <Tex>{tex}</Tex> : label}
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <NumberField value={value} onChange={onChange} step={step} label={typeof label === "string" ? label : tex} />
    </div>
  );
}

/** Entrada de vetor (a; b; c). */
export function VecInput({
  label,
  value,
  onChange,
  step = 0.5,
  className,
}: {
  label?: string;
  value: number[];
  onChange: (v: number[]) => void;
  step?: number;
  className?: string;
}) {
  return (
    <div className="vec-input">
      {label && (
        <span className={`vlabel ${className ?? ""}`}>
          <Tex>{label}</Tex>
        </span>
      )}
      <span className="paren">(</span>
      {value.map((x, i) => (
        <NumberField
          key={i}
          value={x}
          step={step}
          label={`${label ?? "vetor"} coordenada ${i + 1}`}
          onChange={(v) => onChange(value.map((y, j) => (j === i ? v : y)))}
        />
      ))}
      <span className="paren">)</span>
    </div>
  );
}

/** Entrada de matriz; `bar` desenha a barra da matriz aumentada antes dessa coluna. */
export function MatrixInput({
  value,
  onChange,
  bar,
  label,
  colClass,
}: {
  value: number[][];
  onChange: (M: number[][]) => void;
  bar?: number;
  label?: string;
  colClass?: (j: number) => string | undefined;
}) {
  const cols = value[0].length;
  return (
    <div className="row">
      {label && <Tex>{label}</Tex>}
      <div className="matrix-input" style={{ gridTemplateColumns: `repeat(${cols}, auto)` }} role="group" aria-label={label ?? "matriz"}>
        {value.map((r, i) =>
          r.map((x, j) => (
            <div key={`${i}-${j}`} className={`${bar !== undefined && j === bar ? "bar" : ""} ${colClass?.(j) ?? ""}`}>
              <NumberField
                value={x}
                label={`linha ${i + 1}, coluna ${j + 1}`}
                onChange={(v) => onChange(value.map((row, a) => row.map((y, b) => (a === i && b === j ? v : y))))}
              />
            </div>
          )),
        )}
      </div>
    </div>
  );
}

export interface Preset {
  label: string;
  apply: () => void;
}

export function Presets({ items }: { items: Preset[] }) {
  return (
    <div className="block">
      <div className="block-title">Exemplos</div>
      <div className="presets">
        {items.map((p) => (
          <button key={p.label} type="button" className="pill" onClick={p.apply}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: ReactNode }[];
  label: string;
}) {
  return (
    <div className="seg" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Block({ title, children }: { title?: ReactNode; children: ReactNode }) {
  return (
    <section className="block">
      {title && <h2 className="block-title">{title}</h2>}
      {children}
    </section>
  );
}

/**
 * Marca com `fade-r` as fórmulas que continuam além da borda direita (e ainda não foram roladas até o fim),
 * para o CSS desenhar um degradê indicando que há mais.
 */
function useScrollFade(ref: RefObject<HTMLElement | null>) {
  const update = () => {
    ref.current?.querySelectorAll<HTMLElement>(".katex-display").forEach((d) => {
      d.classList.toggle("fade-r", d.scrollWidth - d.clientWidth - d.scrollLeft > 2);
    });
  };
  useLayoutEffect(update);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, true);
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update, true);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
}

/** Equação viva: forma geral em cima e valores substituídos embaixo. `wide` reduz a fonte para fórmulas largas (matrizes 3×3). */
export function LiveEquation({ general, current, label, wide = false }: { general?: string; current: string; label?: string; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useScrollFade(ref);
  return (
    <div className={`equation${wide ? " wide" : ""}`} ref={ref}>
      {label && <div className="eq-label">{label}</div>}
      {general && (
        <div className="general">
          <div className="eq-tag">Forma geral</div>
          <Tex block>{general}</Tex>
        </div>
      )}
      <div className={`current${general ? " live" : ""}`}>
        {general && <div className="eq-tag">Agora</div>}
        <Tex block>{current}</Tex>
      </div>
    </div>
  );
}

export function Results({ children }: { children: ReactNode }) {
  return <div className="results">{children}</div>;
}

export function ResultRow({ label, tex, children }: { label: ReactNode; tex?: string; children?: ReactNode }) {
  return (
    <div className="result-row">
      <span className="rl">{label}</span>
      <span className="rv">{tex !== undefined ? <Tex>{tex}</Tex> : children}</span>
    </div>
  );
}

export function Note({ kind = "info", children }: { kind?: "info" | "ok" | "warn" | "bad"; children: ReactNode }) {
  return <div className={`note ${kind === "info" ? "" : kind}`} role={kind === "bad" || kind === "warn" ? "status" : undefined}>{children}</div>;
}

/** Mostra número formatado (texto). */
export const N = ({ v, d }: { v: number; d?: number }) => <span className="tabular">{fmt(v, d !== undefined ? { digits: d } : {})}</span>;
