import type { ReactNode } from "react";
import { o1, o2, o3, o5, tex, texDec, texDeg, texEquation, texRootApprox, texTuple } from "../math/format";
import {
  distPointLine3,
  distPointPlane,
  footOnLine,
  footOnPlane,
  relLineLine,
  relLinePlane,
  relPlanePlane,
  type Line3,
  type Plane,
} from "../math/space";
import { cross, dot, isZeroVec, sub, type Vec3 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Line3D, PlaneMesh, Point3D, Scene3D, Seg3D, type V3 } from "../viz3d";

type Sc = "rr" | "rp" | "pp" | "ptp" | "ptr";
const SCEN: { value: Sc; label: string }[] = [
  { value: "rr", label: "Reta × reta" },
  { value: "rp", label: "Reta × plano" },
  { value: "pp", label: "Plano × plano" },
  { value: "ptp", label: "Ponto × plano" },
  { value: "ptr", label: "Ponto × reta" },
];

const DEF = {
  sc: "rr",
  rA: [0, 0, 1], rv: [1, 0, 0],
  sA: [0, 0, -1], sv: [0, 1, 0],
  n1: [0, 0, 1], d1: 1,
  n2: [1, 1, 0], d2: 1,
  P: [2, 2, 2],
};

const lineTex = (l: Line3) => `X = ${texTuple(l.p)} + t\\,${texTuple(l.v)}`;
const planeTex = (p: Plane) => texEquation(p.n, ["x", "y", "z"], p.d);

