import { useEffect, useState } from "react";
import { o1, o2, o5, tex, texRootApprox, texTuple } from "../math/format";
import { gramSchmidt } from "../math/orthogonal";
import { dot, norm, type Vec } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow, DraggablePoint, Plane2D, RightAngle, type P2 } from "../viz2d";
import { Arrow3D, Scene3D, type V3 } from "../viz3d";

interface ArrowSpec {
  from?: number[];
  to: number[];
  color: string;
  label?: string;
  dashed?: boolean;
  weight?: number;
  opacity?: number;
}

const VCOL = ["obj1", "obj2", "obj5"];
const WCOL = "obj3";
const vName = (i: number) => `\\vec v_${i + 1}`;
const wName = (i: number) => `\\vec w_${i + 1}`;
const cls = (c: string, t: string) => `\\htmlClass{${c}}{${t}}`;

export default function H4() {
  const [s, set, reset] = useUrlState({ dim: "2", a1: [3, 1], a2: [2, 2.5], b1: [2, 0, 1], b2: [1, 2, 0], b3: [1, 1, 2] });
  const is3 = s.dim === "3";
  const vs: Vec[] = is3 ? [s.b1, s.b2, s.b3] : [s.a1, s.a2];
  const k = vs.length;
  const gs = gramSchmidt(vs);
  const [stage, setStage] = useState(k + 1);
  useEffect(() => setStage((st) => Math.min(st, k + 1)), [k]);
  const lastStage = k + 1;
  const normalized = stage === lastStage;

  // w's já calculados até o estágio atual (estágio i = processando v_i, 1-based)
  const ws = gs.steps.map((st) => st.w);
  const arrows: ArrowSpec[] = [];
  if (stage === 0) {
    vs.forEach((v, i) => arrows.push({ to: v, color: VCOL[i], label: `v${"₁₂₃"[i]}` }));
  } else if (!normalized) {
    const cur = stage - 1;
    // vetores originais ainda não processados, em tom suave
    vs.forEach((v, i) => {
      if (i >= cur) arrows.push({ to: v, color: VCOL[i], label: i === cur ? `v${"₁₂₃"[i]}` : undefined, opacity: i === cur ? 1 : 0.35, weight: i === cur ? 3 : 2 });
    });
    for (let j = 0; j < cur; j++) arrows.push({ to: ws[j], color: WCOL, label: `w${"₁₂₃"[j]}`, weight: 4 });
    const st = gs.steps[cur];
    let acc = st.v.map(() => 0);
    st.projections.forEach((p) => {
      const next = acc.map((x, i) => x + p[i]);
      arrows.push({ from: acc, to: next, color: "obj4", dashed: true, weight: 2.5 });
      acc = next;
    });
    if (cur > 0) arrows.push({ from: acc, to: st.v, color: WCOL, dashed: true, weight: 2.5 });
    arrows.push({ to: st.w, color: WCOL, label: `w${"₁₂₃"[cur]}`, weight: 4 });
  } else {
    gs.orthonormal.forEach((q, i) => arrows.push({ to: q, color: WCOL, label: `q${"₁₂₃"[i]}`, weight: 4 }));
    ws.forEach((w) => arrows.push({ to: w, color: WCOL, opacity: 0.3, weight: 2 }));
  }

  const graph = is3 ? (
    <Scene3D R={3} label="Processo de Gram–Schmidt no espaço">
      {arrows.map((a, i) => (
        <Arrow3D key={i} from={a.from as V3 | undefined} to={a.to as V3} color={a.color} label={a.label} dashed={a.dashed} width={a.weight ?? 3} opacity={a.opacity ?? 1} />
      ))}
    </Scene3D>
  ) : (
    <Plane2D x={[-2, 5]} y={[-2, 4]} label="Processo de Gram–Schmidt no plano">
      {stage >= 2 && !gs.steps[1].dependent && <RightAngle at={[0, 0]} u={(normalized ? gs.orthonormal[0] : ws[0]) as P2} v={(normalized ? gs.orthonormal[1] : ws[1]) as P2} s={0.3} />}
      {arrows.map((a, i) => (
        <Arrow key={i} tail={a.from as P2 | undefined} tip={a.to as P2} color={`var(--${a.color})`} label={a.label} dashed={a.dashed} weight={a.weight ?? 3} opacity={a.opacity ?? 1} />
      ))}
      <DraggablePoint point={s.a1 as P2} onMove={(p) => set({ a1: p })} color="var(--obj1)" />
      <DraggablePoint point={s.a2 as P2} onMove={(p) => set({ a2: p })} color="var(--obj2)" />
    </Plane2D>
  );

  // texto do passo atual
  let stepTex = "";
  if (stage === 0) stepTex = `\\text{Vetores de entrada: } ${vs.map((v, i) => cls(VCOL[i], `${vName(i)} = ${texTuple(v)}`)).join(",\\ ")}`;
  else if (!normalized) {
    const cur = stage - 1;
    const st = gs.steps[cur];
    if (cur === 0) stepTex = `${cls(WCOL, wName(0))} = ${cls(VCOL[0], vName(0))} = ${cls(WCOL, texTuple(st.w))}`;
    else {
      const projs = st.projections.map((_p, j) => `\\dfrac{${tex(dot(st.v, ws[j]))}}{${tex(dot(ws[j], ws[j]))}}${texTuple(ws[j])}`);
      stepTex = `${cls(WCOL, wName(cur))} = ${cls(VCOL[cur], vName(cur))} ${st.projections.map((_p, j) => `- \\operatorname{proj}_{${wName(j)}}${vName(cur)}`).join(" ")} = ${texTuple(st.v)} ${projs.map((p) => `- ${p}`).join(" ")} = ${cls(WCOL, texTuple(st.w))}`;
    }
  } else {
    stepTex = gs.orthonormal
      .map((_q, i) => `\\vec q_${i + 1} = \\dfrac{${wName(i)}}{\\lVert ${wName(i)}\\rVert} = \\dfrac{${texTuple(ws[i])}}{${texRootApprox(dot(ws[i], ws[i]))}}`)
      .join(" \\\\ ");
    stepTex = `\\begin{gathered} ${stepTex} \\end{gathered}`;
  }

  const stageName = stage === 0 ? "Vetores originais" : normalized ? "Normalização" : `Calcular w${"₁₂₃"[stage - 1]}`;
  const anyDependent = gs.steps.some((st) => st.dependent);

  return (
    <ModuleLayout
      graph={graph}
      onReset={() => {
        reset();
        setStage(k + 1);
      }}
      snapToggle={!is3}
      explain={
        <>
          <p>
            O processo de <strong>Gram–Schmidt</strong> transforma uma base qualquer numa base <strong>ortogonal</strong> (vetores perpendiculares dois a
            dois) que gera o mesmo espaço. A ideia é tirar de cada vetor a parte que “aponta” na direção dos anteriores.
          </p>
          <p>
            A <strong>projeção ortogonal</strong> de v sobre w é proj<sub>w</sub> v = (v·w / w·w) w, a sombra de v na reta de w. O que sobra, v − proj
            <sub>w</sub> v, é perpendicular a w. No gráfico, as projeções aparecem tracejadas em roxo e a sobra em verde.
          </p>
          <p>
            Por fim, dividindo cada wᵢ pelo seu comprimento obtém-se uma base <strong>ortonormal</strong> (vetores unitários e perpendiculares). Se algum wᵢ
            der zero, o vetor vᵢ era combinação dos anteriores.
          </p>
        </>
      }
    >
      <Segmented
        label="Dimensão"
        value={s.dim as "2" | "3"}
        onChange={(d) => {
          set({ dim: d });
          setStage(d === "3" ? 4 : 3);
        }}
        options={[
          { value: "2", label: "No plano" },
          { value: "3", label: "No espaço" },
        ]}
      />
      <Block title="Fórmula">
        <LiveEquation general={`${cls(WCOL, "\\vec w_k")} = \\vec v_k - \\sum_{j<k} \\frac{\\vec v_k\\cdot\\vec w_j}{\\vec w_j\\cdot\\vec w_j}\\,\\vec w_j`} current={stepTex} label={`Etapa ${stage} de ${lastStage}: ${stageName}`} />
        <div className="row mt-10">
          <button type="button" className="btn" onClick={() => setStage(0)} disabled={stage === 0}>
            Início
          </button>
          <button type="button" className="btn" onClick={() => setStage((x) => Math.max(0, x - 1))} disabled={stage === 0}>
            ← Anterior
          </button>
          <button type="button" className="btn primary" onClick={() => setStage((x) => Math.min(lastStage, x + 1))} disabled={stage === lastStage}>
            Próxima →
          </button>
        </div>
      </Block>
      {anyDependent && <Note kind="warn">Um dos vetores é combinação dos anteriores: o wᵢ correspondente é nulo e é descartado.</Note>}
      <Block title="Resultados">
        <Results>
          {ws.map((w, i) => (
            <ResultRow key={i} label={<span className="obj3">w{"₁₂₃"[i]}</span>} tex={cls(WCOL, texTuple(w))} />
          ))}
          {gs.orthonormal.map((q, i) => (
            <ResultRow key={`q${i}`} label={`q${"₁₂₃"[i]}`} tex={texTuple(q, { maxDen: 0, digits: 3 })} />
          ))}
          {ws.length >= 2 && <ResultRow label="Conferência" tex={`${wName(0)}\\cdot${wName(1)} = ${tex(dot(ws[0], ws[1]))}`} />}
          {gs.orthonormal.length > 0 && <ResultRow label="‖q₁‖" tex={tex(norm(gs.orthonormal[0]), { maxDen: 0, digits: 3 })} />}
        </Results>
      </Block>
      <Block title="Controles">
        <div className="controls">
          {is3 ? (
            <>
              <VecInput label={o1("\\vec v_1")} value={s.b1} onChange={(x) => set({ b1: x })} />
              <VecInput label={o2("\\vec v_2")} value={s.b2} onChange={(x) => set({ b2: x })} />
              <VecInput label={o5("\\vec v_3")} value={s.b3} onChange={(x) => set({ b3: x })} />
            </>
          ) : (
            <>
              <VecInput label={o1("\\vec v_1")} value={s.a1} onChange={(x) => set({ a1: x })} />
              <VecInput label={o2("\\vec v_2")} value={s.a2} onChange={(x) => set({ a2: x })} />
            </>
          )}
        </div>
      </Block>
      <Presets
        items={
          is3
            ? [
                { label: "Base inclinada", apply: () => set({ b1: [2, 0, 1], b2: [1, 2, 0], b3: [1, 1, 2] }) },
                { label: "Livro: (1;1;0), (1;0;1), (0;1;1)", apply: () => set({ b1: [1, 1, 0], b2: [1, 0, 1], b3: [0, 1, 1] }) },
                { label: "v₃ dependente", apply: () => set({ b1: [1, 0, 0], b2: [0, 1, 0], b3: [1, 1, 0] }) },
              ]
            : [
                { label: "Base inclinada", apply: () => set({ a1: [3, 1], a2: [2, 2.5] }) },
                { label: "Já ortogonais", apply: () => set({ a1: [2, 1], a2: [-1, 2] }) },
                { label: "Quase paralelos", apply: () => set({ a1: [3, 1], a2: [3, 1.5] }) },
              ]
        }
      />
    </ModuleLayout>
  );
}
