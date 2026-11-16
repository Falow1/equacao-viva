import { Link } from "react-router";
import { MODULES, TRACKS, modulesOfTrack } from "../modules/registry";

export function Home() {
  return (
    <div className="page">
      <section className="hero">
        <h1>Geometria Analítica e Álgebra Linear, de mexer</h1>
        <p>
          Cada equação aparece ao lado do seu gráfico. Arraste pontos e vetores e veja a equação mudar; edite os números e veja o gráfico
          acompanhar.
        </p>
        <div className="actions">
          <Link className="btn primary" to={`/m/${MODULES[0].slug}`}>Começar por vetores</Link>
          <Link className="btn" to="/laboratorio">Abrir o Laboratório</Link>
        </div>
      </section>
      <h2 className="section-title">Trilhas</h2>
      <div className="track-grid">
        {TRACKS.map((t) => {
          const mods = modulesOfTrack(t.id);
          return (
            <Link key={t.id} to={`/trilha/${t.id}`} className="card">
              <span className="tag">TRILHA {t.letter} · {mods.length} módulos</span>
              <h3>{t.title}</h3>
              <p>{t.summary}</p>
            </Link>
          );
        })}
        <Link to="/laboratorio" className="card">
          <span className="tag">LIVRE</span>
          <h3>Laboratório</h3>
          <p>Digite equações, pontos, vetores e matrizes e veja em 2D ou 3D.</p>
        </Link>
      </div>
    </div>
  );
}
