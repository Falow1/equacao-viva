import { tex, texMatrix, texTuple } from "../math/format";
import { columnSpace, nullspace } from "../math/linsys";
import { rank } from "../math/mat";
import { cross, isZeroVec, type Vec3 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow3D, Line3D, PlaneMesh, Point3D, Scene3D, type V3 } from "../viz3d";

const DEF = [[1, 0, 1], [0, 1, 1], [1, 1, 2]];

/** Desenha o subespaço gerado por uma base (ponto, reta, plano ou espaço). */
function Subspace({ basis, color }: { basis: number[][]; color: string }) {
  if (basis.length === 0) return <Point3D at={[0, 0, 0]} color={color} size={0.14} />;
  if (basis.length === 1) return <Line3D line={{ p: [0, 0, 0], v: basis[0] as Vec3 }} color={color} width={6} />;
  if (basis.length === 2) {
    const n = cross(basis[0] as Vec3, basis[1] as Vec3);
    return isZeroVec(n) ? null : <PlaneMesh plane={{ n, d: 0 }} color={color} opacity={0.3} />;
  }
  return null;
}

const DIM_NAME = ["{0} (só a origem)", "uma reta pela origem", "um plano pela origem", "ℝ³ inteiro"];

export default function F4() {
  const [s, set, reset] = useUrlState({ A: DEF });
  const A = s.A as number[][];
  const ker = nullspace(A);
  const img = columnSpace(A);
  const r = rank(A);
  const nul = 3 - r;
  const cols = [0, 1, 2].map((j) => [A[0][j], A[1][j], A[2][j]] as V3);

  const graph = (
    <div className="split-graph">
      <div>
        <span className="split-title">Domínio: núcleo N(A)</span>
        <Scene3D R={3} label="Domínio com o núcleo da matriz">
          <Subspace basis={ker} color="obj6" />
          {ker.map((v, i) => (
            <Arrow3D key={i} to={v as V3} color="obj6" width={3} />
          ))}
          <Arrow3D to={[1, 0, 0]} color="obj1" label="e₁" width={2.5} />
          <Arrow3D to={[0, 1, 0]} color="obj2" label="e₂" width={2.5} />
          <Arrow3D to={[0, 0, 1]} color="obj5" label="e₃" width={2.5} />
        </Scene3D>
      </div>
      <div>
        <span className="split-title">Contradomínio: imagem Im(A)</span>
        <Scene3D R={3} label="Contradomínio com a imagem da matriz">
          <Subspace basis={img} color="obj4" />
          <Arrow3D to={cols[0]} color="obj1" label="Ae₁" width={3} />
          <Arrow3D to={cols[1]} color="obj2" label="Ae₂" width={3} />
          <Arrow3D to={cols[2]} color="obj5" label="Ae₃" width={3} />
        </Scene3D>
      </div>
    </div>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Para uma matriz A (3×3) vista como transformação T(x) = Ax, o <strong>núcleo</strong> N(A) é o conjunto dos vetores que vão parar na origem
            (Ax = 0), e a <strong>imagem</strong> Im(A) é o conjunto de todos os resultados possíveis Ax. A imagem é gerada pelas colunas de A, que são as
            imagens Ae₁, Ae₂, Ae₃ dos vetores da base canônica.
          </p>
          <p>
            Os dois são subespaços (ponto, reta, plano ou o espaço todo) e se equilibram: o <strong>teorema do núcleo e da imagem</strong> diz que
            dim N(A) + dim Im(A) = 3. Quanto mais a transformação “esmaga” (núcleo grande), menor fica a imagem.
          </p>
          <p>
            T é <strong>injetora</strong> quando N(A) = {"{0}"}, <strong>sobrejetora</strong> quando Im(A) = ℝ³ e, sendo as duas coisas, é um{" "}
            <strong>isomorfismo</strong> (A invertível).
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation general={"\\operatorname{posto}(A) + \\operatorname{nulidade}(A) = 3"} current={`${r} + ${nul} = 3`} />
      </Block>
      <Block title="Resultados">
        <Results>
          <ResultRow label={<span className="obj6">Núcleo N(A)</span>} tex={ker.length ? `[${ker.map((v) => texTuple(v)).join(",\\ ")}]` : "\\{\\vec 0\\}"} />
          <ResultRow label="É" tex={`\\text{${DIM_NAME[ker.length]}}`} />
          <ResultRow label={<span className="obj4">Imagem Im(A)</span>} tex={img.length ? `[${img.map((v) => texTuple(v)).join(",\\ ")}]` : "\\{\\vec 0\\}"} />
          <ResultRow label="É" tex={`\\text{${DIM_NAME[img.length]}}`} />
          <ResultRow label="Posto" tex={tex(r)} />
          <ResultRow label="Nulidade" tex={tex(nul)} />
        </Results>
      </Block>
      <Note kind={r === 3 ? "ok" : "warn"}>
        {r === 3
          ? "Núcleo trivial e imagem igual a ℝ³: a transformação é injetora, sobrejetora e portanto um isomorfismo (A é invertível)."
          : `A transformação não é injetora (há vetores não nulos com Ax = 0) nem sobrejetora (a imagem é só ${DIM_NAME[r]}).`}
      </Note>
      <Block title="Controles">
        <MatrixInput label="A =" value={A} onChange={(m) => set({ A: m })} colClass={(j) => ["obj1", "obj2", "obj5"][j]} />
        <div className="mt-8">
          <LiveEquation current={`A = ${texMatrix(A, { cellClass: (_i, j) => ["obj1", "obj2", "obj5"][j] })}`} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Posto 2 (núcleo reta)", apply: () => set({ A: DEF }) },
          { label: "Invertível", apply: () => set({ A: [[2, 1, 0], [0, 1, 1], [1, 0, 1]] }) },
          { label: "Projeção no plano xy", apply: () => set({ A: [[1, 0, 0], [0, 1, 0], [0, 0, 0]] }) },
          { label: "Posto 1 (núcleo plano)", apply: () => set({ A: [[1, 1, 1], [2, 2, 2], [-1, -1, -1]] }) },
          { label: "Matriz nula", apply: () => set({ A: [[0, 0, 0], [0, 0, 0], [0, 0, 0]] }) },
        ]}
      />
    </ModuleLayout>
  );
}
