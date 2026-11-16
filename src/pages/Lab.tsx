import { useMemo, useRef, type ReactNode } from "react";
import { fmt } from "../math/format";
import { compileExpr, parseBracketNumbers, splitTuple, type CompiledExpr } from "../math/parse";
import { TransformView } from "../modules/shared2d";
import { useUrlState } from "../state/useUrlState";
import { Segmented, Slider } from "../ui/controls";
import { Arrow, Dot, ImplicitCurve, Plane2D, Plot, type P2 } from "../viz2d";
import { Arrow3D, ImplicitSurface, Point3D, Scene3D, Segments3D, type V3 } from "../viz3d";

type Scope = Record<string, number>;

type Item =
  | { kind: "vazio" }
  | { kind: "erro"; msg: string }
  | { kind: "def"; name: string; value: number }
  | { kind: "valor"; f: CompiledExpr }
  | { kind: "funcao-x"; f: CompiledExpr }
  | { kind: "funcao-y"; f: CompiledExpr }
  | { kind: "implicita"; F: CompiledExpr }
  | { kind: "parametrica"; fs: CompiledExpr[] }
  | { kind: "ponto"; fs: CompiledExpr[] }
  | { kind: "vetor"; fs: CompiledExpr[]; name?: string }
  | { kind: "matriz"; M: number[][]; name?: string }
  | { kind: "superficie-z"; f: CompiledExpr }
  | { kind: "superficie"; F: CompiledExpr };

const KIND_LABEL: Record<Item["kind"], string> = {
  vazio: "",
  erro: "",
  def: "parâmetro",
  valor: "valor numérico",
  "funcao-x": "função y = f(x)",
  "funcao-y": "função x = g(y)",
  implicita: "curva implícita F(x, y) = 0",
  parametrica: "curva paramétrica em t",
  ponto: "ponto",
  vetor: "vetor (a partir da origem)",
  matriz: "matriz: transforma a grade",
  "superficie-z": "superfície z = f(x, y)",
  superficie: "superfície implícita F(x, y, z) = 0",
};

const COLORS = ["obj1", "obj2", "obj3", "obj4", "obj5", "obj6"];
const IDENT = /^[A-Za-z_]\w*$/;
const has = (c: CompiledExpr, v: string) => c.vars.includes(v);

function splitEq(src: string): [string, string] | null {
  const m = src.match(/^(.*?)(?<![<>=!])=(?!=)(.*)$/);
  return m ? [m[1].trim(), m[2].trim()] : null;
}

function bracketVector(src: string): CompiledExpr[] | null {
  const s = src.trim();
  if (!s.startsWith("[") || !s.endsWith("]") || s.slice(1, -1).includes("[")) return null;
  const parts = splitTuple(`(${s.slice(1, -1)})`);
  return parts ? parts.map(compileExpr) : null;
}

