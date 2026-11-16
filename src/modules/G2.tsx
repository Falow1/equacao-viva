import { det, identity, inverse, lerpM, mul } from "../math/mat";
import { det2Tex, o1, o2, tex, texMatrix } from "../math/format";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results, Segmented, Slider } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Plane2D } from "../viz2d";
import { TransformView, useTween } from "./shared2d";

type Mode = "AB" | "BA" | "inv";

const eq = (X: number[][], Y: number[][]) => X.every((r, i) => r.every((x, j) => Math.abs(x - Y[i][j]) < 1e-9));

export default function G2() {
  const [st, set, reset] = useUrlState({ A: [[0, -1], [1, 0]], B: [[1, 1], [0, 1]], modo: "AB" as Mode });
  const A = st.A as number[][], B = st.B as number[][];
  const mode = st.modo as Mode;
  const [e, setE, run] = useTween(2);
  const AB = mul(A, B), BA = mul(B, A);
  const Ainv = inverse(A);
  // primeira e segunda transformação conforme o modo
  const first = mode === "AB" ? B : A;
  const second = mode === "AB" ? A : mode === "BA" ? B : Ainv ?? A;
  const total = mode === "inv" ? (Ainv ? identity(2) : A) : mul(second, first);
  const Mcur = e <= 1 ? lerpM(identity(2), first, e) : lerpM(first, total, e - 1);

  const graph = (
    <Plane2D x={[-5, 5]} y={[-4, 4]} label="Composição de transformações">
      <TransformView M={Mcur} labels={false} />
    </Plane2D>
  );

  const stageText =
    mode === "inv"
      ? e <= 1 ? "Etapa 1: aplicando A" : Ainv ? "Etapa 2: aplicando A⁻¹, que desfaz A" : "Etapa 2: impossível desfazer (A não tem inversa)"
      : e <= 1 ? `Etapa 1: aplicando ${mode === "AB" ? "B" : "A"}` : `Etapa 2: aplicando ${mode === "AB" ? "A" : "B"} ao resultado`;

  return (
    <ModuleLayout
      graph={graph}
      onReset={() => {
        reset();
        setE(2);
      }}
      snapToggle={false}
      explain={
        <>
          <p>
            Aplicar primeiro B e depois A é o mesmo que aplicar a matriz produto <strong>AB</strong> (a ordem da escrita é inversa da ordem de
            aplicação, como em funções: A(Bx)). Em geral AB ≠ BA: compare as duas ordens com uma rotação e um cisalhamento.
          </p>
          <p>
            A inversa A⁻¹ desfaz A: A⁻¹A = I. Ela só existe quando det A ≠ 0. Se det A = 0, A achata o plano numa reta, pontos diferentes caem no mesmo
            lugar e não há como saber de onde cada um veio. Vale também (AB)⁻¹ = B⁻¹A⁻¹.
          </p>
        </>
      }
    >
      <Block title="Modo">
        <Segmented<Mode>
          label="Modo"
          value={mode}
          onChange={(m) => {
            set({ modo: m });
            run(0, 2, 2400);
          }}
          options={[
            { value: "AB", label: "B, depois A (AB)" },
            { value: "BA", label: "A, depois B (BA)" },
            { value: "inv", label: "A e a inversa" },
          ]}
        />
      </Block>
      <Block title="Equação">
        {mode === "inv" ? (
          <LiveEquation general="A^{-1}A = I" current={Ainv ? `${texMatrix(Ainv)}${texMatrix(A)} = ${texMatrix(identity(2))}` : `\\det A = 0 \\Rightarrow A^{-1}\\ \\text{não existe}`} />
        ) : (
          <LiveEquation
            general={mode === "AB" ? `${o1("A")}${o2("B")}\\vec x = ${o1("A")}(${o2("B")}\\vec x)` : `${o2("B")}${o1("A")}\\vec x = ${o2("B")}(${o1("A")}\\vec x)`}
            current={mode === "AB" ? `${o1(texMatrix(A))}${o2(texMatrix(B))} = ${texMatrix(AB)}` : `${o2(texMatrix(B))}${o1(texMatrix(A))} = ${texMatrix(BA)}`}
          />
        )}
      </Block>
      <Block title="Controles">
        <div className="controls">
          <div className="row" style={{ gap: 16 }}>
            <MatrixInput label={o1("A =")} value={A} onChange={(m) => set({ A: m })} />
            {mode !== "inv" && <MatrixInput label={o2("B =")} value={B} onChange={(m) => set({ B: m })} />}
          </div>
          <Slider label="Etapa" value={e} onChange={setE} min={0} max={2} step={0.01} />
          <p className="muted" style={{ margin: 0, fontSize: 14 }}>{stageText}</p>
          <div className="row">
            <button type="button" className="btn" onClick={() => run(0, 2, 2400)}>Animar as duas etapas</button>
          </div>
        </div>
      </Block>
      <Presets
        items={[
          { label: "Rotação e cisalhamento", apply: () => { set({ A: [[0, -1], [1, 0]], B: [[1, 1], [0, 1]] }); run(0, 2, 2400); } },
          { label: "Duas reflexões", apply: () => { set({ A: [[1, 0], [0, -1]], B: [[0, 1], [1, 0]] }); run(0, 2, 2400); } },
          { label: "Escalas (comutam)", apply: () => { set({ A: [[2, 0], [0, 1]], B: [[1, 0], [0, 0.5]] }); run(0, 2, 2400); } },
          { label: "A singular", apply: () => { set({ A: [[1, 2], [0.5, 1]], modo: "inv" }); run(0, 2, 2400); } },
        ]}
      />
      <Block title="Resultados">
        <Results>
          <ResultRow label="AB" tex={texMatrix(AB)} />
          <ResultRow label="BA" tex={texMatrix(BA)} />
          <ResultRow label="AB = BA?">{eq(AB, BA) ? "Sim, neste caso elas comutam" : "Não: a ordem muda o resultado"}</ResultRow>
          <ResultRow label="det A" tex={det2Tex(A)} />
          <ResultRow label="A⁻¹" tex={Ainv ? `\\dfrac{1}{${tex(det(A))}}${texMatrix([[A[1][1], -A[0][1]], [-A[1][0], A[0][0]]])} = ${texMatrix(Ainv)}` : "\\text{não existe}"} />
        </Results>
        {mode === "inv" && !Ainv && (
          <div style={{ marginTop: 8 }}>
            <Note kind="warn">det A = 0: A achata o plano numa reta. Como vários pontos vão para o mesmo lugar, não existe transformação que desfaça A.</Note>
          </div>
        )}
      </Block>
    </ModuleLayout>
  );
}
