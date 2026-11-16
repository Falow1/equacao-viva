import { useMemo } from "react";
import { eig2 } from "../math/eigen";
import { o1, o4, o5, tex, texDec, texLinear, texMatrix } from "../math/format";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Slider } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow, ImplicitCurve, InfLine, Plane2D, type P2 } from "../viz2d";

export default function H2() {
  const [s, set, reset] = useUrlState({ a: 2, b: 1, c: 2 });
  const { a, b, c } = s;
  const A = [[a, b], [b, c]];
  const e = eig2(A);
  const F = useMemo(() => (x: number, y: number) => a * x * x + 2 * b * x * y + c * y * y - 1, [a, b, c]);
  const real = e.kind !== "complex";
  const l1 = real ? e.values[0] : 0, l2 = real ? e.values[1] : 0;
  let u1: P2 = [1, 0], u2: P2 = [0, 1];
  if (e.kind === "distinct") {
    const n1 = Math.hypot(...e.vectors[0]), n2 = Math.hypot(...e.vectors[1]);
    u1 = [e.vectors[0][0] / n1, e.vectors[0][1] / n1];
    u2 = [e.vectors[1][0] / n2, e.vectors[1][1] / n2];
  }
  const P = [[u1[0], u2[0]], [u1[1], u2[1]]];
  const kind =
    l1 > 1e-12 && l2 > 1e-12 ? "elipse" : l1 * l2 < -1e-12 ? "hiperbole" : Math.abs(l1) < 1e-12 && Math.abs(l2) < 1e-12 ? "nada" : Math.max(l1, l2) > 1e-12 ? "paralelas" : "vazio";
  const KIND_TEXT: Record<string, string> = {
    elipse: "λ₁ e λ₂ positivos (matriz definida positiva): a curva de nível é uma elipse.",
    hiperbole: "Autovalores de sinais opostos (matriz indefinida): a curva é uma hipérbole.",
    paralelas: "Um autovalor nulo: a curva vira um par de retas paralelas.",
    vazio: "Nenhum autovalor positivo: xᵀAx nunca chega a 1, a curva é vazia.",
    nada: "A = 0: xᵀAx = 0 para todo x.",
  };

  const graph = (
    <Plane2D x={[-4, 4]} y={[-3, 3]} label="Curva de nível de uma forma quadrática e seus eixos principais">
      {e.kind === "distinct" && (
        <>
          <InfLine p={[0, 0]} v={u1} color="var(--obj4)" dashed weight={1.5} />
          <InfLine p={[0, 0]} v={u2} color="var(--obj5)" dashed weight={1.5} />
          <Arrow tip={u1} color="var(--obj4)" label="u₁" />
          <Arrow tip={u2} color="var(--obj5)" label="u₂" />
        </>
      )}
      <ImplicitCurve F={F} color="var(--obj1)" />
    </Plane2D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            Toda matriz simétrica tem autovalores reais e autovetores ortogonais. Por isso ela se escreve como <strong>A = PDPᵀ</strong>, com P
            ortogonal (colunas = autovetores unitários) e D diagonal (autovalores).
          </p>
          <p>
            A forma quadrática xᵀAx = ax² + 2bxy + cy² ganha um termo misto quando b ≠ 0. Nos eixos dos autovetores (x′, y′) ela vira λ₁x′² + λ₂y′²,
            sem termo misto. É exatamente a rotação usada para classificar cônicas no módulo C4.
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation
          general={`\\vec x^{T}A\\vec x = ax^2 + 2bxy + cy^2 = 1`}
          current={o1(`${texLinear([a, 2 * b, c], ["x^2", "xy", "y^2"])} = 1`)}
        />
        {real && <LiveEquation label="Nos eixos principais" current={`${texLinear([l1, l2], [o4("x'^2"), o5("y'^2")], 0, { maxDen: 12 })} = 1`} />}
      </Block>
      <Block title="Controles">
        <div className="controls">
          <Slider tex="a" value={a} onChange={(v) => set({ a: v })} min={-4} max={4} step={0.25} />
          <Slider tex="b" value={b} onChange={(v) => set({ b: v })} min={-4} max={4} step={0.25} />
          <Slider tex="c" value={c} onChange={(v) => set({ c: v })} min={-4} max={4} step={0.25} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Elipse girada", apply: () => set({ a: 2, b: 1, c: 2 }) },
          { label: "Diagonal", apply: () => set({ a: 1, b: 0, c: 4 }) },
          { label: "Hipérbole", apply: () => set({ a: 1, b: 2, c: 1 }) },
          { label: "Um autovalor nulo", apply: () => set({ a: 1, b: 1, c: 1 }) },
          { label: "Negativa definida", apply: () => set({ a: -1, b: 0, c: -2 }) },
        ]}
      />
      <Block title="Diagonalização">
        {e.kind === "distinct" ? (
          <Results>
            <ResultRow label="A" tex={texMatrix(A)} />
            <ResultRow label="Autovalores" tex={`\\lambda_1 = ${texV(l1)},\\ \\lambda_2 = ${texV(l2)}`} />
            <ResultRow label="P" tex={texMatrix(P, { maxDen: 0, digits: 3 })} />
            <ResultRow label="D" tex={texMatrix([[l1, 0], [0, l2]], { maxDen: 0, digits: 3 })} />
            <ResultRow label="A = PDPᵀ" tex={`${texMatrix(P, { maxDen: 0, digits: 2 })}${texMatrix([[l1, 0], [0, l2]], { maxDen: 0, digits: 2 })}${texMatrix([[P[0][0], P[1][0]], [P[0][1], P[1][1]]], { maxDen: 0, digits: 2 })}`} />
          </Results>
        ) : (
          <Note>{e.kind === "repeated-full" ? "A já é diagonal (A = λI): qualquer par de eixos ortogonais serve." : "Autovalores iguais."}</Note>
        )}
        <div style={{ marginTop: 8 }}>
          <Note kind={kind === "elipse" ? "ok" : kind === "hiperbole" ? "info" : "warn"}>{KIND_TEXT[kind]}</Note>
        </div>
      </Block>
    </ModuleLayout>
  );
}

const texV = (x: number) => (Math.abs(x - Math.round(x * 4) / 4) < 1e-9 ? tex(x) : texDec(x, 3));
