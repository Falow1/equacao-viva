import { useEffect, useMemo, useState } from "react";
import { o1, o2, o3, tex, texMatrix, texPar } from "../math/format";
import { addM, det, identity, inverse, mul, scaleM, transpose } from "../math/mat";
import { eliminationSteps } from "../math/rref";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results, Segmented, Slider } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { Arrow, Plane2D, type P2 } from "../viz2d";
import { Arrow3D, Scene3D, type V3 } from "../viz3d";

type Op = "soma" | "escalar" | "produto" | "transposta" | "inversa";
const OPS: { value: Op; label: string }[] = [
  { value: "soma", label: "A + B" },
  { value: "escalar", label: "k · A" },
  { value: "produto", label: "A · B" },
  { value: "transposta", label: "Aᵀ" },
  { value: "inversa", label: "A⁻¹" },
];
const SUB = ["₁", "₂", "₃"];

interface ColSet {
  M: number[][];
  color: string;
  name: string;
  faint?: boolean;
}

/** Desenha as colunas de algumas matrizes como vetores (2D ou 3D). */
function ColumnsView({ sets, n, extra }: { sets: ColSet[]; n: number; extra?: { from: number[]; to: number[]; color: string }[] }) {
  const cols = (M: number[][]) => Array.from({ length: n }, (_, j) => M.map((r) => r[j]));
  if (n === 2)
    return (
      <Plane2D x={[-5, 5]} y={[-4, 5]} label="Colunas das matrizes como vetores">
        {extra?.map((e, i) => <Arrow key={`x${i}`} tail={e.from as P2} tip={e.to as P2} color={`var(--${e.color})`} dashed weight={2} opacity={0.8} />)}
        {sets.map((s) =>
          cols(s.M).map((c, j) => (
            <Arrow key={`${s.name}${j}`} tip={c as P2} color={`var(--${s.color})`} label={s.faint ? undefined : `${s.name}e${SUB[j]}`} weight={s.faint ? 2 : 3.5} opacity={s.faint ? 0.45 : 1} />
          )),
        )}
      </Plane2D>
    );
  return (
    <Scene3D R={3} label="Colunas das matrizes como vetores no espaço">
      {extra?.map((e, i) => <Arrow3D key={`x${i}`} from={e.from as V3} to={e.to as V3} color={e.color} dashed width={2} opacity={0.8} />)}
      {sets.map((s) =>
        cols(s.M).map((c, j) => (
          <Arrow3D key={`${s.name}${j}`} to={c as V3} color={s.color} label={s.faint ? undefined : `${s.name}e${SUB[j]}`} width={s.faint ? 2 : 3.5} opacity={s.faint ? 0.45 : 1} />
        )),
      )}
    </Scene3D>
  );
}

const DEF = {
  n: "2",
  op: "soma",
  A2: [[2, 1], [0, 1]],
  B2: [[-1, 1], [1, 1]],
  A3: [[1, 2, 0], [0, 1, 1], [1, 0, 1]],
  B3: [[1, 0, 1], [0, 2, 0], [1, 1, 0]],
  k: 1.5,
};

