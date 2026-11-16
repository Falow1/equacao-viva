import { fmtDeg, o1, o2, o3, tex, texDec, texLinear, texPar, texRootApprox, texTuple } from "../math/format";
import { distPointLine, lineFromPoints, relLines, type Line2 } from "../math/lines";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { AngleArc, Dot, DraggablePoint, GeneralLine, Plane2D, RightAngle, Segment, type P2 } from "../viz2d";

const eq = (l: Line2) => `${texLinear([l.a, l.b], ["x", "y"], l.c)} = 0`;

export default function B2() {
  const [s, set, reset] = useUrlState({ A1: [-4, -2], B1: [3, 2], A2: [-3, 3], B2: [3, -1.5], P: [2, 3.5], alvo: "r" });
  const r = lineFromPoints(s.A1 as P2, s.B1 as P2);
  const t = lineFromPoints(s.A2 as P2, s.B2 as P2);
  const P = s.P as P2;
  const target = s.alvo === "r" ? r : t;
  const rel = r && t ? relLines(r, t) : null;
  const dist = target ? distPointLine(P, target) : null;

  const graph = (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Duas retas e um ponto">
      {r && <GeneralLine {...r} color="var(--obj1)" />}
      {t && <GeneralLine {...t} color="var(--obj2)" dashed={rel?.kind === "coincidentes"} />}
      {rel?.kind === "concorrentes" && r && t && (
        <>
          <AngleArc at={rel.point} from={dirFor(r)} to={dirFor(t, dirFor(r))} r={0.9} />
          <Dot at={rel.point} color="var(--text)" label="I" dir="s" />
        </>
      )}
      {dist && target && (
        <>
          <Segment a={P} b={dist.foot} color="var(--obj3)" weight={3} />
          {dist.d > 1e-9 && <RightAngle at={dist.foot} u={[P[0] - dist.foot[0], P[1] - dist.foot[1]]} v={[-target.b, target.a]} />}
          <Dot at={dist.foot} color="var(--obj3)" r={4} />
        </>
      )}
      <DraggablePoint point={s.A1 as P2} onMove={(p) => set({ A1: p })} color="var(--obj1)" />
      <DraggablePoint point={s.B1 as P2} onMove={(p) => set({ B1: p })} color="var(--obj1)" label="r" />
      <DraggablePoint point={s.A2 as P2} onMove={(p) => set({ A2: p })} color="var(--obj2)" />
      <DraggablePoint point={s.B2 as P2} onMove={(p) => set({ B2: p })} color="var(--obj2)" label="s" />
      <DraggablePoint point={P} onMove={(p) => set({ P: p })} color="var(--obj3)" label="P" />
    </Plane2D>
  );

  const angleTex =
    r && t
      ? `\\cos\\theta = \\dfrac{|${texPar(r.a)}\\cdot${texPar(t.a)} + ${texPar(r.b)}\\cdot${texPar(t.b)}|}{\\sqrt{${tex(r.a ** 2 + r.b ** 2)}}\\sqrt{${tex(t.a ** 2 + t.b ** 2)}}} = ${texDec(Math.abs(r.a * t.a + r.b * t.b) / (Math.hypot(r.a, r.b) * Math.hypot(t.a, t.b)), 3)}`
      : "";

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            Duas retas no plano são <strong>concorrentes</strong> (um ponto em comum), <strong>paralelas</strong> (nenhum) ou{" "}
            <strong>coincidentes</strong> (todos). Para descobrir, resolve-se o sistema formado pelas duas equações.
          </p>
          <p>
            O ângulo entre as retas é o ângulo entre os vetores normais, usando o módulo para ficar entre 0° e 90°. A distância de P = (x₀; y₀) à reta
            ax + by + c = 0 é |ax₀ + by₀ + c| / √(a² + b²): o numerador mede o quanto P “erra” a equação e o denominador corrige a escala.
          </p>
        </>
      }
    >
      <Block title="Equações">
        <LiveEquation label="Reta r" current={r ? o1(eq(r)) : "\\text{A e B coincidem}"} />
        <LiveEquation label="Reta s" current={t ? o2(eq(t)) : "\\text{A e B coincidem}"} />
      </Block>
      {(!r || !t) && <Note kind="warn">Os dois pontos de uma reta coincidem: não há reta definida. Afaste-os.</Note>}
      {rel && r && t && (
        <Block title="Posição relativa">
          <Results>
            <ResultRow label="Classificação">
              {rel.kind === "concorrentes" ? (rel.perpendicular ? "Concorrentes e perpendiculares" : "Concorrentes") : rel.kind === "paralelas" ? "Paralelas distintas" : "Coincidentes"}
            </ResultRow>
            {rel.kind === "concorrentes" && <ResultRow label="Interseção" tex={`I = ${texTuple(rel.point)}`} />}
            {rel.kind === "concorrentes" && <ResultRow label="Ângulo" tex={`${angleTex} \\Rightarrow \\theta \\approx ${fmtDeg(rel.angle).replace("°", "^\\circ").replace(",", "{,}")}`} />}
            {rel.kind === "paralelas" && <ResultRow label="Distância entre elas" tex={texDec(rel.distance)} />}
          </Results>
          {rel.kind === "paralelas" && <div style={{ marginTop: 8 }}><Note>As retas são paralelas: o sistema formado por elas não tem solução.</Note></div>}
          {rel.kind === "coincidentes" && <div style={{ marginTop: 8 }}><Note>As equações são múltiplas uma da outra: o sistema tem infinitas soluções.</Note></div>}
        </Block>
      )}
      {dist && target && (
        <Block title="Distância de P à reta">
          <div className="row" style={{ marginBottom: 8 }}>
            <Segmented label="Reta alvo" value={s.alvo as "r" | "s"} onChange={(alvo) => set({ alvo })} options={[{ value: "r", label: "até r" }, { value: "s", label: "até s" }]} />
          </div>
          <LiveEquation
            general={`d(P, ${s.alvo}) = \\dfrac{|a x_0 + b y_0 + c|}{\\sqrt{a^2 + b^2}}`}
            current={`d = \\dfrac{|${texPar(target.a)}\\cdot${texPar(P[0])} + ${texPar(target.b)}\\cdot${texPar(P[1])} + ${texPar(target.c)}|}{\\sqrt{${tex(target.a ** 2)} + ${tex(target.b ** 2)}}} = \\dfrac{${tex(Math.abs(dist.num))}}{${texRootApprox(dist.den).split("\\approx")[0]}} ${dist.d > 0 ? `\\approx ${o3(texDec(dist.d))}` : "= 0"}`}
          />
          {dist.d < 1e-9 && <div style={{ marginTop: 8 }}><Note kind="ok">P está sobre a reta: a distância é zero.</Note></div>}
        </Block>
      )}
      <Block title="Controles">
        <div className="controls">
          <VecInput label={o3("P")} value={P} onChange={(x) => set({ P: x })} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Concorrentes", apply: () => set({ A1: [-4, -2], B1: [3, 2], A2: [-3, 3], B2: [3, -1.5] }) },
          { label: "Perpendiculares", apply: () => set({ A1: [-3, -3], B1: [3, 3], A2: [-3, 3], B2: [3, -3] }) },
          { label: "Paralelas", apply: () => set({ A1: [-4, -1], B1: [4, 1], A2: [-4, 1.5], B2: [4, 3.5] }) },
          { label: "Coincidentes", apply: () => set({ A1: [-4, -2], B1: [0, 0], A2: [2, 1], B2: [4, 2] }) },
          { label: "P sobre r", apply: () => set({ A1: [-4, -2], B1: [3, 2], P: [-0.5, 0], alvo: "r" }) },
        ]}
      />
    </ModuleLayout>
  );
}

function dirFor(l: Line2, ref?: P2): P2 {
  const d: P2 = [-l.b, l.a];
  if (ref && d[0] * ref[0] + d[1] * ref[1] < 0) return [-d[0], -d[1]];
  return d;
}