function analyze(src: string, dim: 2 | 3): Item {
  const s = src.trim();
  if (s === "") return { kind: "vazio" };
  try {
    const eq = splitEq(s);
    const lhs = eq ? eq[0] : "";
    const rhs = eq ? eq[1] : s;
    // vetores e matrizes: "v = [2, 1]" ou "[2, 1]"
    if (!eq || IDENT.test(lhs)) {
      const name = eq ? lhs : undefined;
      const lit = parseBracketNumbers(rhs);
      if (lit && Array.isArray(lit[0])) {
        const M = lit as number[][];
        if (dim === 2 && M.length === 2 && M.every((r) => r.length === 2)) return { kind: "matriz", M, name };
        return { kind: "erro", msg: dim === 2 ? "No 2D, a matriz deve ser 2×2, como [[1,2],[0,1]]." : "Matrizes só são desenhadas no modo 2D." };
      }
      const vec = bracketVector(rhs);
      if (vec) {
        if (vec.length !== dim) return { kind: "erro", msg: `Um vetor no ${dim}D precisa de ${dim} coordenadas.` };
        return { kind: "vetor", fs: vec, name };
      }
    }
    // tuplas: ponto ou curva paramétrica
    const tuple = !eq ? splitTuple(s) : null;
    if (tuple) {
      if (tuple.length !== dim) return { kind: "erro", msg: `No modo ${dim}D use ${dim} coordenadas, como ${dim === 2 ? "(2, 3)" : "(1, 2, 3)"}.` };
      const fs = tuple.map(compileExpr);
      if (fs.some((f) => has(f, "x") || has(f, "y") || has(f, "z"))) return { kind: "erro", msg: "Nas coordenadas use só t (curva) ou números e parâmetros (ponto)." };
      return fs.some((f) => has(f, "t")) ? { kind: "parametrica", fs } : { kind: "ponto", fs };
    }
    // definição de parâmetro: "a = 2"
    if (eq && IDENT.test(lhs) && !["x", "y", "z", "t"].includes(lhs)) {
      const c = compileExpr(rhs);
      if (c.vars.length === 0 && c.params.length === 0) {
        const value = c.fn({});
        if (Number.isFinite(value)) return { kind: "def", name: lhs, value };
      }
    }
    if (dim === 2) {
      if (!eq) {
        const f = compileExpr(s);
        if (has(f, "y") || has(f, "z")) return { kind: "erro", msg: "Para uma curva com y, escreva uma equação (com =)." };
        if (has(f, "t")) return { kind: "erro", msg: "Para usar t, escreva uma curva paramétrica, como (cos(t), sin(t))." };
        return has(f, "x") ? { kind: "funcao-x", f } : { kind: "valor", f };
      }
      if (lhs === "y") {
        const f = compileExpr(rhs);
        if (!has(f, "y")) return { kind: "funcao-x", f };
      }
      if (lhs === "x") {
        const f = compileExpr(rhs);
        if (!has(f, "x")) return { kind: "funcao-y", f };
      }
      const F = compileExpr(`(${lhs}) - (${rhs})`);
      if (has(F, "z") || has(F, "t")) return { kind: "erro", msg: "No 2D use apenas x e y (troque para 3D para usar z)." };
      return { kind: "implicita", F };
    }
    // 3D
    if (!eq) {
      const f = compileExpr(s);
      if (has(f, "z") || has(f, "t")) return { kind: "erro", msg: "Escreva uma equação, como z = x^2 + y^2 ou x^2 + y^2 + z^2 = 4." };
      return has(f, "x") || has(f, "y") ? { kind: "superficie-z", f } : { kind: "valor", f };
    }
    if (lhs === "z") {
      const f = compileExpr(rhs);
      if (!has(f, "z")) return { kind: "superficie-z", f };
    }
    const F = compileExpr(`(${lhs}) - (${rhs})`);
    if (has(F, "t")) return { kind: "erro", msg: "Para usar t, escreva uma curva paramétrica, como (cos(t), sin(t), t)." };
    return { kind: "superficie", F };
  } catch (e) {
    return { kind: "erro", msg: (e as Error).message };
  }
}

function paramsOf(it: Item): string[] {
  switch (it.kind) {
    case "valor":
    case "funcao-x":
    case "funcao-y":
    case "superficie-z":
      return it.f.params;
    case "implicita":
    case "superficie":
      return it.F.params;
    case "parametrica":
    case "ponto":
    case "vetor":
      return it.fs.flatMap((f) => f.params);
    default:
      return [];
  }
}

const DEF2 = ["y = a*x^2 - 2", "x^2 + y^2 = 9", "(2*cos(t), 2*sin(2*t))", "(1, 2)", "v = [2, -1]"].join("\n");
const DEF3 = ["z = (x^2 - y^2)/4", "(2*cos(t), 2*sin(t), t/3)", "(1, 1, 2)", "[1, 2, 2]"].join("\n");

function parseP(s: string): Scope {
  const out: Scope = {};
  for (const kv of s.split(",")) {
    const [k, v] = kv.split(":");
    if (k && v !== undefined && Number.isFinite(Number(v))) out[k] = Number(v);
  }
  return out;
}

