import { cl, o1, o2, o3, tex, texDec, texLinear, texRootApprox, texTuple } from "../math/format";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Dot, DraggablePoint, Plane2D, Plot, Segment, type P2 } from "../viz2d";

const sqTerm = (v: string, c: number) => (Math.abs(c) < 1e-12 ? `${v}^2` : `(${v} ${c < 0 ? "+" : "-"} ${tex(Math.abs(c))})^2`);

export default function C1() {
  const [s, set, reset] = useUrlState({ C: [0, 0], a: 4, b: 2.5, t: 1 });
  const [h, k] = s.C as P2;
  const { a, b } = s;
  const circle = Math.abs(a - b) < 1e-9;
  const horiz = a >= b;
  const big = Math.max(a, b), small = Math.min(a, b);
  const c = Math.sqrt(Math.max(0, big * big - small * small));
  const e = c / big;
  const F1: P2 = horiz ? [h + c, k] : [h, k + c];
  const F2: P2 = horiz ? [h - c, k] : [h, k - c];
  const P: P2 = [h + a * Math.cos(s.t), k + b * Math.sin(s.t)];
  const d1 = Math.hypot(P[0] - F1[0], P[1] - F1[1]);
  const d2 = Math.hypot(P[0] - F2[0], P[1] - F2[1]);

  const general = `\\dfrac{(x - h)^2}{a^2} + \\dfrac{(y - k)^2}{b^2} = 1`;
  const current = `\\dfrac{${sqTerm("x", h)}}{${tex(a * a)}} + \\dfrac{${sqTerm("y", k)}}{${tex(b * b)}} = 1`;
  // forma geral expandida: b²x² + a²y² − 2b²h x − 2a²k y + (b²h² + a²k² − a²b²) = 0
  const A = b * b, Cc = a * a, D = -2 * b * b * h, E = -2 * a * a * k, F = b * b * h * h + a * a * k * k - a * a * b * b;
  const expanded = `${texLinear([A, Cc, D, E], ["x^2", "y^2", "x", "y"], F)} = 0`;

  const graph = (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Elipse com focos e um ponto P">
      <Plot.Parametric xy={(t) => [h + a * Math.cos(t), k + b * Math.sin(t)]} domain={[0, 2 * Math.PI]} color="var(--obj1)" weight={3} />
      {!circle && (
        <>
          <Segment a={horiz ? [h - big, k] : [h, k - big]} b={horiz ? [h + big, k] : [h, k + big]} color="var(--obj-muted)" dashed weight={1} />
          <Segment a={P} b={F1} color="var(--obj2)" weight={2.5} />
          <Segment a={P} b={F2} color="var(--obj3)" weight={2.5} />
          <Dot at={F1} color="var(--obj5)" label="F₁" dir="s" />
          <Dot at={F2} color="var(--obj5)" label="F₂" dir="s" />
        </>
      )}
      {circle && <Segment a={[h, k]} b={P} color="var(--obj2)" weight={2.5} />}
      <Dot at={[h + a, k]} color="var(--obj1)" r={3.5} />
      <Dot at={[h - a, k]} color="var(--obj1)" r={3.5} />
      <Dot at={[h, k + b]} color="var(--obj1)" r={3.5} />
      <Dot at={[h, k - b]} color="var(--obj1)" r={3.5} />
      <DraggablePoint point={s.C as P2} onMove={(p) => set({ C: p })} color="var(--obj6)" label="C" dir="sw" />
      <DraggablePoint
        point={P}
        onMove={(p) => set({ t: Math.atan2((p[1] - k) / b, (p[0] - h) / a) })}
        constrain={(p) => {
          const t = Math.atan2((p[1] - k) / b, (p[0] - h) / a);
          return [h + a * Math.cos(t), k + b * Math.sin(t)];
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
            A elipse é o conjunto dos pontos P cuja <strong>soma das distâncias</strong> a dois pontos fixos (os focos) é constante e igual a 2a,
            onde a é o semieixo maior. Arraste P pela curva e veja d₁ + d₂ não mudar.
          </p>
          <p>
            Com semieixos a e b, a distância do centro a cada foco é c, com a² = b² + c² (a sendo o maior). A excentricidade e = c/a mede o
            “achatamento”: e = 0 é uma circunferência, e perto de 1 é uma elipse bem alongada.
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
          <VecInput label={cl("obj6", "C")} value={s.C} onChange={(x) => set({ C: x })} />
          <Slider tex="a" value={a} onChange={(v) => set({ a: v })} min={0.5} max={6} step={0.25} />
          <Slider tex="b" value={b} onChange={(v) => set({ b: v })} min={0.5} max={6} step={0.25} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Elipse horizontal", apply: () => set({ C: [0, 0], a: 4, b: 2.5 }) },
          { label: "Elipse vertical", apply: () => set({ C: [1, 0], a: 2, b: 4 }) },
          { label: "Circunferência", apply: () => set({ C: [0, 0], a: 3, b: 3 }) },
          { label: "Bem achatada", apply: () => set({ C: [0, 0], a: 5, b: 1 }) },
          { label: "Transladada", apply: () => set({ C: [-1, 1.5], a: 3, b: 2 }) },
        ]}
      />
      <Block title="Resultados">
        <Results>
          <ResultRow label="Tipo">{circle ? "Circunferência (a = b)" : horiz ? "Elipse com eixo maior horizontal" : "Elipse com eixo maior vertical"}</ResultRow>
          <ResultRow label="Centro" tex={texTuple([h, k])} />
          {circle ? (
            <ResultRow label="Raio" tex={tex(a)} />
          ) : (
            <>
              <ResultRow label="c" tex={`\\sqrt{${tex(big * big)} - ${tex(small * small)}} = ${texRootApprox(c * c)}`} />
              <ResultRow label="Focos" tex={`${texTuple(F1.map((x) => Math.round(x * 100) / 100))},\\ ${texTuple(F2.map((x) => Math.round(x * 100) / 100))}`} />
              <ResultRow label="Excentricidade" tex={`e = \\dfrac{c}{${horiz ? "a" : "b"}} \\approx ${texDec(e, 3)}`} />
              <ResultRow label="d₁ + d₂" tex={`${o2(texDec(d1))} + ${o3(texDec(d2))} = ${texDec(d1 + d2)} = 2\\cdot${tex(big)}`} />
            </>
          )}
        </Results>
        {circle && (
          <div style={{ marginTop: 8 }}>
            <Note>Com a = b os dois focos coincidem com o centro: a elipse vira circunferência e e = 0.</Note>
          </div>
        )}
      </Block>
    </ModuleLayout>
  );
}
