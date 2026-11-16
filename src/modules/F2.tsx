import { niceDirection } from "../math/diag3";
import { o1, o2, o3, o5, tex, texEquation, texLinear, texTuple } from "../math/format";
import { solveSystem } from "../math/linsys";
import { rrefPlain } from "../math/mat";
import { cross, isZeroVec, type Vec3 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow3D, Line3D, PlaneMesh, Point3D, Scene3D, type V3 } from "../viz3d";

const DEF = {
  mode: "eq",
  n1: [1, -1, 2], d1: 0, two: false as boolean, n2: [0, 1, 1], d2: 0, k: -1.5,
  q: 3, g1: [1, 0, 1], g2: [0, 1, 1], g3: [1, 1, 2], g4: [0, 0, 1],
};

const add3 = (a: number[], b: number[]): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sc3 = (a: number[], k: number): V3 => [a[0] * k, a[1] * k, a[2] * k];
const COLS = ["obj1", "obj2", "obj5", "obj6"];

export default function F2() {
  const [s, set, reset] = useUrlState(DEF);
  const mode = s.mode as "eq" | "ger";

  return (
    <ModuleLayout
      graph={mode === "eq" ? <EqGraph s={s} /> : <GenGraph s={s} />}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Um <strong>subespaço</strong> de ℝ³ é um conjunto W de vetores que contém o vetor nulo e é fechado para as duas operações: somar dois vetores
            de W dá um vetor de W, e multiplicar um vetor de W por qualquer número dá um vetor de W. Geometricamente, os subespaços de ℝ³ são só quatro
            tipos: a origem, retas pela origem, planos pela origem e o próprio ℝ³.
          </p>
          <p>
            Um plano que não passa pela origem não é subespaço: no gráfico, u e v estão nele, mas u + v e k·u saem dele. Já o conjunto solução de um
            sistema <strong>homogêneo</strong> (lado direito zero) é sempre um subespaço.
          </p>
          <p>
            Uma <strong>base</strong> de W é um conjunto de vetores linearmente independentes que gera W, e a <strong>dimensão</strong> é quantos vetores a
            base tem. No modo “Vetores geradores”, o escalonamento descarta os vetores que são combinação dos outros.
          </p>
        </>
      }
    >
      <Segmented
        label="Como o conjunto é dado"
        value={mode}
        onChange={(m) => set({ mode: m })}
        options={[
          { value: "eq", label: "Por equações" },
          { value: "ger", label: "Por vetores geradores" },
        ]}
      />
      {mode === "eq" ? <EqPanel s={s} set={set} /> : <GenPanel s={s} set={set} />}
    </ModuleLayout>
  );
}

type S = typeof DEF;
type SetS = (p: Partial<S>) => void;

/* ---------- Modo: conjunto dado por equações ---------- */

function eqData(s: S) {
  const rows = [[...s.n1, s.d1], ...(s.two ? [[...s.n2, s.d2]] : [])];
  const nonzero = rows.filter((r) => r.slice(0, 3).some((x) => Math.abs(x) > 1e-12) || Math.abs(r[3]) > 1e-12);
  const sol = solveSystem(nonzero.length ? nonzero : [[0, 0, 0, 0]]);
  const inW = (x: number[]) => nonzero.every((r) => Math.abs(r[0] * x[0] + r[1] * x[1] + r[2] * x[2] - r[3]) < 1e-7);
  let u: V3 | null = null, v: V3 | null = null;
  if (sol.particular) {
    const p = sol.particular;
    const d = sol.directions;
    if (d.length >= 2) {
      u = add3(p, d[0]);
      v = add3(p, d[1]);
    } else if (d.length === 1) {
      u = add3(p, d[0]);
      v = add3(p, sc3(d[0], -1.5));
    } else {
      u = p as V3;
      v = p as V3;
    }
  }
  const sum = u && v ? add3(u, v) : null;
  const ku = u ? sc3(u, s.k) : null;
  const tests = {
    zero: sol.type !== "SI" && inW([0, 0, 0]),
    sum: sum ? inW(sum) : false,
    scal: ku ? inW(ku) : false,
  };
  return { rows, nonzero, sol, u, v, sum, ku, tests, isSub: tests.zero && tests.sum && tests.scal };
}

