import { tex, texEquation } from "../math/format";
import type { SysResult } from "../math/linsys";
import type { Vec3 } from "../math/vec";
import { Dot, GeneralLine, InfLine, Plane2D, type P2 } from "../viz2d";
import { Line3D, PlaneMesh, Point3D, Scene3D, type V3 } from "../viz3d";

export const ROW_COLORS = ["obj1", "obj2", "obj6"];
export const VARS2 = ["x", "y"];
export const VARS3 = ["x", "y", "z"];

const isZeroRow = (r: number[], n: number) => r.slice(0, n).every((x) => Math.abs(x) < 1e-12);

/** Sistema em LaTeX (chave à esquerda), cada linha com sua cor. */
export function systemTex(aug: number[][], opts: { maxDen?: number } = {}): string {
  const n = aug[0].length - 1;
  const vars = n === 2 ? VARS2 : VARS3;
  const rows = aug.map((r, i) => {
    const eq = isZeroRow(r, n) ? `0 = ${tex(r[n], opts)}` : texEquation(r.slice(0, n), vars, r[n], { maxDen: opts.maxDen ?? 12 });
    return `\\htmlClass{${ROW_COLORS[i]}}{${eq}}`;
  });
  return `\\begin{cases} ${rows.join(" \\\\ ")} \\end{cases}`;
}

/** Retas (2 incógnitas) ou planos (3 incógnitas) de um sistema, com a solução destacada. */
export function SystemGraph({ aug, sol, label }: { aug: number[][]; sol: SysResult | null; label?: string }) {
  const n = aug[0].length - 1;
  if (n === 2) {
    return (
      <Plane2D x={[-5, 5]} y={[-4, 4]} label={label ?? "Retas do sistema"}>
        {aug.map((r, i) => (isZeroRow(r, 2) ? null : <GeneralLine key={i} a={r[0]} b={r[1]} c={-r[2]} color={`var(--${ROW_COLORS[i]})`} weight={3} />))}
        {sol?.type === "SPI" && sol.directions.length === 1 && sol.particular && (
          <InfLine p={sol.particular as P2} v={sol.directions[0] as P2} color="var(--obj3)" weight={7} opacity={0.45} />
        )}
        {sol?.type === "SPD" && sol.particular && <Dot at={sol.particular as P2} color="var(--obj3)" r={7} label="S" />}
      </Plane2D>
    );
  }
  return (
    <Scene3D R={4} label={label ?? "Planos do sistema"}>
      {aug.map((r, i) => (isZeroRow(r, 3) ? null : <PlaneMesh key={i} plane={{ n: r.slice(0, 3) as Vec3, d: r[3] }} color={ROW_COLORS[i]} opacity={0.26} />))}
      {sol?.type === "SPI" && sol.directions.length === 1 && sol.particular && (
        <Line3D line={{ p: sol.particular as Vec3, v: sol.directions[0] as Vec3 }} color="obj3" width={6} />
      )}
      {sol?.type === "SPD" && sol.particular && <Point3D at={sol.particular as V3} color="obj3" size={0.13} label="S" />}
    </Scene3D>
  );
}

/** Solução em LaTeX: ponto, solução geral paramétrica ou "sem solução". */
export function solutionTex(sol: SysResult): string {
  const vars = sol.n === 2 ? VARS2 : VARS3;
  const X = `(${vars.join(";\\ ")})`;
  if (sol.type === "SI") return "S = \\varnothing";
  const tup = (v: number[]) => `(${v.map((x) => tex(x)).join(";\\ ")})`;
  if (sol.type === "SPD") return `${X} = ${tup(sol.particular!)}`;
  const params = ["t", "s", "r"];
  return `${X} = ${tup(sol.particular!)} ${sol.directions.map((d, i) => `+ ${params[i]}\\,${tup(d)}`).join(" ")}`;
}
