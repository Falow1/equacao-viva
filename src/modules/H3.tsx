import { useMemo } from "react";
import { eig3, hamiltonCayley, minimalPoly3, type EigenGroup } from "../math/diag3";
import { charPoly3 } from "../math/eigen";
import { o1, o2, tex, texDec, texMatrix, texPoly, texSigned, texTuple } from "../math/format";
import { inverse, mulVec } from "../math/mat";
import { angle, cross, dot, norm, type Vec3 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { Arrow3D, Line3D, PlaneMesh, Scene3D, type V3 } from "../viz3d";

const GCOL = ["obj4", "obj6", "obj5"];
const L = "\\lambda";

/** (λ − a)^k em LaTeX. */
function factor(a: number, k: number, v = L): string {
  const base = Math.abs(a) < 1e-12 ? v : `(${v} ${texSigned(-a)})`;
  return k === 1 ? base : `${base}^{${k}}`;
}
const factored = (fs: { value: number; k: number }[], v = L) => fs.map((f) => factor(f.value, f.k, v)).join("");
/** (A − aI)^k ... em LaTeX. */
const factoredA = (fs: { value: number; k: number }[]) =>
  fs.map(({ value, k }) => {
    const base = Math.abs(value) < 1e-12 ? "A" : `(A ${texSigned(-value)}I)`;
    return k === 1 ? base : `${base}^{${k}}`;
  }).join("");

export default function H3() {
  const [s, set, reset] = useUrlState({ A: [[4, 1, -1], [2, 5, -2], [1, 1, 2]], v: [1, 0, 1] });
  const A = s.A as number[][];
  const v = s.v as V3;
  const key = A.map((r) => r.join(",")).join(";");
  const e = useMemo(() => eig3(A), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const mp = useMemo(() => minimalPoly3(A, e), [key, e]); // eslint-disable-line react-hooks/exhaustive-deps
  const hc = useMemo(() => hamiltonCayley(A), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [, a, b, c] = charPoly3(A);
  const Av = mulVec(A, v) as V3;
  const ang = angle(v, Av);
  const nv = norm(v);
  const aligned = nv > 1e-9 && (norm(Av) < 1e-9 || (ang !== null && (ang < 0.03 || Math.PI - ang < 0.03)));
  const groups: EigenGroup[] = e.kind === "real" ? e.groups : [e.real];
  const charFactored = e.kind === "real" ? factored(groups.map((g) => ({ value: g.value, k: g.alg }))) : `${factor(e.real.value, 1)}(${L}^2 ${texSigned(-2 * e.re)}${L} ${texSigned(e.re * e.re + e.im * e.im)})`;

  const graph = (
    <Scene3D R={3} label="Autoespaços de uma matriz 3×3, um vetor v e sua imagem Av">
      {groups.map((g, i) =>
        g.geo === 1 ? (
          <Line3D key={i} line={{ p: [0, 0, 0], v: g.basis[0] as Vec3 }} color={GCOL[i]} width={4} R={3} />
        ) : g.geo === 2 ? (
          <PlaneMesh key={i} plane={{ n: cross(g.basis[0] as Vec3, g.basis[1] as Vec3), d: 0 }} color={GCOL[i]} opacity={0.22} R={3} />
        ) : null,
      )}
      {groups.flatMap((g, i) =>
        g.basis.map((bv, j) => {
          const k = 1.6 / Math.max(1e-9, norm(bv));
          return <Arrow3D key={`${i}${j}`} to={[bv[0] * k, bv[1] * k, bv[2] * k]} color={GCOL[i]} label={`λ = ${String(Math.round(g.value * 100) / 100).replace(".", ",")}`} width={2.5} />;
        }),
      )}
      <Arrow3D to={Av} color="obj2" label="Av" width={aligned ? 5 : 3} />
      <Arrow3D to={v} color="obj1" label="v" width={aligned ? 5 : 3} />
    </Scene3D>
  );

  const eigRows = groups.map((g, i) => (
    <ResultRow
      key={i}
      label={<span className={GCOL[i]}>λ = {String(Math.round(g.value * 1000) / 1000).replace(".", ",").replace("-", "−")}</span>}
      tex={`m_a = ${g.alg},\\ m_g = ${g.geo};\\ \\text{base: } \\{${g.basis.map((x) => texTuple(x)).join(",\\ ")}\\}`}
    />
  ));

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Para uma matriz 3×3, os autovalores são as raízes do <strong>polinômio característico</strong> p(λ) = det(A − λI), de grau 3. Cada autovalor
            tem um <strong>autoespaço</strong> (o núcleo de A − λI), que aparece no gráfico como uma reta ou um plano pela origem.
          </p>
          <p>
            A <strong>multiplicidade algébrica</strong> mₐ é quantas vezes λ é raiz de p; a <strong>geométrica</strong> m<sub>g</sub> é a dimensão do
            autoespaço, e sempre m<sub>g</sub> ≤ mₐ. A matriz é <strong>diagonalizável</strong> (A = PDP⁻¹) exatamente quando todas as raízes são reais e
            m<sub>g</sub> = mₐ para cada uma: aí sobram 3 autovetores independentes para formar P.
          </p>
          <p>
            O <strong>teorema de Hamilton–Cayley</strong> diz que toda matriz anula o próprio polinômio característico: p(A) = 0. O{" "}
            <strong>polinômio minimal</strong> é o mônico de menor grau com m(A) = 0; ele divide p e tem as mesmas raízes. A é diagonalizável se e só se o
            minimal não tem raízes repetidas.
          </p>
        </>
      }
      steps={
        <ol className="steps">
          <li>
            <div className="step-n">1. Polinômio característico</div>
            <Tex>{`p(${L}) = \\det(A - ${L} I) = -(${texPoly([1, a, b, c], L)})`}</Tex>
            <div className="hint">
              <Tex>{`\\text{coeficientes: } \\operatorname{tr}A = ${tex(-a)},\\quad \\text{soma dos menores principais} = ${tex(b)},\\quad \\det A = ${tex(-c)}`}</Tex>
            </div>
          </li>
          <li>
            <div className="step-n">2. Raízes</div>
            <Tex>{`${texPoly([1, a, b, c], L)} = ${charFactored}`}</Tex>
          </li>
          <li>
            <div className="step-n">3. Autoespaços: núcleo de A − λI</div>
            {groups.map((g, i) => (
              <div key={i}>
                <Tex>{`${L} = ${tex(g.value)}:\\ \\operatorname{posto}(A - ${tex(g.value)}I) = ${3 - g.geo} \\Rightarrow m_g = ${g.geo}`}</Tex>
              </div>
            ))}
          </li>
          <li>
            <div className="step-n">4. Polinômio minimal: teste os candidatos</div>
            {mp.tried.length === 0 ? (
              <p>Com raízes complexas e distintas, o minimal é o próprio polinômio característico.</p>
            ) : (
              mp.tried.map((t, i) => (
                <div key={i}>
                  <Tex>{`${factoredA(t.factors)}${t.zero ? " = 0\\ \\checkmark" : " \\neq 0"}`}</Tex>
                </div>
              ))
            )}
          </li>
        </ol>
      }
    >
      <Block title="Equação">
        {e.kind === "real" && e.diagonalizable && e.P && e.D ? (
          <LiveEquation general="A = P\,D\,P^{-1}" current={`${texMatrix(e.P)}${texMatrix(e.D, { cellClass: (i, j) => (i === j ? "obj3" : null) })}${texMatrix(inverse(e.P) ?? e.P, { maxDen: 30 })}`} />
        ) : (
          <LiveEquation general="A = P\,D\,P^{-1}\ ?" current={e.kind === "complex" ? `\\text{raízes complexas: } ${tex(e.re)} \\pm ${texDec(e.im)}\\,i` : "\\text{não há 3 autovetores LI}"} />
        )}
      </Block>
      {e.kind === "complex" && <Note kind="warn">Duas raízes são complexas: só há uma direção real invariante, e A não é diagonalizável sobre ℝ.</Note>}
      {e.kind === "real" && !e.diagonalizable && <Note kind="warn">Algum autovalor tem m_g &lt; m_a: faltam autovetores para formar P, e A não é diagonalizável.</Note>}
      {e.kind === "real" && e.diagonalizable && <Note kind="ok">A é diagonalizável: as colunas de P são autovetores e D tem os autovalores na diagonal.</Note>}
      <Block title="Autovalores e autoespaços">
        <Results>{eigRows}</Results>
      </Block>
      <Block title="Polinômios">
        <Results>
          <ResultRow label="Característico" tex={`p(${L}) = ${charFactored}`} />
          <ResultRow label="Minimal" tex={`m(${L}) = ${mp.factors.length ? factored(mp.factors) : charFactored}`} />
          <ResultRow label="m = p?" tex={mp.equalsChar ? "\\text{sim}" : "\\text{não: o minimal tem grau menor}"} />
        </Results>
      </Block>
      <Block title="Hamilton–Cayley">
        <LiveEquation
          general={`p(A) = A^3 ${texSigned(a)}A^2 ${texSigned(b)}A ${texSigned(c)}I`}
          current={`${texMatrix(hc.A3)} ${texSigned(a)}${texMatrix(hc.A2)} ${texSigned(b)}${texMatrix(A)} ${texSigned(c)}I = ${texMatrix(hc.pA)}`}
        />
        {hc.inv && (
          <div style={{ marginTop: 8 }}>
            <LiveEquation label="Inversa pelo teorema" current={`A^{-1} = -\\dfrac{1}{${tex(c)}}\\left(A^2 ${texSigned(a)}A ${texSigned(b)}I\\right) = ${texMatrix(hc.inv, { maxDen: 60 })}`} />
          </div>
        )}
      </Block>
      <Block title="Teste com um vetor">
        <LiveEquation current={`A${o1(texTuple(v))} = ${o2(texTuple(Av))}${aligned && nv > 1e-9 ? ` = ${tex(dot(Av, v) / dot(v, v))}\\,${o1(texTuple(v))}` : ""}`} />
        <div style={{ marginTop: 8 }}>
          {aligned ? <Note kind="ok">v é autovetor: está sobre um autoespaço.</Note> : <Note>Av muda de direção; coloque v sobre uma das retas ou planos coloridos.</Note>}
        </div>
      </Block>
      <Block title="Controles">
        <div className="controls">
          <MatrixInput label="A =" value={A} onChange={(m) => set({ A: m })} />
          <VecInput label={o1("\\vec v")} value={v} onChange={(x) => set({ v: x })} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "λ duplo, diagonalizável", apply: () => set({ A: [[4, 1, -1], [2, 5, -2], [1, 1, 2]], v: [1, 0, 1] }) },
          { label: "Três distintos", apply: () => set({ A: [[1, 2, 0], [0, 2, 1], [0, 0, 3]], v: [2, 1, 0] }) },
          { label: "Simétrica", apply: () => set({ A: [[2, 1, 0], [1, 2, 0], [0, 0, 3]], v: [1, 1, 0] }) },
          { label: "Bloco de Jordan", apply: () => set({ A: [[2, 1, 0], [0, 2, 0], [0, 0, 3]], v: [1, 0, 0] }) },
          { label: "Jordan 3×3", apply: () => set({ A: [[2, 1, 0], [0, 2, 1], [0, 0, 2]], v: [1, 0, 0] }) },
          { label: "Escalar 2I", apply: () => set({ A: [[2, 0, 0], [0, 2, 0], [0, 0, 2]], v: [1, 2, 1] }) },
          { label: "Rotação (complexos)", apply: () => set({ A: [[0, -1, 0], [1, 0, 0], [0, 0, 2]], v: [0, 0, 1] }) },
        ]}
      />
    </ModuleLayout>
  );
}
