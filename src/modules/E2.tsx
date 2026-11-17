import { useEffect, useMemo, useState } from "react";
import { texMatrix } from "../math/format";
import { SYS_NAMES, solveSystem } from "../math/linsys";
import { eliminationSteps } from "../math/rref";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, MatrixInput, Note, Presets, Segmented } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { SystemGraph, solutionTex, systemTex } from "./sharedSys";

const DEF2 = [[2, 1, 5], [4, -1, 1]];
const DEF3 = [[1, 2, 1, 8], [2, 1, -1, 1], [3, -1, 2, 7]];

export default function E2() {
  const [s, set, reset] = useUrlState({ dim: "3", m2: DEF2, m3: DEF3, mode: "gauss" }, { dim: ["2", "3"], mode: ["gauss", "jordan"] });
  const is3 = s.dim === "3";
  const aug = (is3 ? s.m3 : s.m2) as number[][];
  const n = is3 ? 3 : 2;
  const mode = s.mode as "gauss" | "jordan";
  const key = `${s.dim}|${mode}|${aug.map((r) => r.join(",")).join(";")}`;
  const steps = useMemo(() => eliminationSteps(aug, mode, n), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const sol = useMemo(() => solveSystem(aug), [key]); // eslint-disable-line react-hooks/exhaustive-deps
  const [i, setI] = useState(0);
  useEffect(() => setI(0), [key]);
  const cur = steps[Math.min(i, steps.length - 1)];
  const last = i >= steps.length - 1;
  const setAug = (m: number[][]) => set(is3 ? { m3: m } : { m2: m });
  const mtx = (M: number[][], rows: number[] = []) =>
    texMatrix(M, { bar: n, maxDen: 100, digits: 3, cellClass: (r) => (rows.includes(r) ? "obj5" : null) });

  return (
    <ModuleLayout
      graph={<SystemGraph aug={cur.matrix} sol={sol} label="Sistema na etapa atual do escalonamento" />}
      onReset={() => {
        reset();
        setI(0);
      }}
      snapToggle={false}
      explain={
        <>
          <p>
            O <strong>escalonamento</strong> (eliminação de Gauss) transforma o sistema em outro mais simples usando três <strong>operações elementares</strong>{" "}
            nas linhas: trocar duas linhas, multiplicar uma linha por um número não nulo e somar a uma linha um múltiplo de outra.
          </p>
          <p>
            Nenhuma dessas operações muda o conjunto solução. No gráfico isso fica visível: as retas ou planos giram e mudam a cada passo, mas o ponto (ou a
            reta) de solução não sai do lugar.
          </p>
          <p>
            Na forma escalonada (Gauss) resolve-se de baixo para cima, por substituição. Continuando até zerar também acima dos pivôs e deixá-los iguais a 1
            (Gauss–Jordan), a solução aparece direto na última coluna.
          </p>
        </>
      }
    >
      <div className="row">
        <Segmented
          label="Tamanho"
          value={s.dim as "2" | "3"}
          onChange={(d) => set({ dim: d })}
          options={[
            { value: "2", label: "2 × 2" },
            { value: "3", label: "3 × 3" },
          ]}
        />
        <Segmented
          label="Método"
          value={mode}
          onChange={(m) => set({ mode: m })}
          options={[
            { value: "gauss", label: "Gauss" },
            { value: "jordan", label: "Gauss–Jordan" },
          ]}
        />
      </div>
      <Block title={`Passo ${i} de ${steps.length - 1}`}>
        <LiveEquation label={i === 0 ? "Matriz inicial" : "Operação"} general={i === 0 ? undefined : cur.tex} current={mtx(cur.matrix, cur.rows)} />
        <div className="row mt-10">
          <button type="button" className="btn" onClick={() => setI(0)} disabled={i === 0}>
            Início
          </button>
          <button type="button" className="btn" onClick={() => setI((k) => Math.max(0, k - 1))} disabled={i === 0}>
            ← Passo anterior
          </button>
          <button type="button" className="btn primary" onClick={() => setI((k) => Math.min(steps.length - 1, k + 1))} disabled={last}>
            Próximo passo →
          </button>
        </div>
      </Block>
      <Block title="Sistema equivalente">
        <LiveEquation current={systemTex(cur.matrix, { maxDen: 100 })} />
      </Block>
      {last && (
        <Note kind={sol.type === "SPD" ? "ok" : sol.type === "SPI" ? "info" : "bad"}>
          <strong>{SYS_NAMES[sol.type]}.</strong>{" "}
          {sol.type === "SI"
            ? "Apareceu uma linha 0 = c com c ≠ 0: nenhuma escolha das incógnitas satisfaz essa equação."
            : sol.type === "SPI"
              ? `Sobraram ${sol.free.length} variável(is) livre(s), que viram parâmetros.`
              : mode === "gauss"
                ? "Resolva de baixo para cima (substituição regressiva)."
                : "A solução está na última coluna."}{" "}
          <Tex>{`\\htmlClass{obj3}{${solutionTex(sol)}}`}</Tex>
        </Note>
      )}
      <Block title="Todas as operações">
        <ol className="steps">
          {steps.map((st, k) => (
            <li key={k} className={`clickable${k > i ? " dim" : ""}`} onClick={() => setI(k)}>
              <div className="step-n">
                {k}. <Tex>{st.tex}</Tex>
              </div>
              <Tex>{mtx(st.matrix, st.rows)}</Tex>
            </li>
          ))}
        </ol>
      </Block>
      <Block title="Matriz aumentada [A | b]">
        <MatrixInput value={aug} onChange={setAug} bar={n} colClass={(j) => (j === n ? "objm" : undefined)} />
      </Block>
      <Presets
        items={
          is3
            ? [
                { label: "Solução única", apply: () => set({ m3: DEF3 }) },
                { label: "Precisa trocar linhas", apply: () => set({ m3: [[0, 2, 1, 5], [1, 1, 1, 6], [2, 1, 3, 14]] }) },
                { label: "Infinitas soluções", apply: () => set({ m3: [[1, 1, 1, 3], [1, -1, 0, 0], [2, 0, 1, 3]] }) },
                { label: "Sem solução", apply: () => set({ m3: [[1, 1, 1, 1], [1, -1, 1, 2], [2, 0, 2, 5]] }) },
              ]
            : [
                { label: "Solução única", apply: () => set({ m2: DEF2 }) },
                { label: "Sem solução", apply: () => set({ m2: [[1, 2, 3], [2, 4, 1]] }) },
                { label: "Infinitas soluções", apply: () => set({ m2: [[1, -1, 1], [3, -3, 3]] }) },
              ]
        }
      />
    </ModuleLayout>
  );
}
