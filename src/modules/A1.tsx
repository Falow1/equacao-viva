import { cl, tex, texRootApprox, texTuple } from "../math/format";
import { add, norm, scale, sub } from "../math/vec";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented, Slider, VecInput } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Arrow, DraggablePoint, Fill, Plane2D, type P2 } from "../viz2d";

type Mode = "soma" | "diferenca" | "combinacao";

export default function A1() {
  const [s, set, reset] = useUrlState({ u: [3, 1], v: [1, 2.5], a: 2, b: -1, modo: "soma" as Mode });
  const u = s.u as P2, v = s.v as P2;
  const mode = s.modo as Mode;
  const sum = add(u, v);
  const diff = sub(u, v);
  const au = scale(u, s.a), bv = scale(v, s.b);
  const comb = add(au, bv);
  const result = mode === "soma" ? sum : mode === "diferenca" ? diff : comb;

  const U = (t: string) => cl("obj1", t), V = (t: string) => cl("obj2", t), R = (t: string) => cl("obj3", t);
  let general: string, current: string;
  if (mode === "soma") {
    general = `${U("\\vec u")} + ${V("\\vec v")} = (u_1 + v_1;\\ u_2 + v_2)`;
    current = `${U(texTuple(u))} + ${V(texTuple(v))} = ${R(texTuple(sum))}`;
  } else if (mode === "diferenca") {
    general = `${U("\\vec u")} - ${V("\\vec v")} = (u_1 - v_1;\\ u_2 - v_2)`;
    current = `${U(texTuple(u))} - ${V(texTuple(v))} = ${R(texTuple(diff))}`;
  } else {
    general = `\\alpha${U("\\vec u")} + \\beta${V("\\vec v")} = (\\alpha u_1 + \\beta v_1;\\ \\alpha u_2 + \\beta v_2)`;
    current = `${tex(s.a)}\\,${U(texTuple(u))} ${s.b < 0 ? "-" : "+"} ${tex(Math.abs(s.b))}\\,${V(texTuple(v))} = ${R(texTuple(comb))}`;
  }

  const graph = (
    <Plane2D x={[-5, 6]} y={[-4, 6]} label="Vetores u e v no plano">
      {mode === "soma" && (
        <>
          <Fill points={[[0, 0], u, sum, v]} color="var(--obj3)" opacity={0.08} />
          <Arrow tail={u} tip={sum} color="var(--obj2)" dashed weight={2} opacity={0.6} />
          <Arrow tail={v} tip={sum} color="var(--obj1)" dashed weight={2} opacity={0.6} />
          <Arrow tip={sum} color="var(--obj3)" label="u + v" />
        </>
      )}
      {mode === "diferenca" && (
        <>
          <Arrow tail={v} tip={u} color="var(--obj3)" dashed weight={2} opacity={0.7} />
          <Arrow tip={diff} color="var(--obj3)" label="u − v" />
          <Arrow tip={scale(v, -1) as P2} color="var(--obj2)" dashed weight={2} opacity={0.5} label="−v" />
        </>
      )}
      {mode === "combinacao" && (
        <>
          <Arrow tip={au as P2} color="var(--obj1)" weight={2} opacity={0.55} label="αu" />
          <Arrow tail={au as P2} tip={comb as P2} color="var(--obj2)" weight={2} opacity={0.55} label="βv" />
          <Arrow tip={comb as P2} color="var(--obj3)" label="αu + βv" />
        </>
      )}
      <Arrow tip={u} color="var(--obj1)" label={mode === "combinacao" ? undefined : "u"} />
      <Arrow tip={v} color="var(--obj2)" label={mode === "combinacao" ? undefined : "v"} />
      <DraggablePoint point={u} onMove={(p) => set({ u: p })} color="var(--obj1)" label={mode === "combinacao" ? "u" : undefined} />
      <DraggablePoint point={v} onMove={(p) => set({ v: p })} color="var(--obj2)" label={mode === "combinacao" ? "v" : undefined} />
    </Plane2D>
  );

  const zero = norm(result) < 1e-9;

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            Um vetor é uma flecha: tem direção, sentido e comprimento. Somar vetores é colocar um depois do outro; o resultado vai da origem até a
            ponta do último. As duas ordens formam um paralelogramo, por isso <strong>u + v = v + u</strong>.
          </p>
          <p>
            A diferença u − v é o vetor que vai da ponta de v até a ponta de u. Multiplicar por um número α estica (|α| &gt; 1), encolhe
            (|α| &lt; 1) ou inverte o sentido (α &lt; 0).
          </p>
          <p>Algebricamente tudo é feito coordenada a coordenada.</p>
        </>
      }
    >
      <Block title="Operação">
        <Segmented<Mode>
          label="Operação"
          value={mode}
          onChange={(m) => set({ modo: m })}
          options={[
            { value: "soma", label: "u + v" },
            { value: "diferenca", label: "u − v" },
            { value: "combinacao", label: "αu + βv" },
          ]}
        />
      </Block>
      <Block title="Equação">
        <LiveEquation general={general} current={current} />
      </Block>
      <Block title="Controles">
        <div className="controls">
          <VecInput label={U("\\vec u")} value={u} onChange={(x) => set({ u: x })} />
          <VecInput label={V("\\vec v")} value={v} onChange={(x) => set({ v: x })} />
          {mode === "combinacao" && (
            <>
              <Slider tex="\alpha" value={s.a} onChange={(a) => set({ a })} min={-3} max={3} step={0.25} />
              <Slider tex="\beta" value={s.b} onChange={(b) => set({ b })} min={-3} max={3} step={0.25} />
            </>
          )}
        </div>
      </Block>
      <Presets
        items={[
          { label: "Soma simples", apply: () => set({ u: [3, 1], v: [1, 2.5], modo: "soma" }) },
          { label: "Vetores opostos", apply: () => set({ u: [2, 1], v: [-2, -1], modo: "soma" }) },
          { label: "v nulo", apply: () => set({ u: [2, 2], v: [0, 0], modo: "soma" }) },
          { label: "2u − v", apply: () => set({ u: [1, 1], v: [2, -1], a: 2, b: -1, modo: "combinacao" }) },
          { label: "Vetores paralelos", apply: () => set({ u: [1, 0.5], v: [3, 1.5], modo: "diferenca" }) },
        ]}
      />
      <Block title="Resultados">
        <Results>
          <ResultRow label="‖u‖" tex={`\\sqrt{${tex(u[0] ** 2)} + ${tex(u[1] ** 2)}} = ${texRootApprox(u[0] ** 2 + u[1] ** 2)}`} />
          <ResultRow label="‖v‖" tex={`\\sqrt{${tex(v[0] ** 2)} + ${tex(v[1] ** 2)}} = ${texRootApprox(v[0] ** 2 + v[1] ** 2)}`} />
          <ResultRow label="‖resultado‖" tex={texRootApprox(result[0] ** 2 + result[1] ** 2)} />
        </Results>
        {zero && (
          <div style={{ marginTop: 8 }}>
            <Note kind="warn">
              {mode === "soma"
                ? "O resultado é o vetor nulo: u e v têm o mesmo comprimento e sentidos opostos (v = −u)."
                : mode === "diferenca"
                  ? "O resultado é o vetor nulo: u e v são iguais."
                  : "A combinação deu o vetor nulo: as duas parcelas se cancelam."}
            </Note>
          </div>
        )}
      </Block>
    </ModuleLayout>
  );
}
