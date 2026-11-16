import { det, lerpM, identity } from "../math/mat";
import { det2Tex, o1, o2, texMatrix } from "../math/format";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results, Slider } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { DraggablePoint, Plane2D, type P2 } from "../viz2d";
import { TransformView, useTween } from "./shared2d";

const c = Math.cos, s = Math.sin;

export default function G1() {
  const [st, set, reset] = useUrlState({ M: [[2, -1], [1, 1]] });
  const M = st.M as number[][];
  const [t, setT, run] = useTween(1);
  const Mt = lerpM(identity(2), M, t);
  const D = det(M);
  const colTex = (j: number) => texMatrix([[M[0][j]], [M[1][j]]]);

  const setCol = (j: number, p: P2) => {
    setT(1);
    set({ M: M.map((row, i) => row.map((x, k) => (k === j ? p[i] : x))) });
  };

  const graph = (
    <Plane2D x={[-5, 5]} y={[-4, 4]} label="Grade do plano transformada pela matriz">
      <TransformView M={Mt} />
      {t > 0.999 && (
        <>
          <DraggablePoint point={[M[0][0], M[1][0]]} onMove={(p) => setCol(0, p)} color="var(--obj1)" />
          <DraggablePoint point={[M[0][1], M[1][1]]} onMove={(p) => setCol(1, p)} color="var(--obj2)" />
        </>
      )}
    </Plane2D>
  );

  const preset = (m: number[][]) => () => {
    set({ M: m.map((r) => r.map((x) => Math.round(x * 1000) / 1000)) });
    run(0, 1, 1200);
  };

  return (
    <ModuleLayout
      graph={graph}
      onReset={() => {
        reset();
        setT(1);
      }}
      explain={
        <>
          <p>
            Uma matriz 2×2 é uma transformação linear do plano. Para saber tudo o que ela faz basta ver para onde vão os vetores da base:
            <strong> a primeira coluna é a imagem de e₁ = (1; 0)</strong> e a segunda é a imagem de e₂ = (0; 1). Qualquer outro vetor vai para a
            mesma combinação das colunas: A(x; y) = x·Ae₁ + y·Ae₂.
          </p>
          <p>
            Por isso a grade quadriculada vira uma grade de paralelogramos. O determinante diz quanto as áreas são multiplicadas; se for negativo, a
            figura F aparece espelhada.
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation
          general={`A\\begin{bmatrix}x\\\\y\\end{bmatrix} = x\\,${o1("Ae_1")} + y\\,${o2("Ae_2")}`}
          current={`${texMatrix(M)}\\begin{bmatrix}x\\\\y\\end{bmatrix} = x\\,${o1(colTex(0))} + y\\,${o2(colTex(1))}`}
        />
      </Block>
      <Block title="Controles">
        <div className="controls">
          <MatrixInput label="A =" value={M} onChange={(m) => { setT(1); set({ M: m }); }} colClass={(j) => (j === 0 ? "obj1" : "obj2")} />
          <Slider label="Animação t" value={t} onChange={setT} min={0} max={1} step={0.01} />
          <div className="row">
            <button type="button" className="btn" onClick={() => run(0, 1, 1500)}>Animar da identidade até A</button>
          </div>
        </div>
      </Block>
      <Presets
        items={[
          { label: "Rotação 90°", apply: preset([[0, -1], [1, 0]]) },
          { label: "Rotação 30°", apply: preset([[c(Math.PI / 6), -s(Math.PI / 6)], [s(Math.PI / 6), c(Math.PI / 6)]]) },
          { label: "Reflexão no eixo x", apply: preset([[1, 0], [0, -1]]) },
          { label: "Reflexão em y = x", apply: preset([[0, 1], [1, 0]]) },
          { label: "Cisalhamento", apply: preset([[1, 1], [0, 1]]) },
          { label: "Escala", apply: preset([[2, 0], [0, 0.5]]) },
          { label: "Projeção no eixo x", apply: preset([[1, 0], [0, 0]]) },
          { label: "Singular", apply: preset([[1, 2], [0.5, 1]]) },
        ]}
      />
      <Block title="Resultados">
        <Results>
          <ResultRow label="det A" tex={det2Tex(M)} />
          <ResultRow label="Fator de área">{`|det A| = ${Math.abs(Math.round(D * 1000) / 1000).toString().replace(".", ",")}`}</ResultRow>
          <ResultRow label="Orientação">{D > 1e-12 ? "Preservada" : D < -1e-12 ? "Invertida (a figura fica espelhada)" : "—"}</ResultRow>
        </Results>
        <div style={{ marginTop: 8 }}>
          {Math.abs(D) < 1e-12 ? (
            <Note kind="warn">
              det A = 0: as colunas são paralelas (ou nulas) e o plano inteiro é achatado {M.every((r) => r.every((x) => Math.abs(x) < 1e-12)) ? "num ponto" : "numa reta"}.
              A transformação não tem inversa.
            </Note>
          ) : (
            <Note>Cada unidade de área vira {Math.abs(Math.round(D * 100) / 100).toString().replace(".", ",")} unidades de área.</Note>
          )}
        </div>
      </Block>
    </ModuleLayout>
  );
}
