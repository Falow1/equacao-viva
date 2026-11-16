import { o1, o2, o3, tex, texAffine, texShift, texTuple } from "../math/format";
import { isZeroVec } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow3D, Line3D, Point3D, Seg3D, Scene3D, type V3 } from "../viz3d";

const VARS = ["x", "y", "z"];

/** Forma simétrica, tratando componentes nulas do diretor. */
function symmetricTex(A: number[], d: number[]): { tex: string; note?: string } {
  const nz = [0, 1, 2].filter((i) => Math.abs(d[i]) > 1e-12);
  const z = [0, 1, 2].filter((i) => Math.abs(d[i]) <= 1e-12);
  if (nz.length === 0) return { tex: "\\text{(sem reta: } \\vec d = \\vec 0)" };
  const fixed = z.map((i) => `${VARS[i]} = ${tex(A[i])}`);
  if (nz.length === 1) {
    return {
      tex: fixed.join(",\\quad "),
      note: `O diretor só tem a componente ${VARS[nz[0]]}: a reta é paralela ao eixo ${VARS[nz[0]]} e não existe forma simétrica com frações; basta fixar as outras duas coordenadas.`,
    };
  }
  const frac = nz.map((i) => `\\dfrac{${texShift(VARS[i], A[i])}}{${tex(d[i])}}`).join(" = ");
  if (z.length === 0) return { tex: frac };
  return {
    tex: `${frac},\\quad ${fixed.join(",\\ ")}`,
    note: `A componente ${VARS[z[0]]} do diretor é zero: não se pode dividir por ela, então essa coordenada fica constante (${VARS[z[0]]} = ${String(A[z[0]]).replace(".", ",")}) ao longo da reta.`,
  };
}

export default function B3() {
  const [s, set, reset] = useUrlState({ A: [1, -1, 1], d: [1, 2, 1], t: 1 });
  const A = s.A as V3, d = s.d as V3, t = s.t;
  const P: V3 = [A[0] + t * d[0], A[1] + t * d[1], A[2] + t * d[2]];
  const zero = isZeroVec(d);
  const sym = symmetricTex(A, d);

  const graph = (
    <Scene3D R={4} label="Reta no espaço definida por um ponto A e um vetor diretor d">
      {!zero && <Line3D line={{ p: A, v: d }} color="obj4" width={2.5} />}
      <Arrow3D from={A} to={[A[0] + d[0], A[1] + d[1], A[2] + d[2]]} color="obj2" label="d" width={4} />
      <Point3D at={A} color="obj1" label="A" />
      {!zero && (
        <>
          <Point3D at={P} color="obj3" label={`P(t)`} />
          <Seg3D a={P} b={[P[0], P[1], 0]} color="obj-muted" dashed width={1.5} />
          <Point3D at={[P[0], P[1], 0]} color="obj-muted" size={0.05} />
        </>
      )}
    </Scene3D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Uma reta no espaço fica determinada por um ponto A e um <strong>vetor diretor</strong> d ≠ 0. Andando a partir de A um múltiplo t de d,
            chega-se a todos os pontos da reta: X = A + t·d.
          </p>
          <p>
            Escrevendo coordenada por coordenada surgem as <strong>equações paramétricas</strong>; isolando t em cada uma e igualando, a{" "}
            <strong>forma simétrica</strong>. No espaço não existe uma única equação ax + by + cz = d para a reta: essa equação descreve um plano.
          </p>
          <p>Mova o slider de t para ver P(t) percorrer a reta. A linha tracejada desce de P até o plano xy e ajuda a perceber a profundidade.</p>
        </>
      }
    >
      <Block title="Equações">
        <LiveEquation label="Vetorial" general={`X = ${o1("A")} + t\\,${o2("\\vec d")}`} current={`(x;\\ y;\\ z) = ${o1(texTuple(A))} + t\\,${o2(texTuple(d))}`} />
        <LiveEquation
          label="Paramétricas"
          current={`\\begin{cases} x = ${texAffine(A[0], d[0])} \\\\ y = ${texAffine(A[1], d[1])} \\\\ z = ${texAffine(A[2], d[2])} \\end{cases}\\quad t \\in \\mathbb{R}`}
        />
        <LiveEquation label="Simétrica" current={sym.tex} />
      </Block>
      {zero && <Note kind="bad">O vetor diretor é nulo: A + t·0 = A para todo t, e isso não é uma reta. Escolha d ≠ 0.</Note>}
      {sym.note && !zero && <Note kind="warn">{sym.note}</Note>}
      <Block title="Ponto sobre a reta">
        <Slider tex="t" value={t} onChange={(x) => set({ t: x })} min={-4} max={4} step={0.1} />
        <Results>
          <ResultRow label="P(t)" tex={o3(`P(${tex(t)}) = ${texTuple(P)}`)} />
        </Results>
      </Block>
      <Block title="Controles">
        <div className="controls">
          <VecInput label={o1("A")} value={A} onChange={(x) => set({ A: x })} />
          <VecInput label={o2("\\vec d")} value={d} onChange={(x) => set({ d: x })} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Reta inclinada", apply: () => set({ A: [1, -1, 1], d: [1, 2, 1] }) },
          { label: "Diretor com zero", apply: () => set({ A: [0, 1, 2], d: [2, -1, 0] }) },
          { label: "Paralela ao eixo z", apply: () => set({ A: [2, 1, 0], d: [0, 0, 1] }) },
          { label: "Pela origem", apply: () => set({ A: [0, 0, 0], d: [1, 1, 1] }) },
          { label: "Eixo x", apply: () => set({ A: [0, 0, 0], d: [1, 0, 0] }) },
        ]}
      />
    </ModuleLayout>
  );
}
