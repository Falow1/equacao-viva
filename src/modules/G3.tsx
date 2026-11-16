import { o1, o2, o5, tex, texMatrix, texTuple } from "../math/format";
import { det, identity, lerpM } from "../math/mat";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results, Slider } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow3D, Parallelepiped, Scene3D, type V3 } from "../viz3d";
import { useTween } from "./shared2d";

const r3 = (x: number) => Math.round(x * 1000) / 1000;
const c30 = r3(Math.cos(Math.PI / 6)), s30 = 0.5;

const PRESETS: { label: string; M: number[][]; note: string }[] = [
  { label: "Rotação em z (30°)", M: [[c30, -s30, 0], [s30, c30, 0], [0, 0, 1]], note: "Gira em torno do eixo z: o eixo z fica fixo, volumes e ângulos se preservam (det = 1)." },
  { label: "Rotação em x (30°)", M: [[1, 0, 0], [0, c30, -s30], [0, s30, c30]], note: "Gira em torno do eixo x." },
  { label: "Rotação em y (30°)", M: [[c30, 0, s30], [0, 1, 0], [-s30, 0, c30]], note: "Gira em torno do eixo y (repare no sinal invertido do seno)." },
  { label: "Reflexão no plano xy", M: [[1, 0, 0], [0, 1, 0], [0, 0, -1]], note: "Espelha no plano xy: troca a orientação, por isso det = −1." },
  { label: "Projeção no plano xy", M: [[1, 0, 0], [0, 1, 0], [0, 0, 0]], note: "Achata tudo no plano xy: o cubo vira um quadrado e det = 0." },
  { label: "Escala não uniforme", M: [[2, 0, 0], [0, 1, 0], [0, 0, 0.5]], note: "Estica x por 2 e encolhe z pela metade: o volume fica multiplicado por 2 · 1 · 0,5 = 1." },
  { label: "Cisalhamento", M: [[1, 0, 1], [0, 1, 0], [0, 0, 1]], note: "Empurra as camadas do cubo na direção x conforme a altura z; o volume não muda." },
];

export default function G3() {
  const [s, set, reset] = useUrlState({ A: PRESETS[0].M });
  const A = s.A as number[][];
  const [t, setT, run] = useTween(1);
  const M = lerpM(identity(3), A, t);
  const col = (j: number): V3 => [M[0][j], M[1][j], M[2][j]];
  const D = det(A);
  const preset = PRESETS.find((p) => p.M.every((r, i) => r.every((x, j) => Math.abs(x - A[i][j]) < 1e-3)));

  const graph = (
    <Scene3D R={2} label="Cubo unitário e sua imagem pela matriz">
      <Parallelepiped u={[1, 0, 0]} v={[0, 1, 0]} w={[0, 0, 1]} color="obj-muted" opacity={0.08} />
      <Parallelepiped u={col(0)} v={col(1)} w={col(2)} color="obj4" opacity={0.22} />
      <Arrow3D to={col(0)} color="obj1" label="Ae₁" />
      <Arrow3D to={col(1)} color="obj2" label="Ae₂" />
      <Arrow3D to={col(2)} color="obj5" label="Ae₃" />
    </Scene3D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={() => {
        reset();
        setT(1);
      }}
      snapToggle={false}
      explain={
        <>
          <p>
            Como no plano, uma matriz 3×3 fica determinada pelo que faz com os vetores da base: as colunas de A são Ae₁, Ae₂ e Ae₃. O cubo unitário (cinza)
            vira o paralelepípedo gerado por essas três colunas (roxo).
          </p>
          <p>
            O determinante é o fator de mudança de volume, com sinal: rotações têm det = 1, reflexões det = −1, projeções det = 0. Use o slider t (ou o
            botão Animar) para ver a deformação acontecer, passando da identidade (t = 0) até A (t = 1).
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation
          general={`A = [\\,${o1("A\\vec e_1")}\\ ${o2("A\\vec e_2")}\\ ${o5("A\\vec e_3")}\\,]`}
          current={`A = ${texMatrix(A, { cellClass: (_i, j) => ["obj1", "obj2", "obj5"][j], maxDen: 0, digits: 3 })}`}
        />
      </Block>
      {preset && <Note>{preset.note}</Note>}
      <Block title="Animação">
        <Slider tex="t" value={t} onChange={setT} min={0} max={1} step={0.01} />
        <button type="button" className="btn" onClick={() => run(0, 1, 1600)}>
          Animar de I até A
        </button>
      </Block>
      <Block title="Resultados">
        <Results>
          <ResultRow label="det A" tex={tex(D, { maxDen: 0, digits: 3 })} />
          <ResultRow label="Volume da imagem do cubo" tex={tex(Math.abs(D), { maxDen: 0, digits: 3 })} />
          <ResultRow label={<span className="obj1">Ae₁</span>} tex={o1(texTuple(A.map((r) => r[0]), { maxDen: 0, digits: 3 }))} />
          <ResultRow label={<span className="obj2">Ae₂</span>} tex={o2(texTuple(A.map((r) => r[1]), { maxDen: 0, digits: 3 }))} />
          <ResultRow label={<span className="obj5">Ae₃</span>} tex={o5(texTuple(A.map((r) => r[2]), { maxDen: 0, digits: 3 }))} />
        </Results>
      </Block>
      <Block title="Controles">
        <MatrixInput label="A =" value={A} onChange={(m) => set({ A: m })} colClass={(j) => ["obj1", "obj2", "obj5"][j]} />
      </Block>
      <Presets
        items={PRESETS.map((p) => ({
          label: p.label,
          apply: () => {
            set({ A: p.M });
            run(0, 1, 1400);
          },
        }))}
      />
    </ModuleLayout>
  );
}
