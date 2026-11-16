import { Suspense, lazy } from "react";
import { Link } from "react-router";
import { MODULES, TRACKS, modulesOfTrack } from "../modules/registry";
import { SITE_TAGLINE, trackColor, useTitle } from "../ui/brand";
import { Icon, TrackIcon, type IconName } from "../ui/icons";

const HeroDemo = lazy(() => import("./HeroDemo"));

const HOW: { icon: IconName; title: string; text: string }[] = [
  { icon: "drag", title: "Arraste", text: "Pontos e vetores se movem com o mouse, o dedo ou o teclado." },
  { icon: "edit", title: "Edite", text: "Todo valor tem um campo; mude o número e o gráfico acompanha." },
  { icon: "share", title: "Compartilhe", text: "“Copiar link” guarda o estado exato do que está na tela." },
];

export function Home() {
  useTitle();
  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-text">
          <p className="eyebrow">{SITE_TAGLINE}</p>
          <h1 className="hero-title">Mexa no gráfico. Veja a equação mudar.</h1>
          <p className="page-lead">
            {MODULES.length} módulos interativos, de vetores a diagonalização. Arraste pontos e vetores e a fórmula acompanha; edite os números e o
            gráfico responde.
          </p>
          <div className="actions">
            <Link className="btn primary large" to={`/m/${MODULES[0].slug}`}>
              Começar por vetores <Icon name="arrowRight" size={16} />
            </Link>
            <Link className="btn large" to="/laboratorio">
              Abrir o Laboratório
            </Link>
          </div>
        </div>
        <figure className="hero-demo">
          <Suspense fallback={<div className="hero-demo-graph" />}>
            <HeroDemo />
          </Suspense>
          <figcaption>Arraste os pontos.</figcaption>
        </figure>
      </section>

      <ul className="how">
        {HOW.map((h) => (
          <li key={h.title}>
            <span className="how-icon">
              <Icon name={h.icon} size={20} />
            </span>
            <span>
              <strong>{h.title}</strong>
              <span>{h.text}</span>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="section-title">Trilhas</h2>
      <div className="track-grid">
        {TRACKS.map((t) => {
          const mods = modulesOfTrack(t.id);
          return (
            <Link key={t.id} to={`/trilha/${t.id}`} className="card track-card" style={trackColor(t.color)}>
              <span className="track-card-head">
                <TrackIcon id={t.id} />
                <span className="track-letter">{t.letter}</span>
              </span>
              <h3>{t.title}</h3>
              <p>{t.summary}</p>
              <span className="track-ids">
                {mods.length} {mods.length === 1 ? "módulo" : "módulos"} · {mods.map((m) => m.id).join(" · ")}
              </span>
            </Link>
          );
        })}
      </div>

      <Link to="/laboratorio" className="lab-band">
        <span className="lab-band-icon">
          <Icon name="flask" size={26} />
        </span>
        <span className="lab-band-text">
          <strong>Laboratório livre</strong>
          <span>Digite funções, curvas, superfícies, pontos, vetores e matrizes e veja tudo em 2D ou 3D. Letras livres viram sliders.</span>
        </span>
        <span className="btn">
          Abrir o Laboratório <Icon name="arrowRight" size={16} />
        </span>
      </Link>
    </div>
  );
}
