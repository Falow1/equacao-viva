import { tex, texMatrix } from "../math/format";
import { SYS_NAMES, cramer, solveSystem } from "../math/linsys";
import { det } from "../math/mat";
import { THREE_PLANES_TEXT, classifyThreePlanes, type Plane } from "../math/space";
import type { Vec3 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, ResultRow, Results, Segmented } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { SystemGraph, VARS2, VARS3, solutionTex, systemTex } from "./sharedSys";

const DEF2 = [[1, 1, 3], [1, -1, 1]];
const DEF3 = [[1, 1, 1, 6], [1, -1, 2, 5], [2, 1, -1, 1]];

export default function E1() {
  const [s, set, reset] = useUrlState({ dim: "2", m2: DEF2, m3: DEF3 });
  const is3 = s.dim === "3";
  const aug = (is3 ? s.m3 : s.m2) as number[][];
  const n = is3 ? 3 : 2;
  const vars = is3 ? VARS3 : VARS2;
  const sol = solveSystem(aug);
  const A = aug.map((r) => r.slice(0, n));
  const b = aug.map((r) => r[n]);
  const cr = cramer(A, b, det);
  const planesOk = is3 && aug.every((r) => r.slice(0, 3).some((x) => Math.abs(x) > 1e-12));
  const arrangement = planesOk ? classifyThreePlanes(aug.map((r) => ({ n: r.slice(0, 3) as Vec3, d: r[3] })) as [Plane, Plane, Plane]) : null;
  const setAug = (m: number[][]) => set(is3 ? { m3: m } : { m2: m });

  const kindNote = sol.type === "SPD" ? "ok" : sol.type === "SPI" ? "info" : "bad";

  return (
    <ModuleLayout
      graph={<SystemGraph aug={aug} sol={sol} label={is3 ? "Três planos do sistema 3×3" : "Duas retas do sistema 2×2"} />}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Cada equação de um sistema linear é uma reta (com duas incógnitas) ou um plano (com três). Resolver o sistema é achar os pontos que estão em{" "}
            <strong>todos</strong> eles ao mesmo tempo.
          </p>
          <p>
            Há só três possibilidades: um único ponto comum (<strong>possível e determinado</strong>), infinitos pontos, como uma reta inteira (
            <strong>possível e indeterminado</strong>), ou nenhum (<strong>impossível</strong>).
          </p>
          <p>
            O <strong>teorema de Rouché–Capelli</strong> decide sem desenhar: o sistema tem solução se e só se posto(A) = posto([A | b]). Se, além disso,
            o posto é igual ao número de incógnitas, a solução é única; senão sobram n − posto parâmetros livres.
          </p>
        </>
      }
      steps={
        <ol className="steps">
          <li>
            <div className="step-n">Regra de Cramer (sistemas quadrados)</div>
            {cr ? (
              <>
                <Tex>{`D = \\det A = ${texMatrix(A, { delim: "v" })} = ${tex(cr.D)}`}</Tex>
                {cr.Di.map((d, j) => (
                  <div key={j}>
                    <Tex>{`D_${vars[j]} = ${tex(d)} \\Rightarrow ${vars[j]} = \\dfrac{D_${vars[j]}}{D} = \\dfrac{${tex(d)}}{${tex(cr.D)}} = ${tex(cr.x[j])}`}</Tex>
                  </div>
                ))}
                <p className="hint">Dₓ é o determinante de A com a coluna de x trocada pela coluna b (o mesmo para as outras incógnitas).</p>
              </>
            ) : (
              <p>det A = 0: a regra de Cramer não se aplica. O sistema é SPI ou SI; use o escalonamento (módulo E2).</p>
            )}
          </li>
          <li>
            <div className="step-n">Rouché–Capelli</div>
            <Tex>{`\\operatorname{posto}(A) = ${sol.rankA},\\quad \\operatorname{posto}([A\\,|\\,b]) = ${sol.rankAug},\\quad n = ${n}`}</Tex>
          </li>
        </ol>
      }
    >
      <Segmented
        label="Tamanho do sistema"
        value={s.dim as "2" | "3"}
        onChange={(d) => set({ dim: d })}
        options={[
          { value: "2", label: "2 × 2 (retas)" },
          { value: "3", label: "3 × 3 (planos)" },
        ]}
      />
      <Block title="Sistema">
        <LiveEquation current={systemTex(aug)} />
      </Block>
      <Block title="Matriz aumentada [A | b]">
        <MatrixInput value={aug} onChange={setAug} bar={n} colClass={(j) => (j === n ? "objm" : undefined)} />
      </Block>
      <Note kind={kindNote}>
        <strong>{SYS_NAMES[sol.type]}.</strong>{" "}
        {arrangement ? THREE_PLANES_TEXT[arrangement] : sol.type === "SPD" ? "As retas se cortam num único ponto." : sol.type === "SPI" ? "As equações descrevem a mesma reta." : "As retas são paralelas e distintas."}
      </Note>
      <Block title="Resultados">
        <Results>
          <ResultRow label="posto(A)" tex={String(sol.rankA)} />
          <ResultRow label="posto([A | b])" tex={String(sol.rankAug)} />
          <ResultRow label="Incógnitas" tex={String(n)} />
          {sol.type === "SPI" && <ResultRow label="Variáveis livres" tex={String(sol.free.length)} />}
          <ResultRow label="Solução" tex={`\\htmlClass{obj3}{${solutionTex(sol)}}`} />
          {cr && <ResultRow label="det A" tex={tex(cr.D)} />}
        </Results>
      </Block>
      <Presets
        items={
          is3
            ? [
                { label: "Ponto único", apply: () => set({ m3: DEF3 }) },
                { label: "Reta comum", apply: () => set({ m3: [[1, 1, 1, 3], [1, -1, 0, 0], [2, 0, 1, 3]] }) },
                { label: "Dois coincidentes", apply: () => set({ m3: [[1, 1, 1, 2], [2, 2, 2, 4], [1, 0, -1, 0]] }) },
                { label: "Prisma (sem solução)", apply: () => set({ m3: [[1, 1, 1, 1], [1, -1, 1, 2], [2, 0, 2, 5]] }) },
                { label: "Dois paralelos", apply: () => set({ m3: [[1, 1, 1, 1], [1, 1, 1, 3], [1, -1, 0, 0]] }) },
                { label: "Três paralelos", apply: () => set({ m3: [[1, 1, 1, 1], [2, 2, 2, 6], [1, 1, 1, -1]] }) },
              ]
            : [
                { label: "Uma solução", apply: () => set({ m2: DEF2 }) },
                { label: "Retas paralelas", apply: () => set({ m2: [[1, 1, 2], [2, 2, 6]] }) },
                { label: "Mesma reta", apply: () => set({ m2: [[1, -2, 1], [-2, 4, -2]] }) },
                { label: "Perpendiculares", apply: () => set({ m2: [[2, 1, 4], [-1, 2, 3]] }) },
              ]
        }
      />
    </ModuleLayout>
  );
}
