import { cl, o1, o2, o3, tex, texDec, texLinear, texRootApprox, texTuple } from "../math/format";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Presets, ResultRow, Results, Segmented, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Dot, DraggablePoint, InfLine, Plane2D, Plot, Segment, type P2 } from "../viz2d";

const sqTerm = (v: string, c: number) => (Math.abs(c) < 1e-12 ? `${v}^2` : `(${v} ${c < 0 ? "+" : "-"} ${tex(Math.abs(c))})^2`);

export default function C2() {
  const [s, set, reset] = useUrlState({ C: [0, 0], a: 2, b: 1.5, eixo: "h", s: 0.8, ramo: 1 });
  const [h, k] = s.C as P2;
  const { a, b } = s;
  const horiz = s.eixo === "h";
  const c = Math.sqrt(a * a + b * b);
  const e = c / a;
  // ponto da hipérbole em função de (ramo, s)
  const at = (br: number, t: number): P2 =>
    horiz ? [h + br * a * Math.cosh(t), k + b * Math.sinh(t)] : [h + b * Math.sinh(t), k + br * a * Math.cosh(t)];
  const F1: P2 = horiz ? [h + c, k] : [h, k + c];
  const F2: P2 = horiz ? [h - c, k] : [h, k - c];
  const P = at(s.ramo, s.s);
  const d1 = Math.hypot(P[0] - F1[0], P[1] - F1[1]);
  const d2 = Math.hypot(P[0] - F2[0], P[1] - F2[1]);
  const slope = horiz ? b / a : a / b;

  const general = horiz ? `\\dfrac{(x - h)^2}{a^2} - \\dfrac{(y - k)^2}{b^2} = 1` : `\\dfrac{(y - k)^2}{a^2} - \\dfrac{(x - h)^2}{b^2} = 1`;
  const current = horiz
    ? `\\dfrac{${sqTerm("x", h)}}{${tex(a * a)}} - \\dfrac{${sqTerm("y", k)}}{${tex(b * b)}} = 1`
    : `\\dfrac{${sqTerm("y", k)}}{${tex(a * a)}} - \\dfrac{${sqTerm("x", h)}}{${tex(b * b)}} = 1`;
  // forma geral
  const [A, Cc, D, E, F] = horiz
    ? [b * b, -a * a, -2 * b * b * h, 2 * a * a * k, b * b * h * h - a * a * k * k - a * a * b * b]
    : [-a * a, b * b, 2 * a * a * h, -2 * b * b * k, b * b * k * k - a * a * h * h - a * a * b * b];
  const expanded = `${texLinear([A, Cc, D, E], ["x^2", "y^2", "x", "y"], F)} = 0`;
  const rect: P2[] = horiz
    ? [[h - a, k - b], [h + a, k - b], [h + a, k + b], [h - a, k + b]]
    : [[h - b, k - a], [h + b, k - a], [h + b, k + a], [h - b, k + a]];

  const project = (p: P2): { br: number; t: number } => {
    const br = horiz ? (p[0] >= h ? 1 : -1) : p[1] >= k ? 1 : -1;
    const t = horiz ? Math.asinh((p[1] - k) / b) : Math.asinh((p[0] - h) / b);
    return { br, t: Math.max(-3, Math.min(3, t)) };
  };

  const graph = (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Hipérbole com focos, assíntotas e um ponto P">
      {[0, 1, 2, 3].map((i) => (
        <Segment key={i} a={rect[i]} b={rect[(i + 1) % 4]} color="var(--obj-muted)" dashed weight={1} />
      ))}
      <InfLine p={[h, k]} v={horiz ? [a, b] : [b, a]} color="var(--obj6)" dashed weight={1.5} />
      <InfLine p={[h, k]} v={horiz ? [a, -b] : [b, -a]} color="var(--obj6)" dashed weight={1.5} />
      <Plot.Parametric xy={(t) => at(1, t)} domain={[-3.2, 3.2]} color="var(--obj1)" weight={3} />
      <Plot.Parametric xy={(t) => at(-1, t)} domain={[-3.2, 3.2]} color="var(--obj1)" weight={3} />
      <Segment a={P} b={F1} color="var(--obj2)" weight={2.5} />
      <Segment a={P} b={F2} color="var(--obj3)" weight={2.5} />
      <Dot at={F1} color="var(--obj5)" label="F₁" dir="s" />
      <Dot at={F2} color="var(--obj5)" label="F₂" dir="s" />
      <Dot at={at(1, 0)} color="var(--obj1)" r={3.5} />
      <Dot at={at(-1, 0)} color="var(--obj1)" r={3.5} />
      <DraggablePoint point={s.C as P2} onMove={(p) => set({ C: p })} color="var(--obj6)" label="C" dir="sw" />
      <DraggablePoint
        point={P}
        onMove={(p) => {
          const r = project(p);
          set({ ramo: r.br, s: r.t });
        }}
        constrain={(p) => {
          const r = project(p);
          return at(r.br, r.t);
        }}
        noSnap
        color="var(--obj4)"
        label="P"
      />
    </Plane2D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            A hipérbole é o conjunto dos pontos P cuja <strong>diferença das distâncias</strong> aos focos, em módulo, é constante: |d₁ − d₂| = 2a.
            Arraste P pelos dois ramos e confira.
          </p>
          <p>
            Aqui c² = a² + b² (c é sempre o maior), então e = c/a &gt; 1. As retas tracejadas são as assíntotas: a curva se aproxima delas sem
            nunca tocar. Elas passam pelas diagonais do retângulo de lados 2a e 2b.
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation general={general} current={o1(current)} />
        <LiveEquation label="Forma geral (expandida)" current={expanded} />
      </Block>
      <Block title="Controles">
        <div className="controls">
          <div className="row">
            <Segmented label="Eixo real" value={s.eixo as "h" | "v"} onChange={(eixo) => set({ eixo })} options={[{ value: "h", label: "Eixo real horizontal" }, { value: "v", label: "Vertical" }]} />
          </div>
          <VecInput label={cl("obj6", "C")} value={s.C} onChange={(x) => set({ C: x })} />
          <Slider tex="a" value={a} onChange={(v) => set({ a: v })} min={0.5} max={5} step={0.25} />
          <Slider tex="b" value={b} onChange={(v) => set({ b: v })} min={0.5} max={5} step={0.25} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Horizontal", apply: () => set({ C: [0, 0], a: 2, b: 1.5, eixo: "h" }) },
          { label: "Vertical", apply: () => set({ C: [0, 0], a: 1.5, b: 2, eixo: "v" }) },
          { label: "Equilátera (a = b)", apply: () => set({ C: [0, 0], a: 2, b: 2, eixo: "h" }) },
          { label: "Bem aberta", apply: () => set({ C: [0, 0], a: 1, b: 4, eixo: "h" }) },
          { label: "Transladada", apply: () => set({ C: [1, -1], a: 2, b: 1, eixo: "h" }) },
        ]}
      />
      <Block title="Resultados">
        <Results>
          <ResultRow label="Centro" tex={texTuple([h, k])} />
          <ResultRow label="c" tex={`\\sqrt{${tex(a * a)} + ${tex(b * b)}} = ${texRootApprox(c * c)}`} />
          <ResultRow label="Focos" tex={`${texTuple(F1.map((x) => Math.round(x * 100) / 100))},\\ ${texTuple(F2.map((x) => Math.round(x * 100) / 100))}`} />
          <ResultRow label="Vértices" tex={`${texTuple(at(1, 0))},\\ ${texTuple(at(-1, 0))}`} />
          <ResultRow label="Assíntotas" tex={`y ${k === 0 ? "" : `${k > 0 ? "-" : "+"} ${tex(Math.abs(k))}`} = \\pm ${tex(slope)}\\,(x ${h === 0 ? "" : `${h > 0 ? "-" : "+"} ${tex(Math.abs(h))}`})`.replace("(x )", "x")} />
          <ResultRow label="Excentricidade" tex={`e = \\dfrac{c}{a} \\approx ${texDec(e, 3)}`} />
          <ResultRow label="|d₁ − d₂|" tex={`|${o2(texDec(d1))} - ${o3(texDec(d2))}| = ${texDec(Math.abs(d1 - d2))} = 2\\cdot${tex(a)}`} />
        </Results>
      </Block>
    </ModuleLayout>
  );
}
