import { useEffect, useMemo, useRef, useState } from "react";
import { classifyConic, conicF, type ConicCoeffs } from "../math/conics";
import { fmtDeg, o1, o4, tex, texDec, texLinear, texTuple } from "../math/format";
import { useUrlState } from "../state/useUrlState";
import { Block, LiveEquation, Note, Presets, ResultRow, Results, Slider } from "../ui/controls";
import { ModuleLayout } from "../ui/ModuleLayout";
import { Tex } from "../ui/Tex";
import { Dot, ImplicitCurve, InfLine, Label, Plane2D, Segment, type P2 } from "../viz2d";

const KEYS = ["A", "B", "C", "D", "E", "F"] as const;

export default function C4() {
  const [s, set, reset] = useUrlState({ k: [5, -6, 5, 0, 0, -8] });
  const k: ConicCoeffs = { A: s.k[0], B: s.k[1], C: s.k[2], D: s.k[3], E: s.k[4], F: s.k[5] };
  const info = useMemo(() => classifyConic(k), [s.k.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const F = useMemo(() => conicF(k), [s.k.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
  const [tau, setTau] = useState(1);
  const raf = useRef(0);
  const animate = () => {
    cancelAnimationFrame(raf.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setTau(1);
      return;
    }
    const t0 = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 1800);
      setTau(t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
      if (t < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
  };
  useEffect(() => () => cancelAnimationFrame(raf.current), []);
  const setK = (i: number, v: number) => set({ k: s.k.map((x, j) => (j === i ? v : x)) });

  const ang = info.theta * tau;
  const org: P2 = [info.origin[0] * tau, info.origin[1] * tau];
  const ex: P2 = [Math.cos(ang), Math.sin(ang)];
  const ey: P2 = [-Math.sin(ang), Math.cos(ang)];
  const isConic = !["reta", "plano-todo"].includes(info.kind);
  const general = "Ax^2 + Bxy + Cy^2 + Dx + Ey + F = 0";
  const current = `${texLinear(s.k.slice(0, 5), ["x^2", "xy", "y^2", "x", "y"], s.k[5])} = 0`;
  const r = info.rotated;

  const graph = (
    <Plane2D x={[-6, 6]} y={[-5, 5]} label="Cônica da equação geral do segundo grau">
      {isConic && (
        <>
          <InfLine p={org} v={ex} color="var(--obj4)" dashed weight={1.5} />
          <InfLine p={org} v={ey} color="var(--obj4)" dashed weight={1.5} />
          <Label at={[org[0] + 4.2 * ex[0], org[1] + 4.2 * ex[1]]} text="x'" color="var(--obj4)" dir="se" />
          <Label at={[org[0] + 4.2 * ey[0], org[1] + 4.2 * ey[1]]} text="y'" color="var(--obj4)" dir="ne" />
        </>
      )}
      {info.asymptotes.map((l, i) => (
        <InfLine key={`as${i}`} p={l.p} v={l.v} color="var(--obj6)" dashed weight={1.5} />
      ))}
      {info.directrix && <InfLine p={info.directrix.p} v={info.directrix.v} color="var(--obj6)" weight={2} />}
      <ImplicitCurve F={F} color="var(--obj1)" />
      {info.lines.map((l, i) => (
        <InfLine key={`l${i}`} p={l.p} v={l.v} color="var(--obj1)" weight={3} />
      ))}
      {info.kind === "ponto" && <Dot at={info.origin} color="var(--obj1)" r={6} />}
      {info.foci.map((f, i) => (
        <Dot key={`f${i}`} at={f} color="var(--obj5)" label={info.foci.length > 1 ? `F${i === 0 ? "₁" : "₂"}` : "F"} dir="s" />
      ))}
      {info.vertices.slice(0, info.kind === "elipse" ? 2 : 4).map((v, i) => (
        <Dot key={`v${i}`} at={v} color="var(--obj1)" r={3.5} />
      ))}
      {(info.kind === "elipse" || info.kind === "hiperbole" || info.kind === "circunferencia") && <Dot at={info.origin} color="var(--obj4)" r={4} />}
      {info.kind === "parabola" && info.axis && <Segment a={info.origin} b={info.foci[0]} color="var(--obj5)" dashed weight={1.5} />}
    </Plane2D>
  );

  const steps = (
    <ol className="steps">
      <li>
        <div className="step-n">1. Discriminante</div>
        <Tex>{`B^2 - 4AC = ${tex(k.B * k.B)} - 4\\cdot ${tex(k.A)}\\cdot ${tex(k.C)} = ${tex(info.disc)}`}</Tex> → gênero {info.genus}.
      </li>
      <li>
        <div className="step-n">2. Rotação que elimina o termo xy</div>
        {Math.abs(k.B) < 1e-12 ? (
          "B = 0: não é preciso girar os eixos."
        ) : (
          <>
            <Tex>{`\\tan 2\\theta = \\dfrac{B}{A - C} = \\dfrac{${tex(k.B)}}{${tex(k.A - k.C)}}`}</Tex>
            {" "}→ θ ≈ {fmtDeg(info.theta)}
          </>
        )}
      </li>
      <li>
        <div className="step-n">3. Equação nos eixos girados</div>
        <Tex>{`${texLinear([r.A, r.C, r.D, r.E], ["x'^2", "y'^2", "x'", "y'"], r.F, { digits: 2, maxDen: 8 })} = 0`}</Tex>
      </li>
      <li>
        <div className="step-n">4. Completando quadrados (translação para {texTupleTxt(info.origin)})</div>
        {info.canonical ? <Tex>{info.canonical}</Tex> : "Não se aplica."}
      </li>
    </ol>
  );

  return (
    <ModuleLayout
      graph={graph}
      onReset={() => {
        reset();
        setTau(1);
      }}
      snapToggle={false}
      steps={steps}
      explain={
        <>
          <p>
            Toda equação do 2º grau em x e y descreve uma cônica, possivelmente degenerada. O sinal de <strong>B² − 4AC</strong> decide o gênero:
            negativo é elíptico (elipse, ponto ou vazio), positivo é hiperbólico (hipérbole ou duas retas concorrentes), zero é parabólico (parábola,
            retas paralelas, reta dupla ou vazio).
          </p>
          <p>
            O termo Bxy indica que a cônica está girada. Girando os eixos pelo ângulo θ com tan 2θ = B/(A − C), o termo xy desaparece. Depois, completar
            quadrados é transladar a origem para o centro (ou vértice). Use o botão para ver os eixos x′y′ se moverem até a posição canônica.
          </p>
        </>
      }
    >
      <Block title="Equação">
        <LiveEquation general={general} current={o1(current)} />
      </Block>
      <Block title="Classificação">
        <Results>
          <ResultRow label="B² − 4AC" tex={`${tex(info.disc)}\\ (${info.disc < 0 ? "< 0" : info.disc > 0 ? "> 0" : "= 0"})`} />
          <ResultRow label="Cônica"><strong>{info.name}</strong></ResultRow>
          {isConic && Math.abs(info.theta) > 1e-9 && <ResultRow label="Rotação θ">{fmtDeg(info.theta)}</ResultRow>}
          {(info.kind === "elipse" || info.kind === "hiperbole" || info.kind === "circunferencia") && <ResultRow label="Centro" tex={o4(texTuple(info.origin))} />}
          {info.kind === "parabola" && <ResultRow label="Vértice" tex={texTuple(info.origin)} />}
          {info.canonical && isConic && <ResultRow label="Forma canônica" tex={info.canonical} />}
          {info.a !== undefined && info.kind !== "parabola" && <ResultRow label="Semieixos" tex={`a \\approx ${texDec(info.a)},\\ b \\approx ${texDec(info.b ?? 0)}`} />}
          {info.e !== undefined && <ResultRow label="Excentricidade" tex={`e \\approx ${texDec(info.e, 3)}`} />}
          {info.foci.length > 0 && <ResultRow label="Foco(s)" tex={info.foci.map((f) => texTuple(f.map((x) => Math.round(x * 100) / 100))).join(",\\ ")} />}
        </Results>
        {(info.kind === "vazio" || info.kind === "ponto" || info.kind.startsWith("retas") || info.kind === "reta-dupla") && (
          <div className="mt-8">
            <Note kind="warn">
              Cônica degenerada.{" "}
              {info.kind === "vazio"
                ? "Nenhum ponto real satisfaz a equação, por isso o gráfico fica vazio."
                : info.kind === "ponto"
                  ? "Só o centro satisfaz a equação."
                  : "A equação se fatora em produto de equações de retas."}
            </Note>
          </div>
        )}
        {isConic && (
          <div className="row mt-10">
            <button type="button" className="btn" onClick={animate}>
              Girar e transladar os eixos
            </button>
          </div>
        )}
      </Block>
      <Block title="Coeficientes">
        <div className="controls">
          {KEYS.map((key, i) => (
            <Slider key={key} tex={key} value={s.k[i]} onChange={(v) => setK(i, v)} min={i === 5 ? -20 : -10} max={i === 5 ? 20 : 10} step={0.5} />
          ))}
        </div>
      </Block>
      <Presets
        items={[
          { label: "Circunferência", apply: () => set({ k: [1, 0, 1, -2, 0, -8] }) },
          { label: "Elipse girada", apply: () => set({ k: [5, -6, 5, 0, 0, -8] }) },
          { label: "Hipérbole xy = 1", apply: () => set({ k: [0, 1, 0, 0, 0, -1] }) },
          { label: "Hipérbole", apply: () => set({ k: [1, 0, -4, -2, 0, -3] }) },
          { label: "Parábola girada", apply: () => set({ k: [1, 2, 1, -8, 8, 0] }) },
          { label: "Retas concorrentes", apply: () => set({ k: [1, 0, -1, 0, 0, 0] }) },
          { label: "Retas paralelas", apply: () => set({ k: [1, 0, 0, 0, 0, -4] }) },
          { label: "Reta dupla", apply: () => set({ k: [1, -2, 1, 0, 0, 0] }) },
          { label: "Um ponto", apply: () => set({ k: [1, 0, 1, 0, 0, 0] }) },
          { label: "Vazio", apply: () => set({ k: [1, 0, 1, 0, 0, 4] }) },
        ]}
      />
    </ModuleLayout>
  );
}

const texDecTxt = (x: number) => (Math.round(x * 10) / 10).toString().replace(".", ",").replace("-", "−");
const texTupleTxt = (p: number[]) => `(${p.map((x) => texDecTxt(Math.round(x * 100) / 10 / 10)).join("; ")})`;
