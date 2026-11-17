import { cl, o1, o2, o3, tex, texDec, texLinear, texTuple } from "../math/format";
import { positive, useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Presets, ResultRow, Results, Segmented, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Dot, DraggablePoint, InfLine, Plane2D, Plot, Segment, type P2 } from "../viz2d";

type Ori = "cima" | "baixo" | "direita" | "esquerda";
const term = (v: string, c: number) => (Math.abs(c) < 1e-12 ? v : `(${v} ${c < 0 ? "+" : "-"} ${tex(Math.abs(c))})`);

export default function C3() {
  const [s, set, reset] = useUrlState({ V: [0, -1], p: 1, ori: "cima" as Ori, t: 2 }, { ori: ["cima", "baixo", "direita", "esquerda"] });
  const [h, k] = s.V as P2;
  const p = positive(s.p, 0.25);
  const ori = s.ori as Ori;
  const vertical = ori === "cima" || ori === "baixo";
  const sg = ori === "cima" || ori === "direita" ? 1 : -1;
  // ponto da parábola pelo parâmetro t (deslocamento ao longo da diretriz)
  const at = (t: number): P2 => (vertical ? [h + t, k + (sg * t * t) / (4 * p)] : [h + (sg * t * t) / (4 * p), k + t]);
  const F: P2 = vertical ? [h, k + sg * p] : [h + sg * p, k];
  const P = at(s.t);
  const foot: P2 = vertical ? [P[0], k - sg * p] : [h - sg * p, P[1]];
  const dF = Math.hypot(P[0] - F[0], P[1] - F[1]);
  const dD = Math.hypot(P[0] - foot[0], P[1] - foot[1]);

  const general = vertical ? `(x - h)^2 = ${sg < 0 ? "-" : ""}4p\\,(y - k)` : `(y - k)^2 = ${sg < 0 ? "-" : ""}4p\\,(x - h)`;
  const current = vertical
    ? `${term("x", h)}^2 = ${tex(sg * 4 * p)}\\,${term("y", k)}`
    : `${term("y", k)}^2 = ${tex(sg * 4 * p)}\\,${term("x", h)}`;
  // forma geral
  const expanded = vertical
    ? `${texLinear([1, -2 * h, -sg * 4 * p], ["x^2", "x", "y"], h * h + sg * 4 * p * k)} = 0`
    : `${texLinear([1, -2 * k, -sg * 4 * p], ["y^2", "y", "x"], k * k + sg * 4 * p * h)} = 0`;
  const directrixTex = vertical ? `y = ${tex(k - sg * p)}` : `x = ${tex(h - sg * p)}`;

  const graph = (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Parábola com foco e diretriz">
      <InfLine p={vertical ? [0, k - sg * p] : [h - sg * p, 0]} v={vertical ? [1, 0] : [0, 1]} color="var(--obj6)" weight={2} />
      <InfLine p={[h, k]} v={vertical ? [0, 1] : [1, 0]} color="var(--obj-muted)" dashed weight={1} />
      <Plot.Parametric xy={at} domain={[-12, 12]} color="var(--obj1)" weight={3} />
      <Segment a={P} b={F} color="var(--obj2)" weight={2.5} />
      <Segment a={P} b={foot} color="var(--obj3)" weight={2.5} />
      <Dot at={foot} color="var(--obj3)" r={4} />
      <Dot at={F} color="var(--obj5)" label="F" dir={vertical ? "e" : "n"} />
      <DraggablePoint point={s.V as P2} onMove={(v) => set({ V: v })} color="var(--obj1)" label="V" dir={vertical ? (sg > 0 ? "s" : "n") : sg > 0 ? "w" : "e"} />
      <DraggablePoint
        point={P}
        onMove={(q) => set({ t: vertical ? q[0] - h : q[1] - k })}
        constrain={(q) => at(vertical ? q[0] - h : q[1] - k)}
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
            A parábola é o conjunto dos pontos P que estão à <strong>mesma distância</strong> de um ponto fixo F (o foco) e de uma reta fixa d (a
            diretriz). Arraste P: os dois segmentos têm sempre o mesmo comprimento.
          </p>
          <p>
            O vértice V fica no meio do caminho entre o foco e a diretriz, a uma distância p de cada um. Quanto maior p, mais “aberta” a parábola. A
            excentricidade de toda parábola é e = 1.
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
          <Segmented<Ori>
            label="Abertura"
            value={ori}
            onChange={(o) => set({ ori: o })}
            options={[
              { value: "cima", label: "Para cima" },
              { value: "baixo", label: "Para baixo" },
              { value: "direita", label: "Direita" },
              { value: "esquerda", label: "Esquerda" },
            ]}
          />
          <VecInput label={o1("V")} value={s.V} onChange={(x) => set({ V: x })} />
          <Slider tex="p" value={p} onChange={(v) => set({ p: v })} min={0.25} max={4} step={0.25} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "y = x²/4", apply: () => set({ V: [0, 0], p: 1, ori: "cima" }) },
          { label: "Para baixo", apply: () => set({ V: [0, 2], p: 0.5, ori: "baixo" }) },
          { label: "Horizontal", apply: () => set({ V: [-2, 0], p: 1, ori: "direita" }) },
          { label: "Bem aberta", apply: () => set({ V: [0, -3], p: 3, ori: "cima" }) },
        ]}
      />
      <Block title="Resultados">
        <Results>
          <ResultRow label="Vértice" tex={texTuple([h, k])} />
          <ResultRow label="Foco" tex={cl("obj5", texTuple(F))} />
          <ResultRow label="Diretriz" tex={cl("obj6", directrixTex)} />
          <ResultRow label="Parâmetro" tex={`p = ${tex(p)},\\quad 4p = ${tex(4 * p)}`} />
          <ResultRow label="d(P, F) e d(P, d)" tex={`${o2(texDec(dF))} = ${o3(texDec(dD))}`} />
        </Results>
      </Block>
    </ModuleLayout>
  );
}
