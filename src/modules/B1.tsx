import { distPointLine, lineFromPoints, reduced, segmentary, tidyLine, type Line2 } from "../math/lines";
import { o1, o2, o3, o4, o5, tex, texAffine, texLinear, texTuple } from "../math/format";
import { clean } from "../math/tolerance";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, NumberField, Note, Presets, ResultRow, Results, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { Arrow, Dot, DraggablePoint, GeneralLine, Plane2D, type P2 } from "../viz2d";

export default function B1() {
  const [s, set, reset] = useUrlState({ P: [-2, -1], Q: [2, 2], abc: [3, -4, 2], src: "p", t: 0.5 });
  const P = s.P as P2, Q = s.Q as P2;
  const same = Math.hypot(Q[0] - P[0], Q[1] - P[1]) < 1e-9;
  const fromPts = lineFromPoints(P, Q);
  const line: Line2 | null = s.src === "c" ? { a: s.abc[0], b: s.abc[1], c: s.abc[2] } : fromPts;
  const valid = line && Math.hypot(line.a, line.b) > 1e-12;
  const d: P2 = [clean(Q[0] - P[0]), clean(Q[1] - P[1])];
  const red = valid ? reduced(line!) : null;
  const seg = valid ? segmentary(line!) : null;
  const X: P2 = [P[0] + s.t * d[0], P[1] + s.t * d[1]];

  /** Edita um coeficiente: a reta passa a ser definida pelos coeficientes e os pontos são projetados nela. */
  const editCoef = (i: number, val: number) => {
    const base = line ?? { a: 1, b: 0, c: 0 };
    const abc = [base.a, base.b, base.c];
    abc[i] = val;
    const l = { a: abc[0], b: abc[1], c: abc[2] };
    if (Math.hypot(l.a, l.b) < 1e-12) {
      set({ abc, src: "c" });
      return;
    }
    let p1 = distPointLine(P, l).foot;
    let p2 = distPointLine(Q, l).foot;
    if (Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) < 0.5) {
      const dir: P2 = [-l.b, l.a];
      const n = Math.hypot(...dir);
      p2 = [p1[0] + (2 * dir[0]) / n, p1[1] + (2 * dir[1]) / n];
    }
    p1 = [clean(p1[0], 1e-9), clean(p1[1], 1e-9)];
    p2 = [clean(p2[0], 1e-9), clean(p2[1], 1e-9)];
    set({ abc, P: p1, Q: p2, src: "c" });
  };
  const editReduced = (m: number, n: number) => {
    set({ abc: [m, -1, n], P: [0, n], Q: [2, 2 * m + n], src: "c" });
  };

  const general = valid ? `${texLinear([line!.a, line!.b], ["x", "y"], line!.c)} = 0` : "\\text{sem reta}";
  const tidy = valid ? tidyLine(line!) : null;

  const graph = (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Reta no plano">
      {valid && <GeneralLine a={line!.a} b={line!.b} c={line!.c} color="var(--obj1)" />}
      {valid && seg && (
        <>
          <Dot at={[seg.p, 0]} color="var(--obj5)" label={`p = ${fmtN(seg.p)}`} dir="se" />
          <Dot at={[0, seg.q]} color="var(--obj5)" label={`q = ${fmtN(seg.q)}`} dir="nw" />
        </>
      )}
      {!same && <Arrow tail={P} tip={Q} color="var(--obj3)" label="d" dir="nw" weight={3} />}
      {valid && <Arrow tail={P} tip={[P[0] + line!.a / Math.hypot(line!.a, line!.b) * 1.5, P[1] + line!.b / Math.hypot(line!.a, line!.b) * 1.5]} color="var(--obj4)" label="n" weight={3} />}
      {!same && <Dot at={X} color="var(--obj2)" label={`t = ${fmtN(s.t)}`} dir="se" />}
      <DraggablePoint point={P} onMove={(p) => set({ P: p, src: "p" })} color="var(--obj1)" label="A" dir="sw" />
      <DraggablePoint point={Q} onMove={(p) => set({ Q: p, src: "p" })} color="var(--obj1)" label="B" dir="ne" />
    </Plane2D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            Uma reta fica determinada por um ponto A e um vetor diretor <strong>d</strong> (aqui d = B − A). Todas as formas abaixo descrevem a mesma
            reta.
          </p>
          <p>
            Na forma geral ax + by + c = 0, o vetor <strong>n = (a; b)</strong> é normal (perpendicular) à reta. A forma reduzida y = mx + n mostra a
            inclinação m e o ponto onde a reta corta o eixo y; ela não existe para retas verticais. A segmentária x/p + y/q = 1 mostra onde a reta
            corta os dois eixos; não existe se a reta passa pela origem ou é paralela a um eixo.
          </p>
          <p>Na paramétrica, cada valor de t dá um ponto: arraste o slider t para percorrer a reta.</p>
        </>
      }
    >
      <Block title="Equação geral">
        <LiveEquation general="ax + by + c = 0" current={o1(general)} />
      </Block>
      {same && <Note kind="warn">A e B coincidem: dois pontos iguais não determinam uma reta. Afaste um deles.</Note>}
      {!valid && !same && <Note kind="warn">Com a = b = 0 a equação não descreve uma reta.</Note>}
      {valid && (
        <Block title="Todas as formas">
          <Results>
            <ResultRow label="Geral" tex={`${texLinear([tidy!.a, tidy!.b], ["x", "y"], tidy!.c)} = 0`} />
            <ResultRow label="Reduzida" tex={red ? `y = ${texLinear([red.m], ["x"], red.n)}` : `\\text{não existe (reta vertical } x = ${tex(-line!.c / line!.a)})`} />
            <ResultRow label="Vetorial" tex={`(x;\\,y) = ${o1(texTuple(P))} + t\\,${o3(texTuple(d))}`} />
            <ResultRow label="Paramétrica" tex={`\\begin{cases} x = ${texAffine(P[0], d[0])} \\\\ y = ${texAffine(P[1], d[1])} \\end{cases}`} />
            <ResultRow
              label="Segmentária"
              tex={seg ? `\\dfrac{x}{${o5(tex(seg.p))}} + \\dfrac{y}{${o5(tex(seg.q))}} = 1` : `\\text{não existe (${Math.abs(line!.c) < 1e-12 ? "passa pela origem" : "paralela a um eixo"})}`}
            />
            <ResultRow label="Vetor normal" tex={o4(`\\vec n = ${texTuple([tidy!.a, tidy!.b])}`)} />
            {red && <ResultRow label="Inclinação" tex={`m = ${tex(red.m)}`} />}
          </Results>
        </Block>
      )}
      <Block title="Controles">
        <div className="controls">
          <VecInput label={o1("A")} value={P} onChange={(x) => set({ P: x, src: "p" })} />
          <VecInput label={o1("B")} value={Q} onChange={(x) => set({ Q: x, src: "p" })} />
          <div className="vec-input">
            <span className="vlabel"><Tex>{"a, b, c"}</Tex></span>
            {[0, 1, 2].map((i) => (
              <NumberField key={i} value={line ? [line.a, line.b, line.c][i] : 0} onChange={(v) => editCoef(i, v)} label={["a", "b", "c"][i]} />
            ))}
          </div>
          {red && (
            <div className="vec-input">
              <span className="vlabel"><Tex>{"m, n"}</Tex></span>
              <NumberField value={red.m} onChange={(m) => editReduced(m, red.n)} label="m" />
              <NumberField value={red.n} onChange={(n) => editReduced(red.m, n)} label="n" />
            </div>
          )}
          {!same && <Slider tex={o2("t")} value={s.t} onChange={(t) => set({ t })} min={-3} max={3} step={0.25} />}
        </div>
      </Block>
      <Presets
        items={[
          { label: "Reta inclinada", apply: () => set({ P: [-2, -1], Q: [2, 2], src: "p" }) },
          { label: "Reta vertical", apply: () => set({ P: [2, -2], Q: [2, 3], src: "p" }) },
          { label: "Pela origem", apply: () => set({ P: [-2, -1], Q: [2, 1], src: "p" }) },
          { label: "Horizontal", apply: () => set({ P: [-3, 1.5], Q: [2, 1.5], src: "p" }) },
          { label: "Pontos iguais", apply: () => set({ P: [1, 1], Q: [1, 1], src: "p" }) },
        ]}
      />
      {!same && (
        <Block title="Ponto da paramétrica">
          <Results>
            <ResultRow label={`t = ${fmtN(s.t)}`} tex={o2(texTuple(X))} />
          </Results>
        </Block>
      )}
    </ModuleLayout>
  );
}

function fmtN(x: number) {
  return (Math.round(x * 100) / 100).toString().replace(".", ",").replace("-", "−");
}