export default function B5() {
  const [s, set, reset] = useUrlState(DEF);
  const sc = s.sc as Sc;
  const r: Line3 = { p: s.rA as Vec3, v: s.rv as Vec3 };
  const l2: Line3 = { p: s.sA as Vec3, v: s.sv as Vec3 };
  const p1: Plane = { n: s.n1 as Vec3, d: s.d1 };
  const p2: Plane = { n: s.n2 as Vec3, d: s.d2 };
  const P = s.P as V3;

  const usesR = sc === "rr" || sc === "rp" || sc === "ptr";
  const usesS = sc === "rr";
  const usesP1 = sc === "rp" || sc === "pp" || sc === "ptp";
  const usesP2 = sc === "pp";
  const usesPt = sc === "ptp" || sc === "ptr";

  const bad =
    (usesR && isZeroVec(r.v)) || (usesS && isZeroVec(l2.v)) || (usesP1 && isZeroVec(p1.n)) || (usesP2 && isZeroVec(p2.n));

  let scene: ReactNode = null;
  let verdict: { kind: "ok" | "warn" | "info"; text: string } | null = null;
  let calc: ReactNode = null;

  if (!bad) {
    if (sc === "rr") {
      const rel = relLineLine(r, l2);
      const w = sub(l2.p, r.p);
      const vxw = cross(r.v, l2.v);
      if (rel.kind === "concorrentes") {
        verdict = { kind: "ok", text: `As retas são concorrentes: cortam-se num único ponto, com ângulo de ${(rel.angle * 180 / Math.PI).toFixed(1).replace(".", ",")}°.` };
        scene = <Point3D at={rel.point as V3} color="obj3" label="I" />;
        calc = (
          <Results>
            <ResultRow label="Produto misto" tex={`[\\overrightarrow{AB}, \\vec u, \\vec v] = ${tex(dot(w, vxw))}`} />
            <ResultRow label="Interseção" tex={o3(`I = ${texTuple(rel.point)}`)} />
            <ResultRow label="Ângulo" tex={`\\theta = ${texDeg(rel.angle)}`} />
          </Results>
        );
      } else if (rel.kind === "reversas") {
        verdict = { kind: "warn", text: "As retas são reversas: não se cortam e não são paralelas (não existe plano que contenha as duas)." };
        scene = (
          <>
            <Seg3D a={rel.A as V3} b={rel.B as V3} color="obj3" width={3} />
            <Point3D at={rel.A as V3} color="obj3" size={0.07} />
            <Point3D at={rel.B as V3} color="obj3" size={0.07} />
          </>
        );
        calc = (
          <>
            <LiveEquation general={`d(r, s) = \\dfrac{|[\\overrightarrow{AB},\\ \\vec u,\\ \\vec v]|}{\\lVert \\vec u \\times \\vec v \\rVert}`} current={`d = \\dfrac{|${tex(rel.mixed)}|}{${texRootApprox(dot(vxw, vxw))}} \\approx ${texDec(rel.distance)}`} />
            <Results>
              <ResultRow label="AB" tex={texTuple(w)} />
              <ResultRow label="u × v" tex={texTuple(vxw)} />
              <ResultRow label="Pontos mais próximos" tex={o3(`${texTuple(rel.A, { maxDen: 0 })},\\ ${texTuple(rel.B, { maxDen: 0 })}`)} />
              <ResultRow label="Ângulo entre direções" tex={`${texDeg(rel.angle)}`} />
            </Results>
          </>
        );
      } else if (rel.kind === "paralelas") {
        verdict = { kind: "info", text: "As retas são paralelas e distintas: mesma direção, sem ponto comum." };
        scene = <Seg3D a={rel.A as V3} b={rel.B as V3} color="obj3" width={3} />;
        calc = (
          <LiveEquation
            general={`d(r, s) = \\dfrac{\\lVert \\overrightarrow{AB} \\times \\vec u \\rVert}{\\lVert \\vec u \\rVert}`}
            current={`d = \\dfrac{${texRootApprox(dot(cross(w, r.v), cross(w, r.v)))}}{${texRootApprox(dot(r.v, r.v))}} \\approx ${texDec(rel.distance)}`}
          />
        );
      } else {
        verdict = { kind: "info", text: "As retas são coincidentes: são a mesma reta escrita de dois jeitos." };
      }
    } else if (sc === "rp") {
      const rel = relLinePlane(r, p1);
      const nv = dot(p1.n, r.v);
      if (rel.kind === "secante") {
        verdict = { kind: "ok", text: rel.perpendicular ? "A reta é perpendicular ao plano e o fura num ponto." : `A reta fura o plano num ponto, com ângulo de ${(rel.angle * 180 / Math.PI).toFixed(1).replace(".", ",")}° em relação a ele.` };
        scene = <Point3D at={rel.point as V3} color="obj3" label="I" />;
        const t = (p1.d - dot(p1.n, r.p)) / nv;
        calc = (
          <Results>
            <ResultRow label="n · u" tex={`${tex(nv)} \\neq 0`} />
            <ResultRow label="Parâmetro" tex={`t = \\dfrac{d - \\vec n\\cdot A}{\\vec n\\cdot\\vec u} = ${tex(t)}`} />
            <ResultRow label="Interseção" tex={o3(`I = ${texTuple(rel.point)}`)} />
          </Results>
        );
      } else if (rel.kind === "paralela") {
        const F = footOnPlane(r.p, p1);
        verdict = { kind: "info", text: "A reta é paralela ao plano (n · u = 0) e não o toca." };
        scene = <Seg3D a={r.p as V3} b={F as V3} color="obj3" width={3} />;
        calc = (
          <LiveEquation general={`d(r, \\pi) = \\dfrac{|\\vec n\\cdot A - d|}{\\lVert\\vec n\\rVert}`} current={`d = \\dfrac{|${tex(dot(p1.n, r.p) - p1.d)}|}{${texRootApprox(dot(p1.n, p1.n))}} \\approx ${texDec(rel.distance)}`} />
        );
      } else {
        verdict = { kind: "info", text: "A reta está contida no plano: n · u = 0 e o ponto A satisfaz a equação do plano." };
      }
    } else if (sc === "pp") {
      const rel = relPlanePlane(p1, p2);
      if (rel.kind === "secantes") {
        verdict = { kind: "ok", text: `Os planos são secantes: cortam-se numa reta, com ângulo de ${(rel.angle * 180 / Math.PI).toFixed(1).replace(".", ",")}°.` };
        scene = <Line3D line={rel.line} color="obj3" width={4} />;
        calc = (
          <Results>
            <ResultRow label="Direção da reta" tex={`\\vec n_1 \\times \\vec n_2 = ${texTuple(rel.line.v)}`} />
            <ResultRow label="Reta interseção" tex={o3(lineTex(rel.line))} />
            <ResultRow label="Ângulo" tex={texDeg(rel.angle)} />
          </Results>
        );
      } else if (rel.kind === "paralelos") {
        verdict = { kind: "info", text: "Os planos são paralelos e distintos (normais paralelas)." };
        const F = footOnPlane([0, 0, 0], p1);
        const G = footOnPlane(F, p2);
        scene = <Seg3D a={F as V3} b={G as V3} color="obj3" width={3} />;
        calc = (
          <Results>
            <ResultRow label="Distância" tex={`d(\\pi_1, \\pi_2) \\approx ${texDec(rel.distance)}`} />
          </Results>
        );
      } else {
        verdict = { kind: "info", text: "Os planos são coincidentes: as equações são múltiplas uma da outra." };
      }
    } else if (sc === "ptp") {
      const F = footOnPlane(P, p1);
      const dist = distPointPlane(P, p1);
      verdict = dist < 1e-9 ? { kind: "ok", text: "O ponto pertence ao plano." } : null;
      scene = (
        <>
          <Seg3D a={P} b={F as V3} color="obj3" width={3} />
          <Point3D at={F as V3} color="obj3" size={0.07} label="F" />
        </>
      );
      calc = (
        <>
          <LiveEquation general={`d(P, \\pi) = \\dfrac{|ax_0 + by_0 + cz_0 - d|}{\\sqrt{a^2 + b^2 + c^2}}`} current={`d = \\dfrac{|${tex(dot(p1.n, P) - p1.d)}|}{${texRootApprox(dot(p1.n, p1.n))}} \\approx ${texDec(dist)}`} />
          <Results>
            <ResultRow label="Pé da perpendicular" tex={o3(`F = ${texTuple(F)}`)} />
          </Results>
        </>
      );
    } else {
      const F = footOnLine(P, r);
      const AP = sub(P, r.p);
      const c = cross(AP, r.v);
      const dist = distPointLine3(P, r);
      verdict = dist < 1e-9 ? { kind: "ok", text: "O ponto pertence à reta." } : null;
      scene = (
        <>
          <Seg3D a={P} b={F as V3} color="obj3" width={3} />
          <Point3D at={F as V3} color="obj3" size={0.07} label="F" />
        </>
      );
      calc = (
        <>
          <LiveEquation general={`d(P, r) = \\dfrac{\\lVert \\overrightarrow{AP}\\times\\vec u\\rVert}{\\lVert\\vec u\\rVert}`} current={`d = \\dfrac{${texRootApprox(dot(c, c))}}{${texRootApprox(dot(r.v, r.v))}} \\approx ${texDec(dist)}`} />
          <Results>
            <ResultRow label="AP × u" tex={texTuple(c)} />
            <ResultRow label="Pé da perpendicular" tex={o3(`F = ${texTuple(F)}`)} />
          </Results>
        </>
      );
    }
  }

  const graph = (
    <Scene3D R={4} label="Posições relativas entre retas, planos e pontos">
      {usesP1 && !isZeroVec(p1.n) && <PlaneMesh plane={p1} color="obj4" opacity={0.28} />}
      {usesP2 && !isZeroVec(p2.n) && <PlaneMesh plane={p2} color="obj6" opacity={0.28} />}
      {usesR && !isZeroVec(r.v) && (
        <>
          <Line3D line={r} color="obj1" width={3} />
          <Point3D at={r.p as V3} color="obj1" size={0.06} label="A" />
        </>
      )}
      {usesS && !isZeroVec(l2.v) && (
        <>
          <Line3D line={l2} color="obj2" width={3} />
          <Point3D at={l2.p as V3} color="obj2" size={0.06} label="B" />
        </>
      )}
      {usesPt && <Point3D at={P} color="obj5" label="P" />}
      {scene}
    </Scene3D>
  );

  const presets: Record<Sc, { label: string; apply: () => void }[]> = {
    rr: [
      { label: "Reversas", apply: () => set({ rA: [0, 0, 1], rv: [1, 0, 0], sA: [0, 0, -1], sv: [0, 1, 0] }) },
      { label: "Concorrentes", apply: () => set({ rA: [-2, -1, 0], rv: [2, 1, 1], sA: [2, -2, 0], sv: [-1, 2, 1] }) },
      { label: "Paralelas", apply: () => set({ rA: [0, -1, 0], rv: [1, 1, 1], sA: [0, 1, 0], sv: [2, 2, 2] }) },
      { label: "Coincidentes", apply: () => set({ rA: [0, 0, 0], rv: [1, 1, 0], sA: [1, 1, 0], sv: [-2, -2, 0] }) },
    ],
    rp: [
      { label: "Secante", apply: () => set({ rA: [1, 1, 3], rv: [1, 0, -2], n1: [0, 0, 1], d1: 0 }) },
      { label: "Perpendicular", apply: () => set({ rA: [1, -1, 3], rv: [1, 1, 2], n1: [1, 1, 2], d1: 1 }) },
      { label: "Paralela", apply: () => set({ rA: [0, 0, 2], rv: [1, 1, 0], n1: [0, 0, 1], d1: 0 }) },
      { label: "Contida", apply: () => set({ rA: [0, 0, 1], rv: [1, -1, 0], n1: [0, 0, 1], d1: 1 }) },
    ],
    pp: [
      { label: "Secantes", apply: () => set({ n1: [0, 0, 1], d1: 1, n2: [1, 1, 0], d2: 1 }) },
      { label: "Perpendiculares", apply: () => set({ n1: [1, 0, 0], d1: 0, n2: [0, 1, 0], d2: 0 }) },
      { label: "Paralelos", apply: () => set({ n1: [1, 1, 1], d1: -2, n2: [2, 2, 2], d2: 4 }) },
      { label: "Coincidentes", apply: () => set({ n1: [1, 2, -1], d1: 2, n2: [-2, -4, 2], d2: -4 }) },
    ],
    ptp: [
      { label: "Ponto acima", apply: () => set({ P: [2, 2, 2], n1: [1, 2, 2], d1: 0 }) },
      { label: "Ponto no plano", apply: () => set({ P: [2, 0, -1], n1: [1, 2, 2], d1: 0 }) },
    ],
    ptr: [
      { label: "Ponto fora", apply: () => set({ P: [2, 2, 2], rA: [0, 0, 0], rv: [1, 0, 0] }) },
      { label: "Ponto na reta", apply: () => set({ P: [2, 1, 1], rA: [0, 0, 0], rv: [2, 1, 1] }) },
    ],
  };

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Duas retas no espaço podem ser <strong>concorrentes</strong>, <strong>paralelas</strong>, <strong>coincidentes</strong> ou{" "}
            <strong>reversas</strong>. As reversas só existem em 3D: não se cortam e não têm a mesma direção. O teste é o produto misto [AB, u, v]: se for
            zero, as retas estão num mesmo plano; se não, são reversas e a distância entre elas é o volume do paralelepípedo dividido pela área da base.
          </p>
          <p>
            Uma reta e um plano: se n · u ≠ 0 a reta fura o plano; se n · u = 0 ela é paralela ou está contida nele. Dois planos se cortam numa reta cuja
            direção é n₁ × n₂, a menos que as normais sejam paralelas.
          </p>
          <p>As distâncias são sempre medidas pelo segmento mais curto, que é perpendicular aos objetos (destacado em verde no gráfico).</p>
        </>
      }
    >
      <div className="presets" role="group" aria-label="Cenário">
        {SCEN.map((o) => (
          <button key={o.value} type="button" className="btn small" aria-pressed={sc === o.value} onClick={() => set({ sc: o.value })}>
            {o.label}
          </button>
        ))}
      </div>
      <Block title="Objetos">
        <Results>
          {usesR && <ResultRow label={<span className="obj1">Reta r</span>} tex={o1(lineTex(r))} />}
          {usesS && <ResultRow label={<span className="obj2">Reta s</span>} tex={o2(lineTex(l2))} />}
          {usesP1 && <ResultRow label={<span className="obj4">Plano π₁</span>} tex={planeTex(p1)} />}
          {usesP2 && <ResultRow label={<span className="obj6">Plano π₂</span>} tex={planeTex(p2)} />}
          {usesPt && <ResultRow label={<span className="obj5">Ponto P</span>} tex={o5(texTuple(P))} />}
        </Results>
      </Block>
      {bad && <Note kind="bad">Um vetor diretor ou normal é nulo; ajuste os valores.</Note>}
      {verdict && <Note kind={verdict.kind === "info" ? "info" : verdict.kind}>{verdict.text}</Note>}
      {calc && <Block title="Cálculo">{calc}</Block>}
      <Block title="Controles">
        <div className="controls">
          {usesR && (
            <>
              <VecInput label={o1("A")} value={s.rA as number[]} onChange={(x) => set({ rA: x })} />
              <VecInput label={o1("\\vec u")} value={s.rv as number[]} onChange={(x) => set({ rv: x })} />
            </>
          )}
          {usesS && (
            <>
              <VecInput label={o2("B")} value={s.sA as number[]} onChange={(x) => set({ sA: x })} />
              <VecInput label={o2("\\vec v")} value={s.sv as number[]} onChange={(x) => set({ sv: x })} />
            </>
          )}
          {usesP1 && (
            <>
              <VecInput label="\vec n_1" value={s.n1 as number[]} onChange={(x) => set({ n1: x })} />
              <Slider tex="d_1" value={s.d1} onChange={(x) => set({ d1: x })} min={-8} max={8} />
            </>
          )}
          {usesP2 && (
            <>
              <VecInput label="\vec n_2" value={s.n2 as number[]} onChange={(x) => set({ n2: x })} />
              <Slider tex="d_2" value={s.d2} onChange={(x) => set({ d2: x })} min={-8} max={8} />
            </>
          )}
          {usesPt && <VecInput label={o5("P")} value={P} onChange={(x) => set({ P: x })} />}
        </div>
      </Block>
      <Presets items={presets[sc]} />
    </ModuleLayout>
  );
}
