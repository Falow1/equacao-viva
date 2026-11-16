import { inverse, mulVec } from "../math/mat";
import { o1, o2, o3, tex, texMatrix, texTuple } from "../math/format";
import { cross2 } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow, BasisGrid, DraggablePoint, Plane2D, type P2 } from "../viz2d";

export default function F3() {
  const [s, set, reset] = useUrlState({ b1: [2, 0.5], b2: [0.5, 1.5], v: [3, 3] });
  const b1 = s.b1 as P2, b2 = s.b2 as P2, v = s.v as P2;
  const P = [[b1[0], b2[0]], [b1[1], b2[1]]];
  const Pinv = inverse(P);
  const isBasis = Math.abs(cross2(b1, b2)) > 1e-9;
  const c = Pinv ? (mulVec(Pinv, v) as P2) : null;

  const graph = (
    <Plane2D x={[-5, 6]} y={[-4, 5]} label="Base B e coordenadas de um ponto">
      {isBasis && <BasisGrid b1={b1} b2={b2} n={10} color="var(--obj4)" opacity={0.5} />}
      {c && (
        <>
          <Arrow tip={[c[0] * b1[0], c[0] * b1[1]]} color="var(--obj1)" weight={2} dashed opacity={0.8} />
          <Arrow tail={[c[0] * b1[0], c[0] * b1[1]]} tip={v} color="var(--obj2)" weight={2} dashed opacity={0.8} />
        </>
      )}
      <Arrow tip={v} color="var(--obj3)" label="v" />
      <Arrow tip={b1} color="var(--obj1)" label="b₁" weight={4} />
      <Arrow tip={b2} color="var(--obj2)" label="b₂" weight={4} />
      <DraggablePoint point={b1} onMove={(p) => set({ b1: p })} color="var(--obj1)" />
      <DraggablePoint point={b2} onMove={(p) => set({ b2: p })} color="var(--obj2)" />
      <DraggablePoint point={v} onMove={(p) => set({ v: p })} color="var(--obj3)" />
    </Plane2D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            Uma base B = {"{b₁, b₂}"} do plano é um par de vetores não paralelos. Todo vetor v se escreve de um único jeito como v = c₁b₁ + c₂b₂; os
            números (c₁; c₂) são as <strong>coordenadas de v na base B</strong>, escritas [v]<sub>B</sub>.
          </p>
          <p>
            A grade roxa é a “grade da base B”: as coordenadas em B se leem contando passos ao longo de b₁ e b₂. A matriz P = [b₁ b₂] converte de B para a
            base canônica (v = P[v]<sub>B</sub>) e sua inversa faz o caminho contrário: [v]<sub>B</sub> = P⁻¹v.
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation
          general={`[${o3("\\vec v")}]_B = P^{-1}${o3("\\vec v")},\\quad P = [\\,${o1("b_1")}\\ ${o2("b_2")}\\,]`}
          current={c && Pinv ? `${texMatrix(Pinv)}${o3(texMatrix([[v[0]], [v[1]]]))} = ${texMatrix([[c[0]], [c[1]]])}` : "\\det P = 0"}
        />
      </Block>
      {!isBasis && <Note kind="warn">b₁ e b₂ são paralelos (ou um deles é nulo): eles não formam uma base, porque só geram uma reta.</Note>}
      {c && (
        <Block title="Coordenadas">
          <Results>
            <ResultRow label="Na base canônica" tex={o3(`\\vec v = ${texTuple(v)}`)} />
            <ResultRow label="Na base B" tex={`[\\vec v]_B = ${texTuple(c)}`} />
            <ResultRow label="Conferência" tex={`${tex(c[0])}\\,${o1(texTuple(b1))} + ${tex(c[1])}\\,${o2(texTuple(b2))} = ${o3(texTuple(v))}`} />
            <ResultRow label="P" tex={texMatrix(P)} />
          </Results>
        </Block>
      )}
      <Block title="Controles">
        <div className="controls">
          <VecInput label={o1("b_1")} value={b1} onChange={(x) => set({ b1: x })} />
          <VecInput label={o2("b_2")} value={b2} onChange={(x) => set({ b2: x })} />
          <VecInput label={o3("\\vec v")} value={v} onChange={(x) => set({ v: x })} />
        </div>
      </Block>
      <Presets
        items={[
          { label: "Base inclinada", apply: () => set({ b1: [2, 0.5], b2: [0.5, 1.5], v: [3, 3] }) },
          { label: "Base canônica", apply: () => set({ b1: [1, 0], b2: [0, 1] }) },
          { label: "Base girada 45°", apply: () => set({ b1: [1, 1], b2: [-1, 1], v: [2, 0] }) },
          { label: "Base esticada", apply: () => set({ b1: [2, 0], b2: [0, 0.5], v: [3, 2] }) },
          { label: "Vetores paralelos", apply: () => set({ b1: [1, 1], b2: [2, 2] }) },
        ]}
      />
    </ModuleLayout>
  );
}
