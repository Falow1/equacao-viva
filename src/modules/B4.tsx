import { o1, o2, o3, o5, tex, texAffine, texEquation, texLinear, texShift, texTuple } from "../math/format";
import { planeDirectors, planeFrom3Points, planeFromPointNormal, type Plane } from "../math/space";
import { clean } from "../math/tolerance";
import { cross, isZeroVec, norm, sub, type Vec3 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow3D, Line3D, PlaneMesh, Point3D, Scene3D, type V3 } from "../viz3d";

type Mode = "geral" | "normal" | "pontos";
const XYZ = ["x", "y", "z"];

function pointOfPlane(pl: Plane): Vec3 {
  const i = [0, 1, 2].reduce((b, k) => (Math.abs(pl.n[k]) > Math.abs(pl.n[b]) ? k : b), 0);
  const p: Vec3 = [0, 0, 0];
  p[i] = clean(pl.d / pl.n[i]);
  return p;
}

export default function B4() {
  const [s, set, reset] = useUrlState({
    mode: "geral",
    a: 1, b: 2, c: 2, d: 4,
    P0: [1, 1, 1], n: [1, 1, 2],
    A: [2, 0, 0], B: [0, 3, 0], C: [0, 0, 1.5],
  }, { mode: ["geral", "normal", "pontos"] });
  const mode = s.mode as Mode;
  const A = s.A as V3, B = s.B as V3, C = s.C as V3;

  let plane: Plane | null = null;
  let P0: Vec3 = [0, 0, 0];
  let dirs: [Vec3, Vec3] | null = null;
  if (mode === "geral") {
    const n: Vec3 = [s.a, s.b, s.c];
    if (!isZeroVec(n)) {
      plane = { n, d: s.d };
      P0 = pointOfPlane(plane);
      dirs = planeDirectors(n);
    }
  } else if (mode === "normal") {
    const n = s.n as Vec3;
    P0 = s.P0 as Vec3;
    if (!isZeroVec(n)) {
      plane = planeFromPointNormal(P0, n);
      dirs = planeDirectors(n);
    }
  } else {
    P0 = A;
    plane = planeFrom3Points(A, B, C);
    if (plane) dirs = [sub(B, A), sub(C, A)];
  }

  const n = plane?.n;
  const nn = n ? norm(n) : 0;
  const nShow: V3 | null = n ? [P0[0] + (n[0] / nn) * 1.6, P0[1] + (n[1] / nn) * 1.6, P0[2] + (n[2] / nn) * 1.6] : null;
  const intercepts = plane
    ? [0, 1, 2].map((i) => {
        const ni = plane!.n[i];
        if (Math.abs(ni) < 1e-12) return { i, p: null as V3 | null, txt: Math.abs(plane!.d) < 1e-12 ? `o eixo ${XYZ[i]} está contido no plano` : `paralelo ao eixo ${XYZ[i]}` };
        const p: V3 = [0, 0, 0];
        p[i] = clean(plane!.d / ni);
        return { i, p, txt: "" };
      })
    : [];

  const graph = (
    <Scene3D R={4} label="Plano no espaço com vetor normal e interceptos">
      {plane && <PlaneMesh plane={plane} color="obj4" opacity={0.32} R={4} />}
      {plane && nShow && <Arrow3D from={P0 as V3} to={nShow} color="obj2" label="n" width={4} />}
      {plane &&
        intercepts.map(({ i, p }) => (p && Math.abs(p[i]) <= 4.5 ? <Point3D key={i} at={p} color="obj5" size={0.07} label={`${XYZ[i]} = ${String(Math.round(p[i] * 100) / 100).replace(".", ",")}`} labelOffset={[0.3, 0.3, 0.3]} /> : null))}
      {mode === "pontos" && (
        <>
          <Point3D at={A} color="obj1" label="A" />
          <Point3D at={B} color="obj1" label="B" />
          <Point3D at={C} color="obj1" label="C" />
          {plane && dirs && (
            <>
              <Arrow3D from={A} to={B} color="obj3" width={2.5} />
              <Arrow3D from={A} to={C} color="obj3" width={2.5} />
            </>
          )}
          {!plane && !isZeroVec(sub(B, A)) && <Line3D line={{ p: A, v: sub(B, A) }} color="obj6" />}
        </>
      )}
      {mode !== "pontos" && plane && <Point3D at={P0 as V3} color="obj1" label="P₀" />}
    </Scene3D>
  );

  const general = plane ? texEquation(plane.n, ["x", "y", "z"], plane.d) : "";
  const pnTerms = plane ? [0, 1, 2].filter((i) => Math.abs(plane!.n[i]) > 1e-12) : [];
  const pointNormal = plane
    ? `${texLinear(pnTerms.map((i) => plane!.n[i]), pnTerms.map((i) => (Math.abs(P0[i]) < 1e-12 ? XYZ[i] : `(${texShift(XYZ[i], P0[i])})`)))} = 0`
    : "";
  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Um plano fica determinado por um ponto P₀ e um <strong>vetor normal</strong> n (perpendicular ao plano). Um ponto X está no plano quando X − P₀
            é perpendicular a n, isto é, n · (X − P₀) = 0. Abrindo as contas aparece a <strong>equação geral</strong> ax + by + cz = d, em que (a; b; c) é
            justamente o vetor normal.
          </p>
          <p>
            Com três pontos não colineares A, B, C, os vetores AB e AC ficam no plano, e o produto vetorial AB × AC dá uma normal. A forma vetorial usa um
            ponto e dois vetores diretores: X = P₀ + s·u + t·v.
          </p>
          <p>Os interceptos são os pontos onde o plano corta os eixos: zere duas coordenadas e resolva para a terceira.</p>
        </>
      }
    >
      <Segmented
        label="Como definir o plano"
        value={mode}
        onChange={(m) => set({ mode: m })}
        options={[
          { value: "geral", label: "Equação geral" },
          { value: "normal", label: "Ponto e normal" },
          { value: "pontos", label: "Três pontos" },
        ]}
      />
      {plane && dirs ? (
        <Block title="Equações">
          <LiveEquation label="Geral" general={`${o2("a")}x + ${o2("b")}y + ${o2("c")}z = d`} current={general} />
          {mode !== "geral" && <LiveEquation label="Ponto e normal" general={`${o2("\\vec n")}\\cdot(X - ${o1("P_0")}) = 0`} current={pointNormal} />}
          <LiveEquation label="Vetorial" current={`X = ${o1(texTuple(P0))} + s\\,${o3(texTuple(dirs[0]))} + t\\,${o3(texTuple(dirs[1]))}`} />
          <LiveEquation
            label="Paramétricas"
            current={`\\begin{cases} x = ${par(P0[0], dirs[0][0], dirs[1][0])} \\\\ y = ${par(P0[1], dirs[0][1], dirs[1][1])} \\\\ z = ${par(P0[2], dirs[0][2], dirs[1][2])} \\end{cases}`}
          />
        </Block>
      ) : mode === "pontos" ? (
        <Note kind="bad">A, B e C são colineares (ou repetidos): AB × AC = 0, e infinitos planos passam por eles. Mova um dos pontos para fora da reta.</Note>
      ) : (
        <Note kind="bad">O vetor normal é nulo: a equação 0x + 0y + 0z = d não descreve um plano.</Note>
      )}
      {plane && (
        <Block title="Resultados">
          <Results>
            <ResultRow label="Normal" tex={o2(`\\vec n = ${texTuple(plane.n)}`)} />
            {mode === "pontos" && <ResultRow label="AB × AC" tex={`${texTuple(sub(B, A))}\\times${texTuple(sub(C, A))} = ${texTuple(cross(sub(B, A), sub(C, A)))}`} />}
            {intercepts.map(({ i, p, txt }) => (
              <ResultRow key={i} label={`Eixo ${XYZ[i]}`} tex={p ? o5(texTuple(p)) : `\\text{${txt}}`} />
            ))}
          </Results>
        </Block>
      )}
      <Block title="Controles">
        <div className="controls">
          {mode === "geral" && (
            <>
              <Slider tex={o2("a")} value={s.a} onChange={(x) => set({ a: x })} min={-5} max={5} />
              <Slider tex={o2("b")} value={s.b} onChange={(x) => set({ b: x })} min={-5} max={5} />
              <Slider tex={o2("c")} value={s.c} onChange={(x) => set({ c: x })} min={-5} max={5} />
              <Slider tex="d" value={s.d} onChange={(x) => set({ d: x })} min={-10} max={10} />
            </>
          )}
          {mode === "normal" && (
            <>
              <VecInput label={o1("P_0")} value={s.P0 as number[]} onChange={(x) => set({ P0: x })} />
              <VecInput label={o2("\\vec n")} value={s.n as number[]} onChange={(x) => set({ n: x })} />
            </>
          )}
          {mode === "pontos" && (
            <>
              <VecInput label={o1("A")} value={A} onChange={(x) => set({ A: x })} />
              <VecInput label={o1("B")} value={B} onChange={(x) => set({ B: x })} />
              <VecInput label={o1("C")} value={C} onChange={(x) => set({ C: x })} />
            </>
          )}
        </div>
      </Block>
      <Presets
        items={[
          { label: "x + 2y + 2z = 4", apply: () => set({ mode: "geral", a: 1, b: 2, c: 2, d: 4 }) },
          { label: "Plano z = 2", apply: () => set({ mode: "geral", a: 0, b: 0, c: 1, d: 2 }) },
          { label: "Paralelo ao eixo z", apply: () => set({ mode: "geral", a: 1, b: 1, c: 0, d: 2 }) },
          { label: "Pela origem", apply: () => set({ mode: "geral", a: 1, b: -1, c: 1, d: 0 }) },
          { label: "Pelos interceptos", apply: () => set({ mode: "pontos", A: [2, 0, 0], B: [0, 3, 0], C: [0, 0, 1.5] }) },
          { label: "Pontos colineares", apply: () => set({ mode: "pontos", A: [0, 0, 0], B: [1, 1, 1], C: [2, 2, 2] }) },
        ]}
      />
    </ModuleLayout>
  );
}

function par(c0: number, k1: number, k2: number): string {
  const first = texAffine(c0, k1, "s");
  if (Math.abs(k2) < 1e-12) return first;
  const mag = Math.abs(k2);
  const term = Math.abs(mag - 1) < 1e-12 ? "t" : `${tex(mag)}t`;
  if (first === "0") return (k2 < 0 ? "-" : "") + term;
  return `${first} ${k2 < 0 ? "-" : "+"} ${term}`;
}