export default function Lab() {
  const [s, set] = useUrlState({ d: "2", e2: DEF2, e3: DEF3, p: "", h: [] as number[], t0: 0, t1: 6.283 });
  const dim = (s.d === "3" ? 3 : 2) as 2 | 3;
  const text = dim === 2 ? s.e2 : s.e3;
  const lines = text.split("\n");
  const items = useMemo(() => lines.map((l) => analyze(l, dim)), [text, dim]); // eslint-disable-line react-hooks/exhaustive-deps
  const pvals = parseP(s.p);
  const defs: Scope = {};
  items.forEach((it) => {
    if (it.kind === "def") defs[it.name] = it.value;
  });
  const freeParams = [...new Set(items.flatMap(paramsOf))].filter((p) => !(p in defs)).sort();
  const scope: Scope = { ...Object.fromEntries(freeParams.map((p) => [p, pvals[p] ?? 1])), ...defs };
  const scopeKey = JSON.stringify(scope);
  const hidden = new Set(s.h as number[]);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const setLines = (ls: string[]) => set(dim === 2 ? { e2: ls.join("\n") } : { e3: ls.join("\n") });
  const setParam = (k: string, v: number) => set({ p: Object.entries({ ...pvals, [k]: v }).map(([a, b]) => `${a}:${Math.round(b * 1000) / 1000}`).join(",") });
  const focus = (i: number) => window.setTimeout(() => inputs.current[i]?.focus(), 0);
  const anyParam = items.some((it) => it.kind === "parametrica");

  const ev = (f: CompiledExpr, extra: Scope = {}) => f.fn({ ...scope, ...extra });

  const shapes: ReactNode[] = [];
  items.forEach((it, i) => {
    if (hidden.has(i)) return;
    const color = COLORS[i % COLORS.length];
    const cv = `var(--${color})`;
    const key = `${i}-${lines[i]}`;
    if (dim === 2) {
      if (it.kind === "funcao-x") shapes.push(<Plot.OfX key={key} y={(x) => ev(it.f, { x })} color={cv} weight={3} />);
      else if (it.kind === "funcao-y") shapes.push(<Plot.OfY key={key} x={(y) => ev(it.f, { y })} color={cv} weight={3} />);
      else if (it.kind === "implicita") shapes.push(<ImplicitCurve key={`${key}${scopeKey}`} F={(x, y) => ev(it.F, { x, y })} color={cv} res={110} />);
      else if (it.kind === "parametrica")
        shapes.push(<Plot.Parametric key={key} xy={(t) => [ev(it.fs[0], { t }), ev(it.fs[1], { t })]} domain={[s.t0, Math.max(s.t0 + 0.01, s.t1)]} color={cv} weight={3} />);
      else if (it.kind === "ponto") shapes.push(<Dot key={key} at={[ev(it.fs[0]), ev(it.fs[1])]} color={cv} label={`(${fmt(ev(it.fs[0]))}; ${fmt(ev(it.fs[1]))})`} />);
      else if (it.kind === "vetor") shapes.push(<Arrow key={key} tip={[ev(it.fs[0]), ev(it.fs[1])] as P2} color={cv} label={it.name} />);
      else if (it.kind === "matriz") shapes.push(<TransformView key={key} M={it.M} gridColor={cv} />);
    } else {
      if (it.kind === "superficie-z")
        shapes.push(<ImplicitSurface key={key} F={(x, y, z) => z - ev(it.f, { x, y })} R={4} res={34} color={color} opacity={0.9} deps={[lines[i], scopeKey]} />);
      else if (it.kind === "superficie")
        shapes.push(<ImplicitSurface key={key} F={(x, y, z) => ev(it.F, { x, y, z })} R={4} res={34} color={color} opacity={0.9} deps={[lines[i], scopeKey]} />);
      else if (it.kind === "parametrica") {
        const pts: V3[] = [];
        const N = 300, a = s.t0, b = Math.max(s.t0 + 0.01, s.t1);
        let prev: V3 | null = null;
        for (let k = 0; k <= N; k++) {
          const t = a + ((b - a) * k) / N;
          const p: V3 = [ev(it.fs[0], { t }), ev(it.fs[1], { t }), ev(it.fs[2], { t })];
          const ok = p.every(Number.isFinite);
          if (prev && ok) pts.push(prev, p);
          prev = ok ? p : null;
        }
        shapes.push(<Segments3D key={key} points={pts} color={color} width={3} />);
      } else if (it.kind === "ponto") {
        const p = it.fs.map((f) => ev(f)) as V3;
        shapes.push(<Point3D key={key} at={p} color={color} label={`(${p.map((x) => fmt(x)).join("; ")})`} />);
      } else if (it.kind === "vetor") shapes.push(<Arrow3D key={key} to={it.fs.map((f) => ev(f)) as V3} color={color} label={it.name} />);
    }
  });

  return (
    <div className="lab">
      <section className="lab-list" aria-label="Lista de expressões">
        <h1 style={{ fontSize: 20, margin: "0 0 4px" }}>Laboratório livre</h1>
        <p className="summary" style={{ marginTop: 0 }}>
          Digite expressões; o tipo é detectado sozinho. Letras livres (a, b, k…) viram sliders.
        </p>
        <div className="row" style={{ marginBottom: 12 }}>
          <Segmented
            label="Dimensão"
            value={s.d as "2" | "3"}
            onChange={(d) => set({ d, h: [] })}
            options={[
              { value: "2", label: "2D" },
              { value: "3", label: "3D" },
            ]}
          />
        </div>
        {lines.map((line, i) => {
          const it = items[i];
          const color = COLORS[i % COLORS.length];
          const off = hidden.has(i);
          const value = it.kind === "valor" ? ev(it.f) : null;
          return (
            <div className="lab-item" key={i}>
              <button
                type="button"
                className={`swatch ${off ? "off" : ""}`}
                style={{ background: `var(--${color})` }}
                aria-label={off ? `Mostrar expressão ${i + 1}` : `Esconder expressão ${i + 1}`}
                aria-pressed={!off}
                onClick={() => set({ h: off ? (s.h as number[]).filter((x) => x !== i) : [...(s.h as number[]), i] })}
              />
              <div style={{ minWidth: 0 }}>
                <input
                  ref={(el) => {
                    inputs.current[i] = el;
                  }}
                  className="expr"
                  value={line}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label={`Expressão ${i + 1}`}
                  placeholder={dim === 2 ? "ex.: y = sin(x)" : "ex.: z = x*y"}
                  onChange={(e) => setLines(lines.map((l, j) => (j === i ? e.target.value : l)))}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      setLines([...lines.slice(0, i + 1), "", ...lines.slice(i + 1)]);
                      focus(i + 1);
                    } else if (e.key === "Backspace" && line === "" && lines.length > 1) {
                      e.preventDefault();
                      setLines(lines.filter((_, j) => j !== i));
                      focus(Math.max(0, i - 1));
                    }
                  }}
                />
                {it.kind === "erro" ? (
                  <div className="err">{it.msg}</div>
                ) : it.kind !== "vazio" ? (
                  <div className="kind">
                    {KIND_LABEL[it.kind]}
                    {value !== null && ` = ${fmt(value, { maxDen: 0, digits: 6 })}`}
                    {it.kind === "def" && ` ${it.name} = ${fmt(it.value)}`}
                  </div>
                ) : null}
              </div>
              <button type="button" className="btn small" aria-label={`Remover expressão ${i + 1}`} onClick={() => setLines(lines.length > 1 ? lines.filter((_, j) => j !== i) : [""])}>
                ×
              </button>
            </div>
          );
        })}
        <button
          type="button"
          className="btn"
          onClick={() => {
            setLines([...lines, ""]);
            focus(lines.length);
          }}
        >
          + Expressão
        </button>
        {(freeParams.length > 0 || anyParam) && (
          <div className="block" style={{ marginTop: 16 }}>
            <div className="block-title">Parâmetros</div>
            {freeParams.map((p) => (
              <Slider key={p} label={p} value={scope[p]} onChange={(v) => setParam(p, v)} min={-5} max={5} step={0.1} />
            ))}
            {anyParam && (
              <>
                <Slider label="t mín" value={s.t0} onChange={(v) => set({ t0: v })} min={-10} max={10} step={0.1} />
                <Slider label="t máx" value={s.t1} onChange={(v) => set({ t1: v })} min={-10} max={20} step={0.1} />
              </>
            )}
          </div>
        )}
        <details className="block" style={{ marginTop: 16 }}>
          <summary style={{ cursor: "pointer", fontWeight: 600 }}>O que dá para digitar</summary>
          <ul style={{ paddingLeft: 18, fontSize: 14, lineHeight: 1.7 }}>
            {dim === 2 ? (
              <>
                <li><code>y = x^2 - 3</code> função</li>
                <li><code>x^2 + y^2 = 9</code>, <code>x*y = 1</code> curva implícita</li>
                <li><code>(cos(t), sin(2t))</code> curva paramétrica</li>
                <li><code>(2, 3)</code> ponto · <code>v = [2, 3]</code> vetor</li>
                <li><code>M = [[1,2],[0,1]]</code> matriz aplicada à grade</li>
                <li><code>a = 2</code> fixa um parâmetro</li>
              </>
            ) : (
              <>
                <li><code>z = x^2 + y^2</code> superfície</li>
                <li><code>x^2 + y^2 - z^2 = 1</code> superfície implícita</li>
                <li><code>(cos(t), sin(t), t/4)</code> curva no espaço</li>
                <li><code>(1, 2, 3)</code> ponto · <code>[1, 2, 2]</code> vetor</li>
              </>
            )}
            <li>Funções: sin, cos, tan, sqrt, exp, log, abs; constantes pi e e. Use ponto como separador decimal.</li>
          </ul>
        </details>
      </section>
      <div className="lab-graph">
        {dim === 2 ? (
          <Plane2D x={[-6, 6]} y={[-5, 5]} label="Gráfico do laboratório">
            {shapes}
          </Plane2D>
        ) : (
          <Scene3D R={4} label="Cena 3D do laboratório">
            {shapes}
          </Scene3D>
        )}
      </div>
    </div>
  );
}
