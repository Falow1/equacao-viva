import { fmtDeg, o1, o2, o3, o4, tex, texDec, texPar, texRootApprox, texTuple } from "../math/format";
import { angle, dot, norm, proj, sub } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex as MathLineTex } from "../ui/Tex";
import { AngleArc, Arrow, DraggablePoint, InfLine, Label, Plane2D, RightAngle, Segment, bisector, type P2 } from "../viz2d";

const MathLine = ({ t }: { t: string }) => <MathLineTex>{t}</MathLineTex>;

export default function A2() {
  const [s, set, reset] = useUrlState({ u: [3, 2], v: [4, 0.5] });
  const u = s.u as P2, v = s.v as P2;
  const uv = dot(u, v);
  const nu = norm(u), nv = norm(v);
  const th = angle(u, v);
  const p = proj(u, v) as P2 | null;
  const perp = p ? (sub(u, p) as P2) : null;
  const vZero = nv < 1e-12, uZero = nu < 1e-12;
  const orth = !vZero && !uZero && Math.abs(uv) < 1e-9;

  const general = `${o1("\\vec u")}\\cdot${o2("\\vec v")} = u_1v_1 + u_2v_2 = \\|${o1("\\vec u")}\\|\\,\\|${o2("\\vec v")}\\|\\cos\\theta`;
  const current = `${o1(texTuple(u))}\\cdot${o2(texTuple(v))} = ${texPar(u[0])}\\cdot${texPar(v[0])} + ${texPar(u[1])}\\cdot${texPar(v[1])} = ${tex(uv)}`;
  const k = vZero ? 0 : uv / (nv * nv);

  const graph = (
    <Plane2D x={[-4, 6]} y={[-3, 5]} label="Vetores u e v, ângulo e projeção">
      {!vZero && <InfLine p={[0, 0]} v={v} color="var(--obj-muted)" dashed weight={1} opacity={0.6} />}
      {p && !uZero && (
        <>
          <Segment a={u} b={p} color="var(--obj4)" dashed weight={2} />
          {perp && norm(perp) > 1e-9 && <RightAngle at={p} u={perp} v={k > 0 ? [-v[0], -v[1]] : v} />}
          <Arrow tip={p} color="var(--obj3)" weight={5} label="proj" dir="s" />
        </>
      )}
      {th !== null && <AngleArc from={u} to={v} r={0.8} />}
      {th !== null && <Label at={bisector(u, v, 1.15)} text="θ" color="var(--obj5)" dir="e" dist={0} />}
      <Arrow tip={u} color="var(--obj1)" label="u" />
      <Arrow tip={v} color="var(--obj2)" label="v" />
      <DraggablePoint point={u} onMove={(x) => set({ u: x })} color="var(--obj1)" />
      <DraggablePoint point={v} onMove={(x) => set({ v: x })} color="var(--obj2)" />
    </Plane2D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            O produto escalar <strong>u · v</strong> é um número. Pela fórmula algébrica, multiplicam-se as coordenadas correspondentes e somam-se os
            resultados. Pela geométrica, ele vale ‖u‖‖v‖cos θ, então o sinal diz se o ângulo é agudo (positivo), reto (zero) ou obtuso (negativo).
          </p>
          <p>
            A projeção de u sobre v é a “sombra” de u na direção de v: proj<sub>v</sub>u = (u·v / v·v) v. O que sobra, u − proj, é perpendicular a v.
          </p>
        </>
      }
      steps={
        !vZero && !uZero ? (
          <ol className="steps">
            <li>Produto escalar: <MathLine t={`${o1("\\vec u")}\\cdot${o2("\\vec v")} = ${tex(uv)}`} /></li>
            <li>Normas: <MathLine t={`\\|${o1("\\vec u")}\\| = ${texRootApprox(nu * nu)},\\quad \\|${o2("\\vec v")}\\| = ${texRootApprox(nv * nv)}`} /></li>
            <li>Cosseno: <MathLine t={`\\cos\\theta = \\dfrac{${tex(uv)}}{${texDec(nu)}\\cdot ${texDec(nv)}} \\approx ${texDec(uv / (nu * nv), 3)}`} /></li>
            <li>Ângulo: θ ≈ {fmtDeg(th ?? 0)}</li>
            <li>Projeção: <MathLine t={`\\operatorname{proj}_{${o2("\\vec v")}}${o1("\\vec u")} = \\dfrac{${tex(uv)}}{${tex(nv * nv)}}${o2(texTuple(v))} = ${o3(texTuple(p ?? [0, 0]))}`} /></li>
          </ol>
        ) : undefined
      }
    >
      <Block title="Equação">
        <LiveEquation general={general} current={current} />
      </Block>
      <Block title="Controles">
        <div className="controls">
          <VecInput label={o1("\\vec u")} value={u} onChange={(x) => set({ u: x })} />
          <VecInput label={o2("\\vec v")} value={v} onChange={(x) => set({ v: x })} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Ângulo agudo", apply: () => set({ u: [3, 2], v: [4, 0.5] }) },
          { label: "Ortogonais", apply: () => set({ u: [2, 1], v: [-1, 2] }) },
          { label: "Ângulo obtuso", apply: () => set({ u: [-2, 2], v: [3, 1] }) },
          { label: "Mesma direção", apply: () => set({ u: [1, 1], v: [3, 3] }) },
          { label: "v nulo", apply: () => set({ u: [2, 1], v: [0, 0] }) },
        ]}
      />
      <Block title="Resultados">
        {vZero || uZero ? (
          <Note kind="warn">
            {vZero ? "v é o vetor nulo" : "u é o vetor nulo"}: o produto escalar vale 0, mas o ângulo não está definido
            {vZero ? " e não existe projeção sobre v." : "."}
          </Note>
        ) : (
          <>
            <Results>
              <ResultRow label="u · v" tex={tex(uv)} />
              <ResultRow label="cos θ" tex={`\\dfrac{${tex(uv)}}{${texRootApprox(nu * nu).split("\\approx")[0]}\\cdot ${texRootApprox(nv * nv).split("\\approx")[0]}} \\approx ${texDec(uv / (nu * nv), 3)}`} />
              <ResultRow label="θ">{fmtDeg(th ?? 0)}</ResultRow>
              <ResultRow label={<>proj<sub>v</sub> u</>} tex={`${tex(k)}\\,${o2("\\vec v")} = ${o3(texTuple(p ?? [0, 0]))}`} />
              <ResultRow label="u − proj" tex={o4(texTuple(perp ?? [0, 0]))} />
            </Results>
            <div style={{ marginTop: 8 }}>
              {orth ? (
                <Note kind="ok">u · v = 0: os vetores são ortogonais (θ = 90°) e a projeção é o vetor nulo.</Note>
              ) : uv < 0 ? (
                <Note>u · v &lt; 0: o ângulo é obtuso e a projeção aponta no sentido contrário de v.</Note>
              ) : (
                <Note>u · v &gt; 0: o ângulo é agudo e a projeção tem o mesmo sentido de v.</Note>
              )}
            </div>
          </>
        )}
      </Block>
    </ModuleLayout>
  );
}
