import { useMemo } from "react";
import { classifyConic, conicF } from "../math/conics";
import { fmt, o3, texLinear } from "../math/format";
import { marchingSquares } from "../math/implicit2d";
import { QUADRICS, quadricF, quadricTrace, type QuadricId } from "../math/quadrics";
import { positive, useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, ResultRow, Results, Segmented, Slider } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { ImplicitCurve, Plane2D } from "../viz2d";
import { ImplicitSurface, PlaneMesh, Scene3D, Segments3D, type V3 } from "../viz3d";

type Axis = "x" | "y" | "z";
const R = 4;

export default function D1() {
  const [s, set, reset] = useUrlState(
    { q: "elipsoide", a: 3, b: 2, c: 1.5, axis: "z", k: 0.5, cut: true as boolean },
    { q: QUADRICS.map((d) => d.id), axis: ["x", "y", "z"] },
  );
  const def = QUADRICS.find((d) => d.id === (s.q as QuadricId)) ?? QUADRICS[0];
  const qa = positive(s.a, 0.5), qb = positive(s.b, 0.5), qc = positive(s.c, 0.5);
  const axis = s.axis as Axis;
  const coeffs = def.coeffs(qa, qb, qc);
  const F = useMemo(() => quadricF(coeffs), [def.id, qa, qb, qc]); // eslint-disable-line react-hooks/exhaustive-deps
  const trace = quadricTrace(coeffs, axis, s.k);
  const info = classifyConic(trace.conic);
  const F2 = conicF(trace.conic);

  const traceSegs = useMemo(() => {
    if (!s.cut) return [];
    const flat = marchingSquares(F2, [-R, R], [-R, R], 90, 90);
    const pts: V3[] = [];
    const ai = axis === "x" ? 0 : axis === "y" ? 1 : 2;
    const [i1, i2] = [0, 1, 2].filter((i) => i !== ai);
    for (let i = 0; i + 1 < flat.length; i += 2) {
      const p: V3 = [0, 0, 0];
      p[ai] = s.k;
      p[i1] = flat[i];
      p[i2] = flat[i + 1];
      pts.push(p);
    }
    return pts;
  }, [def.id, qa, qb, qc, axis, s.k, s.cut]); // eslint-disable-line react-hooks/exhaustive-deps

  const n: V3 = axis === "x" ? [1, 0, 0] : axis === "y" ? [0, 1, 0] : [0, 0, 1];
  const [u, v] = trace.vars;
  const c = trace.conic;
  const traceEq = `${texLinear([c.A, c.C, c.D, c.E], [`${u}^2`, `${v}^2`, u, v], c.F)} = 0`;

  const graph = (
    <Scene3D R={R} label={`${def.name} com plano de corte ${axis} = k`}>
      <ImplicitSurface F={F} R={R} res={44} color="obj1" opacity={1} deps={[def.id, qa, qb, qc, s.cut]} />
      {s.cut && <PlaneMesh plane={{ n, d: s.k }} color="obj5" opacity={0.16} R={R} />}
      {s.cut && <Segments3D points={traceSegs} color="obj3" width={3.5} onTop />}
    </Scene3D>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      snapToggle={false}
      explain={
        <>
          <p>
            As <strong>quádricas</strong> são as superfícies dadas por equações do segundo grau em x, y e z. Elas são o análogo 3D das cônicas, e o jeito
            mais fácil de reconhecê-las é olhar os <strong>traços</strong>: as curvas obtidas cortando a superfície por planos paralelos aos planos
            coordenados.
          </p>
          <p>
            Fixando, por exemplo, z = k, sobra uma equação em x e y, que é uma cônica. Mova o slider de k e observe no quadro pequeno como o traço muda:
            no elipsoide as elipses encolhem até virar um ponto; no hiperboloide de duas folhas o plano passa a não tocar a superfície; na sela, os traços
            horizontais trocam de hipérbole para retas e de volta.
          </p>
          <p>Quando uma variável não aparece na equação, a superfície é um <strong>cilindro</strong>: a curva se repete ao longo do eixo que falta.</p>
        </>
      }
    >
      <Block title="Superfície">
        <select className="select" value={def.id} onChange={(e) => set({ q: e.target.value })} aria-label="Escolher quádrica">
          {QUADRICS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
        <div className="mt-10">
          <LiveEquation current={def.equation(qa, qb, qc)} />
        </div>
        <Note>{def.note}</Note>
      </Block>
      <Block title="Parâmetros">
        <div className="controls">
          {def.uses.includes("a") && <Slider tex="a" value={qa} onChange={(x) => set({ a: x })} min={0.5} max={4} step={0.1} />}
          {def.uses.includes("b") && <Slider tex="b" value={qb} onChange={(x) => set({ b: x })} min={0.5} max={4} step={0.1} />}
          {def.uses.includes("c") && <Slider tex="c" value={qc} onChange={(x) => set({ c: x })} min={0.5} max={4} step={0.1} />}
        </div>
      </Block>
      <Block title="Plano de corte">
        <div className="row between mb-8">
          <Segmented
            label="Eixo do plano de corte"
            value={axis}
            onChange={(x) => set({ axis: x })}
            options={[
              { value: "x", label: "x = k" },
              { value: "y", label: "y = k" },
              { value: "z", label: "z = k" },
            ]}
          />
          <label className="row small-text">
            <input type="checkbox" checked={s.cut} onChange={(e) => set({ cut: e.target.checked })} /> Mostrar corte
          </label>
        </div>
        <Slider tex="k" value={s.k} onChange={(x) => set({ k: x })} min={-R} max={R} step={0.1} />
        {s.cut && (
          <>
            <Results>
              <ResultRow label={`Traço em ${axis} = ${fmt(s.k)}`} tex={o3(traceEq)} />
              <ResultRow label="Tipo">
                <strong className="obj3">{info.kind === "vazio" ? "Vazio: o plano não encontra a superfície" : info.name}</strong>
              </ResultRow>
            </Results>
            <div className="mini-graph mt-10" aria-label={`Traço no plano ${axis} = k, eixos ${u} e ${v}`}>
              <Plane2D x={[-R, R]} y={[-R, R]} label={`Traço no plano ${u}${v}`}>
                <ImplicitCurve F={F2} color="var(--obj3)" res={120} />
              </Plane2D>
              <div className="graph-overlay bl">
                <span className="graph-legend">
                  horizontal: <strong>{u}</strong> · vertical: <strong>{v}</strong>
                </span>
              </div>
            </div>
          </>
        )}
      </Block>
      <div className="block">
        <div className="block-title">Exemplos</div>
        <div className="presets">
          <button type="button" className="pill" onClick={() => set({ q: "elipsoide", a: 2, b: 2, c: 2, axis: "z", k: 1 })}>
            Esfera
          </button>
          <button type="button" className="pill" onClick={() => set({ q: "cone", a: 1, b: 1, c: 1, axis: "y", k: 1 })}>
            Cone cortado: hipérbole
          </button>
          <button type="button" className="pill" onClick={() => set({ q: "cone", a: 1, b: 1, c: 1, axis: "z", k: 0 })}>
            Cone em z = 0: ponto
          </button>
          <button type="button" className="pill" onClick={() => set({ q: "paraboloide-hiperbolico", a: 1.5, b: 1.5, c: 1, axis: "z", k: 0 })}>
            Sela em z = 0
          </button>
          <button type="button" className="pill" onClick={() => set({ q: "hiperboloide2", a: 1, b: 1, c: 1, axis: "z", k: 0.5 })}>
            Duas folhas sem corte
          </button>
        </div>
      </div>
    </ModuleLayout>
  );
}