export default function E4() {
  const [s, set, reset] = useUrlState(DEF);
  const n = s.n === "3" ? 3 : 2;
  const op = s.op as Op;
  const A = (n === 2 ? s.A2 : s.A3) as number[][];
  const B = (n === 2 ? s.B2 : s.B3) as number[][];
  const setA = (m: number[][]) => set(n === 2 ? { A2: m } : { A3: m });
  const setB = (m: number[][]) => set(n === 2 ? { B2: m } : { B3: m });
  const usesB = op === "soma" || op === "produto";
  const cols = (M: number[][], j: number) => M.map((r) => r[j]);

  const AB = mul(A, B), BA = mul(B, A);
  const Ainv = inverse(A);
  const D = det(A);
  const key = `${n}|${A.map((r) => r.join(",")).join(";")}`;
  const gj = useMemo(() => eliminationSteps(A.map((r, i) => [...r, ...identity(n)[i]]), "jordan", n), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [step, setStep] = useState(0);
  useEffect(() => setStep(0), [key]);
  const cur = gj[Math.min(step, gj.length - 1)];

  let result: number[][] | null = null;
  let general = "";
  let sets: ColSet[] = [];
  let extra: { from: number[]; to: number[]; color: string }[] = [];
  if (op === "soma") {
    result = addM(A, B);
    general = `(A + B)_{ij} = a_{ij} + b_{ij}`;
    sets = [{ M: A, color: "obj1", name: "A" }, { M: B, color: "obj2", name: "B", faint: true }, { M: result, color: "obj3", name: "(A+B)" }];
    extra = Array.from({ length: n }, (_, j) => ({ from: cols(A, j), to: cols(result!, j), color: "obj2" }));
  } else if (op === "escalar") {
    result = scaleM(A, s.k);
    general = `(kA)_{ij} = k\\,a_{ij}`;
    sets = [{ M: A, color: "obj1", name: "A", faint: true }, { M: result, color: "obj3", name: "kA" }];
  } else if (op === "produto") {
    result = AB;
    general = `(AB)_{ij} = \\sum_k a_{ik}\\,b_{kj}`;
    sets = [{ M: A, color: "obj1", name: "A", faint: true }, { M: B, color: "obj2", name: "B" }, { M: AB, color: "obj3", name: "AB" }];
  } else if (op === "transposta") {
    result = transpose(A);
    general = `(A^T)_{ij} = a_{ji}`;
    sets = [{ M: A, color: "obj1", name: "A" }, { M: result, color: "obj3", name: "Aᵀ" }];
  } else {
    result = Ainv;
    general = `A\\,A^{-1} = A^{-1}A = I`;
    sets = Ainv ? [{ M: A, color: "obj1", name: "A" }, { M: Ainv, color: "obj3", name: "A⁻¹" }] : [{ M: A, color: "obj1", name: "A" }];
  }

  const opTex: Record<Op, string> = {
    soma: `${o1(texMatrix(A))} + ${o2(texMatrix(B))}`,
    escalar: `${tex(s.k)}\\,${o1(texMatrix(A))}`,
    produto: `${o1(texMatrix(A))}\\,${o2(texMatrix(B))}`,
    transposta: `${o1(texMatrix(A))}^T`,
    inversa: `${o1(texMatrix(A))}^{-1}`,
  };

  const productSteps = (
    <ol className="steps">
      {AB.map((row, i) =>
        row.map((x, j) => (
          <li key={`${i}${j}`}>
            <Tex>{`c_{${i + 1}${j + 1}} = ${A[i].map((a, k) => `${texPar(a)}\\cdot${texPar(B[k][j])}`).join(" + ")} = ${tex(x)}`}</Tex>
          </li>
        )),
      )}
    </ol>
  );

  const inverseSteps = (
    <>
      {n === 2 && Ainv && (
        <p>
          <Tex>{`A^{-1} = \\dfrac{1}{\\det A}\\begin{bmatrix} d & -b \\\\ -c & a \\end{bmatrix} = \\dfrac{1}{${tex(D)}}${texMatrix([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]])}`}</Tex>
        </p>
      )}
      <p>Por Gauss–Jordan: escalone [A | I] até o lado esquerdo virar I; o lado direito vira A⁻¹.</p>
      <ol className="steps">
        {gj.map((st, k) => (
          <li key={k} style={{ opacity: k > step ? 0.45 : 1, cursor: "pointer" }} onClick={() => setStep(k)}>
            <div className="step-n">
              {k}. <Tex>{st.tex}</Tex>
            </div>
            <Tex>{texMatrix(st.matrix, { bar: n, maxDen: 100, cellClass: (r) => (st.rows.includes(r) ? "obj5" : null) })}</Tex>
          </li>
        ))}
      </ol>
    </>
  );

  return (
    <ModuleLayout
      graph={<ColumnsView sets={sets} n={n} extra={extra} />}
      onReset={() => {
        reset();
        setStep(0);
      }}
      snapToggle={false}
      explain={
        <>
          <p>
            Uma matriz guarda vetores nas colunas: a coluna j de A é Aeⱼ, a imagem do j-ésimo vetor da base. Por isso as operações têm leitura geométrica,
            e o gráfico desenha as colunas de cada matriz como setas.
          </p>
          <p>
            <strong>Soma</strong> e <strong>multiplicação por escalar</strong> são feitas entrada a entrada, e coluna a coluna viram soma de vetores
            (tracejado) e esticamento. No <strong>produto</strong> AB, cada coluna de AB é A aplicada à coluna correspondente de B: c<sub>ij</sub> é o
            produto escalar da linha i de A com a coluna j de B. Em geral AB ≠ BA.
          </p>
          <p>
            A <strong>transposta</strong> troca linhas por colunas, e (AB)ᵀ = BᵀAᵀ. A <strong>inversa</strong> existe só quando det A ≠ 0 e pode ser
            calculada escalonando [A | I] até [I | A⁻¹].
          </p>
        </>
      }
      steps={op === "produto" ? productSteps : op === "inversa" ? inverseSteps : undefined}
    >
      <div className="row" style={{ gap: 8, flexWrap: "wrap" }}>
        <Segmented
          label="Tamanho"
          value={s.n as "2" | "3"}
          onChange={(x) => set({ n: x })}
          options={[
            { value: "2", label: "2 × 2" },
            { value: "3", label: "3 × 3" },
          ]}
        />
      </div>
      <div className="presets" role="group" aria-label="Operação">
        {OPS.map((o) => (
          <button key={o.value} type="button" className="btn small" aria-pressed={op === o.value} onClick={() => set({ op: o.value })}>
            {o.label}
          </button>
        ))}
      </div>
      <Block title="Equação">
        <LiveEquation general={general} current={result ? `${opTex[op]} = ${o3(texMatrix(result))}` : `\\det A = 0 \\Rightarrow A^{-1}\\ \\text{não existe}`} />
      </Block>
      {op === "inversa" && !Ainv && <Note kind="bad">det A = 0: as colunas de A são dependentes e A não tem inversa. No escalonamento aparece uma linha de zeros no lado esquerdo.</Note>}
      {op === "inversa" && (
        <Block title={`Gauss–Jordan em [A | I]: passo ${step} de ${gj.length - 1}`}>
          <LiveEquation general={step === 0 ? undefined : cur.tex} current={texMatrix(cur.matrix, { bar: n, maxDen: 100, cellClass: (r) => (cur.rows.includes(r) ? "obj5" : null) })} />
          <div className="row" style={{ gap: 8, marginTop: 10 }}>
            <button type="button" className="btn" onClick={() => setStep((k) => Math.max(0, k - 1))} disabled={step === 0}>
              ← Passo anterior
            </button>
            <button type="button" className="btn primary" onClick={() => setStep((k) => Math.min(gj.length - 1, k + 1))} disabled={step >= gj.length - 1}>
              Próximo passo →
            </button>
          </div>
        </Block>
      )}
      <Block title="Resultados">
        <Results>
          {op === "produto" && (
            <>
              <ResultRow label="BA" tex={texMatrix(BA)} />
              <ResultRow label="AB = BA?" tex={AB.every((r, i) => r.every((x, j) => Math.abs(x - BA[i][j]) < 1e-9)) ? "\\text{sim (comutam)}" : "\\text{não}"} />
              <ResultRow label="det(AB)" tex={`${tex(det(AB))} = ${texPar(D)}\\cdot${texPar(det(B))}`} />
            </>
          )}
          {op === "transposta" && (
            <>
              <ResultRow label="det Aᵀ" tex={`${tex(det(transpose(A)))} = \\det A`} />
              <ResultRow label="Simétrica?" tex={A.every((r, i) => r.every((x, j) => Math.abs(x - A[j][i]) < 1e-9)) ? "\\text{sim, } A^T = A" : "\\text{não}"} />
            </>
          )}
          {op === "inversa" && Ainv && (
            <>
              <ResultRow label="det A" tex={tex(D)} />
              <ResultRow label="Conferência" tex={`A\\,A^{-1} = ${texMatrix(mul(A, Ainv))}`} />
            </>
          )}
          {op === "soma" && <ResultRow label="B + A" tex={`${texMatrix(addM(B, A))} = A + B`} />}
          {op === "escalar" && <ResultRow label="det(kA)" tex={`k^{${n}}\\det A = ${tex(det(scaleM(A, s.k)))}`} />}
        </Results>
      </Block>
      <Block title="Controles">
        <div className="controls">
          <MatrixInput label={o1("A =")} value={A} onChange={setA} />
          {usesB && <MatrixInput label={o2("B =")} value={B} onChange={setB} />}
          {op === "escalar" && <Slider tex="k" value={s.k} onChange={(x) => set({ k: x })} min={-3} max={3} step={0.1} />}
        </div>
      </Block>
      <Presets
        items={
          n === 2
            ? [
                { label: "AB ≠ BA", apply: () => set({ op: "produto", A2: [[0, -1], [1, 0]], B2: [[1, 0], [0, -1]] }) },
                { label: "Inversa simples", apply: () => set({ op: "inversa", A2: [[2, 1], [1, 1]] }) },
                { label: "Sem inversa", apply: () => set({ op: "inversa", A2: [[1, 2], [2, 4]] }) },
                { label: "Transposta", apply: () => set({ op: "transposta", A2: [[1, 2], [0, 1]] }) },
              ]
            : [
                { label: "Inversa 3×3", apply: () => set({ op: "inversa", A3: [[1, 2, 0], [0, 1, 1], [1, 0, 1]] }) },
                { label: "Precisa trocar linhas", apply: () => set({ op: "inversa", A3: [[0, 1, 2], [1, 0, 3], [4, -3, 8]] }) },
                { label: "Sem inversa", apply: () => set({ op: "inversa", A3: [[1, 2, 3], [4, 5, 6], [7, 8, 9]] }) },
                { label: "Produto 3×3", apply: () => set({ op: "produto", A3: [[1, 2, 0], [0, 1, 1], [1, 0, 1]], B3: [[1, 0, 1], [0, 2, 0], [1, 1, 0]] }) },
              ]
        }
      />
    </ModuleLayout>
  );
}
