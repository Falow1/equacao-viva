import { clRow, o1, o2, o3, o5, tex, texDec, texPar, texRootApprox, texTuple } from "../math/format";
import { angle, cross, dot, norm, triple, type Vec3 } from "../math/vec";
import { fmtDeg } from "../math/format";
const texDeg = (r: number) => fmtDeg(r).replace(",", "{,}").replace("°", "^\\circ");
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { Arrow3D, Parallelepiped, Poly3D, Scene3D, type V3 } from "../viz3d";

export default function A3() {
  const [s, set, reset] = useUrlState({ u: [2, 0, 0], v: [1, 2, 0], w: [0.5, 0.5, 2], mode: "vet" });
  const u = s.u as V3, v = s.v as V3, w = s.w as V3;
  const mixedMode = s.mode === "misto";
  const n = cross(u, v) as V3;
  const area = norm(n);
  const mix = triple(u, v, w);
  const th = angle(u, v);
  const uv: V3 = [u[0] + v[0], u[1] + v[1], u[2] + v[2]];

  const graph = (
    <Scene3D R={4} label="Vetores u, v e o produto vetorial u × v">
      {!mixedMode && <Poly3D points={[[0, 0, 0], u, uv, v]} color="obj4" opacity={0.3} />}
      {mixedMode && <Parallelepiped u={u} v={v} w={w} color="obj4" opacity={0.16} />}
      <Arrow3D to={u} color="obj1" label="u" />
      <Arrow3D to={v} color="obj2" label="v" />
      {mixedMode && <Arrow3D to={w} color="obj5" label="w" />}
      {area > 1e-9 && <Arrow3D to={n} color="obj3" label="u × v" width={3.5} />}
    </Scene3D>
  );

  const comp = (i: number, j: number) => `${texPar(u[i])}\\cdot${texPar(v[j])} - ${texPar(u[j])}\\cdot${texPar(v[i])}`;

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            O <strong>produto vetorial</strong> u × v só existe no espaço. O resultado é um vetor perpendicular a u e a v, com sentido dado pela regra da
            mão direita (dedos de u para v, polegar aponta para u × v) e comprimento igual à <strong>área do paralelogramo</strong> formado por u e v.
          </p>
          <p>
            A ordem importa: v × u = −(u × v). Se u e v são paralelos (ou um deles é nulo), o paralelogramo degenera e u × v = 0.
          </p>
          <p>
            O <strong>produto misto</strong> [u, v, w] = (u × v) · w é o determinante da matriz com u, v, w nas linhas. Seu valor absoluto é o{" "}
            <strong>volume do paralelepípedo</strong>; ele é zero exatamente quando os três vetores são coplanares.
          </p>
        </>
      }
      steps={
        <ol className="steps">
          <li>
            <div className="step-n">1. Monte o determinante formal</div>
            <Tex>{`${o1("\\vec u")} \\times ${o2("\\vec v")} = \\begin{vmatrix} \\vec i & \\vec j & \\vec k \\\\ ${clRow("obj1", u.map((x) => tex(x)))} \\\\ ${clRow("obj2", v.map((x) => tex(x)))} \\end{vmatrix}`}</Tex>
          </li>
          <li>
            <div className="step-n">2. Desenvolva pela primeira linha</div>
            <div>
              <Tex>{`x: ${comp(1, 2)} = ${tex(n[0])}`}</Tex>
            </div>
            <div>
              <Tex>{`y: ${comp(2, 0)} = ${tex(n[1])}`}</Tex>
            </div>
            <div>
              <Tex>{`z: ${comp(0, 1)} = ${tex(n[2])}`}</Tex>
            </div>
          </li>
          <li>
            <div className="step-n">3. Confira a perpendicularidade</div>
            <Tex>{`(${o1("\\vec u")}\\times${o2("\\vec v")})\\cdot${o1("\\vec u")} = ${tex(dot(n, u))},\\quad (${o1("\\vec u")}\\times${o2("\\vec v")})\\cdot${o2("\\vec v")} = ${tex(dot(n, v))}`}</Tex>
          </li>
          {mixedMode && (
            <li>
              <div className="step-n">4. Produto misto</div>
              <Tex>{`(${o1("\\vec u")}\\times${o2("\\vec v")})\\cdot${o5("\\vec w")} = ${texPar(n[0])}\\cdot${texPar(w[0])} + ${texPar(n[1])}\\cdot${texPar(w[1])} + ${texPar(n[2])}\\cdot${texPar(w[2])} = ${tex(mix)}`}</Tex>
            </li>
          )}
        </ol>
      }
    >
      <Segmented
        label="O que mostrar"
        value={s.mode as "vet" | "misto"}
        onChange={(m) => set({ mode: m })}
        options={[
          { value: "vet", label: "Produto vetorial" },
          { value: "misto", label: "Produto misto" },
        ]}
      />
      <Block title="Equação">
        {!mixedMode ? (
          <LiveEquation
            general={`${o1("\\vec u")} \\times ${o2("\\vec v")} = \\begin{vmatrix} \\vec i & \\vec j & \\vec k \\\\ ${clRow("obj1", ["u_1", "u_2", "u_3"])} \\\\ ${clRow("obj2", ["v_1", "v_2", "v_3"])} \\end{vmatrix}`}
            current={`${o1(texTuple(u))} \\times ${o2(texTuple(v))} = ${o3(texTuple(n))}`}
          />
        ) : (
          <LiveEquation
            general={`[${o1("\\vec u")}, ${o2("\\vec v")}, ${o5("\\vec w")}] = \\begin{vmatrix} ${clRow("obj1", ["u_1", "u_2", "u_3"])} \\\\ ${clRow("obj2", ["v_1", "v_2", "v_3"])} \\\\ ${clRow("obj5", ["w_1", "w_2", "w_3"])} \\end{vmatrix}`}
            current={`\\begin{vmatrix} ${clRow("obj1", u.map((x) => tex(x)))} \\\\ ${clRow("obj2", v.map((x) => tex(x)))} \\\\ ${clRow("obj5", w.map((x) => tex(x)))} \\end{vmatrix} = ${tex(mix)}`}
          />
        )}
      </Block>
      {area < 1e-9 && <Note kind="warn">u e v são paralelos (ou um deles é nulo): o paralelogramo não tem área e u × v = 0.</Note>}
      {mixedMode && Math.abs(mix) < 1e-9 && area > 1e-9 && <Note kind="warn">O produto misto é zero: u, v e w são coplanares e o paralelepípedo fica achatado.</Note>}
      <Block title="Resultados">
        <Results>
          <ResultRow label="u × v" tex={o3(texTuple(n))} />
          <ResultRow label="Área do paralelogramo" tex={`\\lVert ${o1("\\vec u")}\\times${o2("\\vec v")}\\rVert = ${texRootApprox(dot(n, n))}`} />
          {th !== null && <ResultRow label="Ângulo entre u e v" tex={`\\theta = ${texDeg(th)}`} />}
          <ResultRow label="Conferência" tex={`\\lVert u\\rVert\\lVert v\\rVert\\sin\\theta \\approx ${texDec(norm(u) * norm(v) * Math.sin(th ?? 0))}`} />
          <ResultRow label="v × u" tex={texTuple(cross(v, u) as Vec3)} />
          {mixedMode && <ResultRow label="Volume" tex={`|[u, v, w]| = ${tex(Math.abs(mix))}`} />}
        </Results>
      </Block>
      <Block title="Controles">
        <div className="controls">
          <VecInput label={o1("\\vec u")} value={u} onChange={(x) => set({ u: x })} />
          <VecInput label={o2("\\vec v")} value={v} onChange={(x) => set({ v: x })} />
          {mixedMode && <VecInput label={o5("\\vec w")} value={w} onChange={(x) => set({ w: x })} />}
        </div>
      </Block>
      <Presets
        items={[
          { label: "i × j = k", apply: () => set({ u: [1, 0, 0], v: [0, 1, 0], mode: "vet" }) },
          { label: "j × i = −k", apply: () => set({ u: [0, 1, 0], v: [1, 0, 0], mode: "vet" }) },
          { label: "Inclinados", apply: () => set({ u: [2, 0, 1], v: [0, 2, 1], mode: "vet" }) },
          { label: "Paralelos", apply: () => set({ u: [1, 1, 0], v: [2, 2, 0], mode: "vet" }) },
          { label: "Paralelepípedo", apply: () => set({ u: [2, 0, 0], v: [1, 2, 0], w: [0.5, 0.5, 2], mode: "misto" }) },
          { label: "Coplanares", apply: () => set({ u: [2, 0, 0], v: [0, 2, 0], w: [1, 1, 0], mode: "misto" }) },
        ]}
      />
    </ModuleLayout>
  );
}
