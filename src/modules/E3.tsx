import { det2Tex, o1, o2, o5, tex, texMatrix, texPar } from "../math/format";
import { det } from "../math/mat";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results, Segmented } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { Arrow, DraggablePoint, Fill, Plane2D, type P2 } from "../viz2d";
import { Arrow3D, Parallelepiped, Scene3D, type V3 } from "../viz3d";

const DEF2 = [[3, 1], [1, 2]];
const DEF3 = [[2, 0, 0.5], [0, 2, 0.5], [0, 0, 1.5]];

export default function E3() {
  const [s, set, reset] = useUrlState({ dim: "2", A2: DEF2, A3: DEF3 });
  const is3 = s.dim === "3";
  const A2 = s.A2 as number[][];
  const A3 = s.A3 as number[][];
  const A = is3 ? A3 : A2;
  const D = det(A);
  const pos = D > 1e-9, neg = D < -1e-9;
  const fillColor = pos ? "obj4" : "obj6";
  const c1: P2 = [A2[0][0], A2[1][0]];
  const c2: P2 = [A2[0][1], A2[1][1]];
  const col3 = (j: number): V3 => [A3[0][j], A3[1][j], A3[2][j]];

  const graph = is3 ? (
    <Scene3D R={4} label="Paralelepípedo gerado pelas colunas da matriz">
      <Parallelepiped u={col3(0)} v={col3(1)} w={col3(2)} color={fillColor} opacity={0.22} />
      <Arrow3D to={col3(0)} color="obj1" label="c₁" />
      <Arrow3D to={col3(1)} color="obj2" label="c₂" />
      <Arrow3D to={col3(2)} color="obj5" label="c₃" />
    </Scene3D>
  ) : (
    <Plane2D x={[-4, 5]} y={[-3, 5]} label="Paralelogramo gerado pelas colunas da matriz">
      <Fill points={[[0, 0], [1, 0], [1, 1], [0, 1]]} color="var(--obj-muted)" opacity={0.15} />
      <Fill points={[[0, 0], c1, [c1[0] + c2[0], c1[1] + c2[1]], c2]} color={`var(--${fillColor})`} opacity={0.4} stroke />
      <Arrow tip={c1} color="var(--obj1)" label="c₁" />
      <Arrow tip={c2} color="var(--obj2)" label="c₂" />
      <DraggablePoint point={c1} onMove={(p) => set({ A2: [[p[0], A2[0][1]], [p[1], A2[1][1]]] })} color="var(--obj1)" />
      <DraggablePoint point={c2} onMove={(p) => set({ A2: [[A2[0][0], p[0]], [A2[1][0], p[1]]] })} color="var(--obj2)" />
    </Plane2D>
  );

  const [[a, b, c], [d, e, f], [g, h, i]] = A3;
  const p = (...xs: number[]) => xs.map(texPar).join("\\cdot");

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            As colunas de uma matriz 2×2 são dois vetores. O <strong>determinante</strong> é a área do paralelogramo que eles formam, com sinal: positivo
            quando ir de c₁ para c₂ é girar no sentido anti-horário (cor roxa), negativo no sentido horário (outra cor). Em 3D, é o volume com sinal do
            paralelepípedo gerado pelas três colunas.
          </p>
          <p>
            Visto como transformação, det A diz por quanto A multiplica áreas (ou volumes): o quadrado unitário cinza vira o paralelogramo colorido.
            Quando det A = 0, a figura achata numa reta ou num plano, a matriz não tem inversa e o sistema Ax = b não tem solução única.
          </p>
          <p>
            Propriedades úteis: trocar duas colunas (ou linhas) troca o sinal; multiplicar uma coluna por k multiplica det por k; det(AB) = det A · det B
            (teorema de Binet); det Aᵀ = det A.
          </p>
        </>
      }
      steps={
        is3 ? (
          <ol className="steps">
            <li>
              <div className="step-n">Regra de Sarrus</div>
              <Tex>{`\\det A = ${p(a, e, i)} + ${p(b, f, g)} + ${p(c, d, h)} - ${p(c, e, g)} - ${p(a, f, h)} - ${p(b, d, i)}`}</Tex>
            </li>
            <li>
              <div className="step-n">Laplace pela primeira linha</div>
              <Tex>{`\\det A = ${texPar(a)}\\begin{vmatrix} ${tex(e)} & ${tex(f)} \\\\ ${tex(h)} & ${tex(i)} \\end{vmatrix} - ${texPar(b)}\\begin{vmatrix} ${tex(d)} & ${tex(f)} \\\\ ${tex(g)} & ${tex(i)} \\end{vmatrix} + ${texPar(c)}\\begin{vmatrix} ${tex(d)} & ${tex(e)} \\\\ ${tex(g)} & ${tex(h)} \\end{vmatrix}`}</Tex>
              <div>
                <Tex>{`= ${texPar(a)}\\cdot${texPar(e * i - f * h)} - ${texPar(b)}\\cdot${texPar(d * i - f * g)} + ${texPar(c)}\\cdot${texPar(d * h - e * g)} = ${tex(D)}`}</Tex>
              </div>
            </li>
          </ol>
        ) : (
          <ol className="steps">
            <li>
              <div className="step-n">Produto das diagonais</div>
              <Tex>{`\\det A = ad - bc = ${det2Tex(A2)}`}</Tex>
            </li>
          </ol>
        )
      }
    >
      <Segmented
        label="Dimensão"
        value={s.dim as "2" | "3"}
        onChange={(x) => set({ dim: x })}
        options={[
          { value: "2", label: "2 × 2 (área)" },
          { value: "3", label: "3 × 3 (volume)" },
        ]}
      />
      <Block title="Equação">
        <LiveEquation
          general={is3 ? `\\det A = \\pm\\,\\text{volume}(${o1("c_1")}, ${o2("c_2")}, ${o5("c_3")})` : `\\det A = \\pm\\,\\text{área}(${o1("c_1")}, ${o2("c_2")})`}
          current={`${texMatrix(A, { delim: "v", cellClass: (_r, j) => ["obj1", "obj2", "obj5"][j] })} = ${tex(D)}`}
        />
      </Block>
      {pos && <Note kind="ok">det A &gt; 0: a orientação é preservada (c₁ → c₂{is3 ? " → c₃ segue a regra da mão direita" : " gira no sentido anti-horário"}).</Note>}
      {neg && <Note kind="warn">det A &lt; 0: a orientação é invertida, como num espelho. O {is3 ? "volume" : "área"} é |det A| = {String(Math.round(Math.abs(D) * 100) / 100).replace(".", ",")}.</Note>}
      {!pos && !neg && <Note kind="bad">det A = 0: as colunas são linearmente dependentes, a figura é achatada e A não é invertível.</Note>}
      <Block title="Resultados">
        <Results>
          <ResultRow label={is3 ? "Volume" : "Área"} tex={`|\\det A| = ${tex(Math.abs(D))}`} />
          <ResultRow label="Orientação" tex={pos ? "\\text{preservada}" : neg ? "\\text{invertida}" : "\\text{degenerada}"} />
          <ResultRow label="Invertível?" tex={Math.abs(D) > 1e-9 ? "\\text{sim}" : "\\text{não}"} />
        </Results>
      </Block>
      <Block title="Controles">
        {is3 ? (
          <MatrixInput label="A =" value={A3} onChange={(m) => set({ A3: m })} colClass={(j) => ["obj1", "obj2", "obj5"][j]} />
        ) : (
          <MatrixInput label="A =" value={A2} onChange={(m) => set({ A2: m })} colClass={(j) => ["obj1", "obj2"][j]} />
        )}
      </Block>
      <Presets
        items={
          is3
            ? [
                { label: "Caixa inclinada", apply: () => set({ A3: DEF3 }) },
                { label: "Identidade", apply: () => set({ A3: [[1, 0, 0], [0, 1, 0], [0, 0, 1]] }) },
                { label: "Colunas coplanares", apply: () => set({ A3: [[1, 0, 1], [0, 1, 1], [0, 0, 0]] }) },
                { label: "Reflexão (det < 0)", apply: () => set({ A3: [[1, 0, 0], [0, 1, 0], [0, 0, -1]] }) },
              ]
            : [
                { label: "Positivo", apply: () => set({ A2: DEF2 }) },
                { label: "Colunas trocadas", apply: () => set({ A2: [[1, 3], [2, 1]] }) },
                { label: "Cisalhamento (det 1)", apply: () => set({ A2: [[1, 1.5], [0, 1]] }) },
                { label: "Colunas paralelas", apply: () => set({ A2: [[1, 2], [2, 4]] }) },
              ]
        }
      />
    </ModuleLayout>
  );
}
