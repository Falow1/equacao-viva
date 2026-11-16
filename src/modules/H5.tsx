import { leastSquares } from "../math/orthogonal";
import { o1, o3, tex, texDec, texMatrix, texPoly } from "../math/format";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Segmented } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { DraggablePoint, Plane2D, Plot, Segment, type P2 } from "../viz2d";

export default function H5() {
  const [s, set, reset] = useUrlState({ pts: [[-3, -1.5], [-1.5, -1], [0, 0.5], [1, 1], [2.5, 1.5], [3.5, 3]], grau: 1 });
  const pts = s.pts as P2[];
  const fit = leastSquares(pts, s.grau);
  const f = (x: number) => (fit ? fit.coeffs.reduce((acc, c, k) => acc + c * x ** k, 0) : NaN);
  const polyHigh = fit ? [...fit.coeffs].reverse() : [];
  const move = (i: number, p: P2) => set({ pts: pts.map((q, j) => (j === i ? p : q)) });

  const graph = (
    <Plane2D
      x={[-5, 5]}
      y={[-4, 4]}
      label="Pontos e curva de mínimos quadrados. Clique em área vazia para adicionar um ponto."
      onClick={(p) => {
        if (pts.length >= 20) return;
        if (pts.some((q) => Math.hypot(q[0] - p[0], q[1] - p[1]) < 0.4)) return;
        set({ pts: [...pts, [Math.round(p[0] * 2) / 2, Math.round(p[1] * 2) / 2]] });
      }}
      overlay={<div className="graph-overlay bl"><span className="graph-legend">Clique numa área vazia para adicionar um ponto</span></div>}
    >
      {fit && pts.map((p, i) => <Segment key={`r${i}`} a={p} b={[p[0], f(p[0])]} color="var(--obj2)" weight={2} dashed />)}
      {fit && <Plot.OfX y={f} color="var(--obj1)" weight={3} />}
      {pts.map((p, i) => (
        <DraggablePoint key={i} point={p} onMove={(q) => move(i, q)} color="var(--obj3)" />
      ))}
    </Plane2D>
  );

  const n = pts.length;
  const needed = s.grau + 1;

  return (
    <ModuleLayout
      graph={graph}
      onReset={reset}
      explain={
        <>
          <p>
            Com mais pontos do que incógnitas, o sistema Ax = b quase nunca tem solução: nenhuma reta passa por todos os pontos. Mínimos quadrados
            escolhe a curva que minimiza a <strong>soma dos quadrados dos resíduos</strong> (os segmentos tracejados).
          </p>
          <p>
            Geometricamente, Ax̂ é a projeção ortogonal de b sobre o espaço coluna de A. A condição de ortogonalidade Aᵀ(b − Ax̂) = 0 dá as{" "}
            <strong>equações normais</strong> AᵀAx̂ = Aᵀb.
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation general="A^{T}A\,\hat{x} = A^{T}\vec b" current={fit ? `${texMatrix(fit.AtA, { maxDen: 4, digits: 2 })}\\hat x = ${texMatrix(fit.Atb.map((x) => [x]), { maxDen: 4, digits: 2 })}` : "\\text{faltam pontos}"} />
        {fit && <LiveEquation label="Curva ajustada" current={o1(`y = ${texPoly(polyHigh, "x", { maxDen: 0, digits: 3 })}`)} />}
      </Block>
      {!fit && <Note kind="warn">São necessários pelo menos {needed} pontos com abscissas diferentes para ajustar {s.grau === 1 ? "uma reta" : "uma parábola"}.</Note>}
      <Block title="Controles">
        <div className="controls">
          <Segmented label="Modelo" value={String(s.grau)} onChange={(g) => set({ grau: Number(g) })} options={[{ value: "1", label: "Reta" }, { value: "2", label: "Parábola" }]} />
          <div className="row">
            <button type="button" className="btn small" onClick={() => set({ pts: pts.slice(0, -1) })} disabled={n === 0}>Remover último ponto</button>
            <button type="button" className="btn small" onClick={() => set({ pts: [] })} disabled={n === 0}>Limpar pontos</button>
          </div>
        </div>
      </Block>
      <Presets
        items={[
          { label: "Tendência linear", apply: () => set({ pts: [[-3, -1.5], [-1.5, -1], [0, 0.5], [1, 1], [2.5, 1.5], [3.5, 3]], grau: 1 }) },
          { label: "Pontos alinhados", apply: () => set({ pts: [[-2, -1], [0, 0], [2, 1], [4, 2]], grau: 1 }) },
          { label: "Formato de parábola", apply: () => set({ pts: [[-3, 3], [-2, 1], [-1, -0.5], [0, -1], [1, -0.5], [2, 1.5], [3, 3]], grau: 2 }) },
          { label: "Só dois pontos", apply: () => set({ pts: [[-2, -1], [2, 2]], grau: 1 }) },
          { label: "Mesma abscissa", apply: () => set({ pts: [[1, -1], [1, 2]], grau: 1 }) },
        ]}
      />
      {fit && (
        <Block title="Resultados">
          <Results>
            <ResultRow label="Pontos" tex={tex(n)} />
            <ResultRow label="Coeficientes" tex={fit.coeffs.map((c, k) => `${["a_0", "a_1", "a_2"][k]} \\approx ${texDec(c, 3)}`).join(",\\ ")} />
            <ResultRow label="Soma dos quadrados" tex={o3(`\\sum r_i^2 \\approx ${texDec(fit.sse, 3)}`)} />
          </Results>
          {fit.sse < 1e-9 && (
            <div style={{ marginTop: 8 }}>
              <Note kind="ok">Resíduo zero: os pontos estão exatamente sobre a curva, o sistema original tem solução.</Note>
            </div>
          )}
        </Block>
      )}
    </ModuleLayout>
  );
}
