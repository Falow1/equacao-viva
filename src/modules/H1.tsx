import { charPoly2, eig2 } from "../math/eigen";
import { o1, o2, o4, tex, texDec, texMatrix, texPoly, texTuple } from "../math/format";
import { mulVec } from "../math/mat";
import { angle, dot, norm } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { Arrow, DraggablePoint, InfLine, Plane2D, Plot, type P2 } from "../viz2d";

export default function H1() {
  const [s, set, reset] = useUrlState({ A: [[2, 1], [1, 2]], v: [2, 0.5], circ: true as boolean });
  const A = s.A as number[][];
  const v = s.v as P2;
  const Av = mulVec(A, v) as P2;
  const e = eig2(A);
  const [, b, c] = charPoly2(A);
  const nv = norm(v);
  const ang = angle(v, Av);
  const aligned = nv > 1e-9 && (norm(Av) < 1e-9 || (ang !== null && (ang < 0.035 || Math.PI - ang < 0.035)));
  const lambdaHere = nv > 1e-9 ? dot(Av, v) / dot(v, v) : 0;
  const eigVecs: P2[] = e.kind === "complex" ? [] : (e.vectors as P2[]);

  const graph = (
    <Plane2D x={[-5, 5]} y={[-4, 4]} label="Vetor v e sua imagem Av">
      {s.circ && (
        <>
          <Plot.Parametric xy={(t) => [Math.cos(t) * 2, Math.sin(t) * 2]} domain={[0, 2 * Math.PI]} color="var(--obj-muted)" weight={1} />
          <Plot.Parametric xy={(t) => mulVec(A, [Math.cos(t) * 2, Math.sin(t) * 2]) as P2} domain={[0, 2 * Math.PI]} color="var(--obj2)" weight={1.5} opacity={0.5} />
        </>
      )}
      {eigVecs.map((ev, i) => (
        <InfLine key={i} p={[0, 0]} v={ev} color="var(--obj4)" dashed weight={2} />
      ))}
      <Arrow tip={Av} color="var(--obj2)" label="Av" weight={aligned ? 5 : 3} />
      <Arrow tip={v} color="var(--obj1)" label="v" weight={aligned ? 5 : 3} />
      <DraggablePoint point={v} onMove={(p) => set({ v: p })} color="var(--obj1)" />
    </Plane2D>
  );

  const valuesTex =
    e.kind === "complex"
      ? `\\lambda = ${tex(e.re)} \\pm ${texDec(e.im)}\\,i`
      : e.values[0] === e.values[1]
        ? `\\lambda_1 = \\lambda_2 = ${tex(e.values[0])}`
        : `\\lambda_1 = ${tex(e.values[0])},\\quad \\lambda_2 = ${tex(e.values[1])}`;

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            Quase todo vetor muda de direção ao ser multiplicado por A. Os <strong>autovetores</strong> são as exceções: Av = λv, ou seja, A só
            estica, encolhe ou inverte v. O número λ é o <strong>autovalor</strong>.
          </p>
          <p>
            Para achá-los, resolve-se det(A − λI) = 0 (o polinômio característico). Gire v com o mouse: quando ele cair sobre uma das retas tracejadas,
            v e Av ficam alinhados. A elipse vermelha é a imagem do círculo; seus eixos mostram para onde A estica mais.
          </p>
          <p>
            Uma rotação não tem autovetor real (as raízes são complexas). Um cisalhamento tem um autovalor repetido com uma só direção de autovetores.
          </p>
        </>
      }
      steps={
        <ol className="steps">
          <li>
            <div className="step-n">1. Polinômio característico</div>
            <MathTex t={`\\det(A - \\lambda I) = \\begin{vmatrix} ${tex(A[0][0])} - \\lambda & ${tex(A[0][1])} \\\\ ${tex(A[1][0])} & ${tex(A[1][1])} - \\lambda \\end{vmatrix} = ${texPoly([1, b, c], "\\lambda")}`} />
          </li>
          <li>
            <div className="step-n">2. Raízes</div>
            <MathTex t={`\\Delta = ${tex(b * b - 4 * c)} \\Rightarrow ${valuesTex}`} />
          </li>
          {eigVecs.length > 0 && e.kind !== "complex" && (
            <li>
              <div className="step-n">3. Autovetores: núcleo de A − λI</div>
              {e.vectors.map((ev, i) => (
                <div key={i}>
                  <MathTex t={`\\lambda = ${tex(e.values[i] ?? e.values[0])}: \\quad ${o4(`\\vec v = t${texTuple(ev)}`)},\\ t \\neq 0`} />
                </div>
              ))}
            </li>
          )}
        </ol>
      }
    >
      <Block title="Equação">
        <LiveEquation
          general={`A${o1("\\vec v")} = \\lambda${o1("\\vec v")}`}
          current={`${texMatrix(A)}${o1(texMatrix([[v[0]], [v[1]]]))} = ${o2(texMatrix([[Av[0]], [Av[1]]]))}${aligned ? ` = ${tex(lambdaHere)}${o1(texMatrix([[v[0]], [v[1]]]))}` : ""}`}
        />
        <div style={{ marginTop: 8 }}>
          {nv < 1e-9 ? (
            <Note kind="warn">v = 0 satisfaz Av = λv para qualquer λ, por isso o vetor nulo nunca é chamado de autovetor.</Note>
          ) : aligned ? (
            <Note kind="ok">v é autovetor: Av = {fmtL(lambdaHere)}·v.</Note>
          ) : (
            <Note>Av aponta para outra direção: v não é autovetor. Arraste v até uma reta tracejada.</Note>
          )}
        </div>
      </Block>
      <Block title="Controles">
        <div className="controls">
          <MatrixInput label="A =" value={A} onChange={(m) => set({ A: m })} />
          <label className="row" style={{ fontSize: 14 }}>
            <input type="checkbox" checked={s.circ} onChange={(e) => set({ circ: e.target.checked })} /> Mostrar círculo e sua imagem
          </label>
        </div>
      </Block>
      <Presets
        items={[
          { label: "Simétrica", apply: () => set({ A: [[2, 1], [1, 2]] }) },
          { label: "Triangular", apply: () => set({ A: [[3, 1], [0, 2]] }) },
          { label: "Reflexão", apply: () => set({ A: [[1, 0], [0, -1]] }) },
          { label: "Projeção", apply: () => set({ A: [[1, 0], [0, 0]] }) },
          { label: "Escalar 2I", apply: () => set({ A: [[2, 0], [0, 2]] }) },
          { label: "Cisalhamento", apply: () => set({ A: [[1, 1], [0, 1]] }) },
          { label: "Rotação", apply: () => set({ A: [[0, -1], [1, 0]] }) },
        ]}
      />
      <Block title="Resultados">
        <Results>
          <ResultRow label="p(λ)" tex={`${texPoly([1, b, c], "\\lambda")}`} />
          <ResultRow label="Autovalores" tex={valuesTex} />
          {e.kind !== "complex" && <ResultRow label="Autovetores" tex={o4(e.vectors.map((ev) => texTuple(ev)).join(",\\ "))} />}
        </Results>
        <div style={{ marginTop: 8 }}>
          {e.kind === "complex" && <Note kind="warn">Autovalores complexos: nenhuma direção real é preservada (a matriz gira os vetores).</Note>}
          {e.kind === "repeated-defective" && <Note kind="warn">Autovalor repetido com uma só direção de autovetores: a matriz não é diagonalizável.</Note>}
          {e.kind === "repeated-full" && <Note>A = λI: todo vetor não nulo é autovetor.</Note>}
          {e.kind === "distinct" && <Note kind="ok">Dois autovalores reais distintos: duas direções invariantes, e A é diagonalizável.</Note>}
        </div>
      </Block>
    </ModuleLayout>
  );
}

const MathTex = ({ t }: { t: string }) => <Tex>{t}</Tex>;
const fmtL = (x: number) => (Math.round(x * 100) / 100).toString().replace(".", ",").replace("-", "−");