function EqGraph({ s }: { s: S }) {
  const { rows, sol, u, v, sum, ku, tests } = eqData(s);
  const planes = rows.filter((r) => r.slice(0, 3).some((x) => Math.abs(x) > 1e-12));
  const isLine = sol.type !== "SI" && sol.directions.length === 1;
  return (
    <Scene3D R={4} label="Conjunto W definido por equações e o teste de subespaço">
      {planes.map((r, i) => (
        <PlaneMesh key={i} plane={{ n: r.slice(0, 3) as Vec3, d: r[3] }} color={i === 0 ? "obj4" : "obj6"} opacity={isLine ? 0.12 : 0.3} />
      ))}
      {isLine && sol.particular && <Line3D line={{ p: sol.particular as Vec3, v: sol.directions[0] as Vec3 }} color="obj4" width={6} />}
      <Point3D at={[0, 0, 0]} color={tests.zero ? "obj3" : "obj6"} size={0.12} label="0" />
      {u && <Arrow3D to={u} color="obj1" label="u" />}
      {v && u !== v && <Arrow3D to={v} color="obj2" label="v" />}
      {u && v && sum && (
        <>
          <Arrow3D from={u} to={sum} color="obj2" dashed width={1.5} opacity={0.7} />
          <Arrow3D to={sum} color="obj3" label="u + v" width={3} />
        </>
      )}
      {ku && <Arrow3D to={ku} color="obj5" label="k·u" width={3} />}
    </Scene3D>
  );
}

function EqPanel({ s, set }: { s: S; set: SetS }) {
  const { rows, sol, u, v, sum, ku, tests, isSub } = eqData(s);
  const sys = `W = \\{(x, y, z) : ${rows.map((r) => texEquation(r.slice(0, 3), ["x", "y", "z"], r[3])).join(",\\ ")}\\}`;
  const mark = (ok: boolean) => (ok ? "\\checkmark" : "\\times");
  return (
    <>
      <Block title="Conjunto">
        <LiveEquation current={sys} />
      </Block>
      {sol.type === "SI" ? (
        <Note kind="bad">As equações não têm solução comum: W é vazio, então não contém o vetor nulo e não é subespaço.</Note>
      ) : (
        <Block title="Teste de subespaço">
          <Results>
            <ResultRow label="0 ∈ W?" tex={`${mark(tests.zero)}\\quad ${rows.map((r) => `${tex(0)} = ${tex(r[3])}`).join(",\\ ")}`} />
            {u && v && sum && (
              <ResultRow
                label="u + v ∈ W?"
                tex={`${mark(tests.sum)}\\quad ${o1(texTuple(u))} + ${o2(texTuple(v))} = ${o3(texTuple(sum))}`}
              />
            )}
            {u && ku && <ResultRow label="k·u ∈ W?" tex={`${mark(tests.scal)}\\quad ${tex(s.k)}\\,${o1(texTuple(u))} = ${o5(texTuple(ku))}`} />}
          </Results>
        </Block>
      )}
      {sol.type !== "SI" &&
        (isSub ? (
          <Note kind="ok">W é um subespaço de ℝ³ (as equações são homogêneas).</Note>
        ) : (
          <Note kind="warn">W não é subespaço: não passa pela origem, e por isso somas e múltiplos de vetores de W escapam dele.</Note>
        ))}
      {isSub && (
        <Block title="Base e dimensão">
          <Results>
            <ResultRow label="Base" tex={sol.directions.length ? `\\{${sol.directions.map((d) => texTuple(niceDirection(d))).join(",\\ ")}\\}` : "\\varnothing"} />
            <ResultRow label="dim W" tex={`${sol.directions.length} = 3 - \\operatorname{posto} = 3 - ${sol.rankA}`} />
            <ResultRow label="W é" tex={`\\text{${["a origem", "uma reta pela origem", "um plano pela origem", "o espaço todo"][sol.directions.length]}}`} />
          </Results>
        </Block>
      )}
      <Block title="Controles">
        <div className="controls">
          <VecInput label="(a_1;\ b_1;\ c_1)" value={s.n1} onChange={(x) => set({ n1: x })} />
          <Slider tex="d_1" value={s.d1} onChange={(x) => set({ d1: x })} min={-6} max={6} />
          <label className="row" style={{ fontSize: 14 }}>
            <input type="checkbox" checked={s.two} onChange={(e) => set({ two: e.target.checked })} /> Segunda equação
          </label>
          {s.two && (
            <>
              <VecInput label="(a_2;\ b_2;\ c_2)" value={s.n2} onChange={(x) => set({ n2: x })} />
              <Slider tex="d_2" value={s.d2} onChange={(x) => set({ d2: x })} min={-6} max={6} />
            </>
          )}
          <Slider tex="k" value={s.k} onChange={(x) => set({ k: x })} min={-3} max={3} step={0.1} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Plano pela origem", apply: () => set({ n1: [1, -1, 2], d1: 0, two: false }) },
          { label: "Plano fora da origem", apply: () => set({ n1: [1, -1, 2], d1: 3, two: false }) },
          { label: "Reta pela origem", apply: () => set({ n1: [1, 1, 0], d1: 0, two: true, n2: [0, 1, -1], d2: 0 }) },
          { label: "Reta fora da origem", apply: () => set({ n1: [1, 1, 0], d1: 0, two: true, n2: [0, 1, -1], d2: 2 }) },
        ]}
      />
    </>
  );
}

/* ---------- Modo: subespaço gerado por vetores ---------- */

