import { o1, o2, o3, o5, tex, texTuple } from "../math/format";
import { solveSystem } from "../math/linsys";
import { rank } from "../math/mat";
import { cross, isZeroVec, type Vec3 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow, DraggablePoint, InfLine, Plane2D, type P2 } from "../viz2d";
import { Arrow3D, Line3D, PlaneMesh, Point3D, Scene3D, type V3 } from "../viz3d";

const COLORS = ["obj1", "obj2", "obj5"];
const NAMES = ["v_1", "v_2", "v_3"];

export default function F1() {
  const [s, set, reset] = useUrlState({
    dim: "2",
    v1: [2, 1], v2: [-1, 1.5], w: [1, 3],
    a1: [2, 0, 1], a2: [0, 2, 1], a3: [1, 1, 2], w3: [2, 2, 2], k: 2,
  }, { dim: ["2", "3"] });
  const is3 = s.dim === "3";
  const k = s.k === 3 ? 3 : 2; // quantos vetores no espaço (um link com outro número volta para 2)
  const vs: number[][] = is3 ? [s.a1, s.a2, s.a3].slice(0, k) : [s.v1, s.v2];
  const w = (is3 ? s.w3 : s.w) as number[];
  const dim = is3 ? 3 : 2;
  const aug = Array.from({ length: dim }, (_, i) => [...vs.map((v) => v[i]), w[i]]);
  const sol = solveSystem(aug);
  const r = rank(Array.from({ length: dim }, (_, i) => vs.map((v) => v[i])));
  const coeffs = sol.particular;
  // caminho c1·v1 → c1·v1 + c2·v2 → ...
  const path: number[][] = [Array(dim).fill(0)];
  if (coeffs) vs.forEach((v, j) => path.push(path[j].map((x, i) => x + coeffs[j] * v[i])));

  const spanName =
    r === 0 ? "só a origem" : r === 1 ? "uma reta pela origem" : r === 2 ? (is3 ? "um plano pela origem" : "o plano todo (ℝ²)") : "o espaço todo (ℝ³)";
  const firstNZ = vs.find((v) => !isZeroVec(v));
  let spanPlaneN: Vec3 | null = null;
  if (is3 && r === 2) {
    for (let i = 0; i < vs.length && !spanPlaneN; i++)
      for (let j = i + 1; j < vs.length && !spanPlaneN; j++) {
        const c = cross(vs[i] as Vec3, vs[j] as Vec3);
        if (!isZeroVec(c, 1e-9)) spanPlaneN = c;
      }
  }

  const graph = is3 ? (
    <Scene3D R={4} label="Vetores no espaço, o espaço gerado e o alvo w">
      {spanPlaneN && <PlaneMesh plane={{ n: spanPlaneN, d: 0 }} color="obj4" opacity={0.22} />}
      {r === 1 && firstNZ && <Line3D line={{ p: [0, 0, 0], v: firstNZ as Vec3 }} color="obj4" width={5} />}
      {coeffs &&
        vs.map((_v, j) => (
          <Arrow3D key={`p${j}`} from={path[j] as V3} to={path[j + 1] as V3} color={COLORS[j]} width={2} dashed opacity={0.85} />
        ))}
      {vs.map((v, j) => (
        <Arrow3D key={j} to={v as V3} color={COLORS[j]} label={["v₁", "v₂", "v₃"][j]} width={4} />
      ))}
      <Point3D at={w as V3} color="obj3" label="w" size={0.11} />
    </Scene3D>
  ) : (
    <Plane2D x={[-5, 5]} y={[-4, 5]} label="Combinação linear de v₁ e v₂">
      {r === 1 && firstNZ && <InfLine p={[0, 0]} v={firstNZ as P2} color="var(--obj4)" weight={7} opacity={0.4} />}
      {coeffs &&
        vs.map((_v, j) => <Arrow key={`p${j}`} tail={path[j] as P2} tip={path[j + 1] as P2} color={`var(--${COLORS[j]})`} weight={2} dashed opacity={0.8} />)}
      <Arrow tip={s.v1 as P2} color="var(--obj1)" label="v₁" weight={4} />
      <Arrow tip={s.v2 as P2} color="var(--obj2)" label="v₂" weight={4} />
      <Arrow tip={w as P2} color="var(--obj3)" label="w" />
      <DraggablePoint point={s.v1 as P2} onMove={(p) => set({ v1: p })} color="var(--obj1)" />
      <DraggablePoint point={s.v2 as P2} onMove={(p) => set({ v2: p })} color="var(--obj2)" />
      <DraggablePoint point={w as P2} onMove={(p) => set({ w: p })} color="var(--obj3)" />
    </Plane2D>
  );

  const generalLhs = vs.map((_, j) => `c_${j + 1}\\htmlClass{${COLORS[j]}}{\\vec ${NAMES[j]}}`).join(" + ");
  const currentLhs = coeffs
    ? vs.map((v, j) => `${tex(coeffs[j])}\\,\\htmlClass{${COLORS[j]}}{${texTuple(v)}}`).join(" + ")
    : vs.map((v, j) => `c_${j + 1}\\,\\htmlClass{${COLORS[j]}}{${texTuple(v)}}`).join(" + ");

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={!is3}
      explain={
        <>
          <p>
            Uma <strong>combinação linear</strong> de v₁, v₂, … é qualquer soma c₁v₁ + c₂v₂ + …, com números reais c₁, c₂, …. O conjunto de todas as
            combinações é o <strong>espaço gerado</strong> [v₁, v₂, …].
          </p>
          <p>
            Para saber se w pertence a esse espaço, resolve-se o sistema c₁v₁ + c₂v₂ = w; as incógnitas são os coeficientes. O caminho tracejado mostra a
            receita: ande c₁ vezes v₁ e depois c₂ vezes v₂.
          </p>
          <p>
            Se os vetores são <strong>linearmente dependentes</strong> (um é combinação dos outros), o espaço gerado encolhe: dois vetores paralelos no
            plano geram só uma reta; três vetores coplanares no espaço geram só um plano.
          </p>
        </>
      }
    >
      <Segmented
        label="Dimensão"
        value={s.dim as "2" | "3"}
        onChange={(d) => set({ dim: d })}
        options={[
          { value: "2", label: "No plano" },
          { value: "3", label: "No espaço" },
        ]}
      />
      <Block title="Equação">
        <LiveEquation general={`${generalLhs} = ${o3("\\vec w")}`} current={`${currentLhs} = ${o3(texTuple(w))}`} />
      </Block>
      {sol.type === "SI" && <Note kind="bad">w não pertence ao espaço gerado ({spanName}): nenhuma escolha de coeficientes chega até ele.</Note>}
      {sol.type === "SPD" && <Note kind="ok">w é combinação linear dos vetores, de um único jeito.</Note>}
      {sol.type === "SPI" && (
        <Note kind="warn">w pertence ao espaço gerado, mas os vetores são dependentes: há infinitas combinações possíveis. O gráfico mostra uma delas.</Note>
      )}
      <Block title="Resultados">
        <Results>
          <ResultRow label="Espaço gerado" tex={`\\text{${spanName}}`} />
          <ResultRow label="Dimensão" tex={String(r)} />
          <ResultRow label="Vetores LI?" tex={r === vs.length ? "\\text{sim}" : "\\text{não (são LD)}"} />
          {coeffs && <ResultRow label="Coeficientes" tex={coeffs.map((c, j) => `c_${j + 1} = ${tex(c)}`).join(",\\ ")} />}
        </Results>
      </Block>
      <Block title="Controles">
        <div className="controls">
          {is3 ? (
            <>
              <Segmented
                label="Quantos vetores"
                value={String(k) as "2" | "3"}
                onChange={(v) => set({ k: Number(v) })}
                options={[
                  { value: "2", label: "Dois vetores" },
                  { value: "3", label: "Três vetores" },
                ]}
              />
              <VecInput label={o1("\\vec v_1")} value={s.a1} onChange={(x) => set({ a1: x })} />
              <VecInput label={o2("\\vec v_2")} value={s.a2} onChange={(x) => set({ a2: x })} />
              {k === 3 && <VecInput label={o5("\\vec v_3")} value={s.a3} onChange={(x) => set({ a3: x })} />}
              <VecInput label={o3("\\vec w")} value={s.w3} onChange={(x) => set({ w3: x })} />
            </>
          ) : (
            <>
              <VecInput label={o1("\\vec v_1")} value={s.v1} onChange={(x) => set({ v1: x })} />
              <VecInput label={o2("\\vec v_2")} value={s.v2} onChange={(x) => set({ v2: x })} />
              <VecInput label={o3("\\vec w")} value={s.w} onChange={(x) => set({ w: x })} />
            </>
          )}
        </div>
      </Block>
      <Presets
        items={
          is3
            ? [
                { label: "w no plano gerado", apply: () => set({ k: 2, a1: [2, 0, 1], a2: [0, 2, 1], w3: [2, 2, 2] }) },
                { label: "w fora do plano", apply: () => set({ k: 2, a1: [2, 0, 1], a2: [0, 2, 1], w3: [1, 1, 3] }) },
                { label: "Três LI (geram ℝ³)", apply: () => set({ k: 3, a1: [2, 0, 0], a2: [0, 2, 0], a3: [1, 1, 2], w3: [1, 1, 3] }) },
                { label: "Três coplanares", apply: () => set({ k: 3, a1: [1, 0, 1], a2: [0, 1, 1], a3: [1, 1, 2], w3: [2, 1, 3] }) },
              ]
            : [
                { label: "Base qualquer", apply: () => set({ v1: [2, 1], v2: [-1, 1.5], w: [1, 3] }) },
                { label: "Vetores paralelos, w fora", apply: () => set({ v1: [1, 1], v2: [2, 2], w: [1, 3] }) },
                { label: "Vetores paralelos, w na reta", apply: () => set({ v1: [1, 1], v2: [2, 2], w: [3, 3] }) },
                { label: "Base canônica", apply: () => set({ v1: [1, 0], v2: [0, 1], w: [3, 2] }) },
              ]
        }
      />
    </ModuleLayout>
  );
}