function genData(s: S) {
  const vs = [s.g1, s.g2, s.g3, s.g4].slice(0, s.q);
  const M = [0, 1, 2].map((i) => vs.map((v) => v[i]));
  const { R, pivots } = rrefPlain(M);
  const basis = pivots.map((j) => vs[j]);
  const redundant = vs.map((_, j) => j).filter((j) => !pivots.includes(j));
  let normal: Vec3 | null = null;
  if (basis.length === 2) normal = niceDirection(cross(basis[0] as Vec3, basis[1] as Vec3)) as Vec3;
  return { vs, R, pivots, basis, redundant, normal, dim: pivots.length };
}

function GenGraph({ s }: { s: S }) {
  const { vs, pivots, basis, normal, dim } = genData(s);
  return (
    <Scene3D R={4} label="Subespaço gerado por vetores">
      {dim === 2 && normal && <PlaneMesh plane={{ n: normal, d: 0 }} color="obj4" opacity={0.28} />}
      {dim === 1 && <Line3D line={{ p: [0, 0, 0], v: basis[0] as Vec3 }} color="obj4" width={6} />}
      {vs.map((v, j) =>
        isZeroVec(v) ? null : (
          <Arrow3D key={j} to={v as V3} color={COLS[j]} label={`v${"₁₂₃₄"[j]}`} dashed={!pivots.includes(j)} width={pivots.includes(j) ? 4 : 2.5} />
        ),
      )}
    </Scene3D>
  );
}

function GenPanel({ s, set }: { s: S; set: SetS }) {
  const { vs, R, pivots, basis, redundant, normal, dim } = genData(s);
  const vN = (j: number) => `\\vec v_${j + 1}`;
  return (
    <>
      <Block title="Subespaço gerado">
        <LiveEquation
          general={`W = [${vs.map((_, j) => vN(j)).join(", ")}]`}
          current={`\\text{base: } \\{${basis.map((b) => texTuple(b)).join(",\\ ") || "\\ "}\\},\\quad \\dim W = ${dim}`}
        />
      </Block>
      <Note kind={dim === 3 ? "ok" : "info"}>
        {dim === 0 && "Todos os vetores são nulos: W é só a origem."}
        {dim === 1 && "Os vetores são todos paralelos: W é uma reta pela origem."}
        {dim === 2 && "W é um plano pela origem."}
        {dim === 3 && "Os vetores geram o espaço todo: W = ℝ³."}
      </Note>
      <Block title="Resultados">
        <Results>
          <ResultRow label="Escalonada" tex={`\\operatorname{rref}[${vs.map((_, j) => vN(j)).join("\\ ")}] = ${texMatrixSmall(R)}`} />
          <ResultRow label="Colunas-pivô" tex={pivots.map((j) => vN(j)).join(",\\ ") || "\\text{nenhuma}"} />
          {redundant.map((j) => (
            <ResultRow
              key={j}
              label={`v${"₁₂₃₄"[j]} é redundante`}
              tex={`${vN(j)} = ${texLinear(pivots.map((_, r) => R[r][j]), pivots.map((p) => vN(p)))}`}
            />
          ))}
          {dim === 2 && normal && <ResultRow label="Equação de W" tex={`${texEquation(normal, ["x", "y", "z"], 0)}`} />}
          {vs.length > 3 && <ResultRow label="Observação" tex={"\\text{mais de 3 vetores em } \\mathbb{R}^3 \\text{ são sempre LD}"} />}
        </Results>
      </Block>
      <Block title="Controles">
        <div className="controls">
          <Segmented
            label="Quantos vetores"
            value={String(s.q) as "2" | "3" | "4"}
            onChange={(q) => set({ q: Number(q) })}
            options={[
              { value: "2", label: "2" },
              { value: "3", label: "3" },
              { value: "4", label: "4" },
            ]}
          />
          {(["g1", "g2", "g3", "g4"] as const).slice(0, s.q).map((k, j) => (
            <VecInput key={k} label={`\\htmlClass{${COLS[j]}}{${vN(j)}}`} value={s[k]} onChange={(x) => set({ [k]: x } as Partial<S>)} />
          ))}
        </div>
      </Block>
      <Presets
        items={[
          { label: "Um redundante", apply: () => set({ q: 3, g1: [1, 0, 1], g2: [0, 1, 1], g3: [1, 1, 2] }) },
          { label: "Três LI", apply: () => set({ q: 3, g1: [1, 0, 1], g2: [0, 1, 1], g3: [1, 1, 0] }) },
          { label: "Paralelos", apply: () => set({ q: 2, g1: [1, 2, 1], g2: [-2, -4, -2] }) },
          { label: "Quatro vetores", apply: () => set({ q: 4, g1: [1, 0, 0], g2: [0, 1, 0], g3: [1, 1, 0], g4: [0, 0, 1] }) },
        ]}
      />
    </>
  );
}

function texMatrixSmall(R: number[][]): string {
  return `\\left[\\begin{smallmatrix} ${R.map((r) => r.map((x) => tex(x)).join(" & ")).join(" \\\\ ")} \\end{smallmatrix}\\right]`;
}
