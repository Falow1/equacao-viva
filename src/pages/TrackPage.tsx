import { Link, useParams } from "react-router";
import { TRACKS, modulesOfTrack, trackById } from "../modules/registry";
import { trackColor, useTitle } from "../ui/brand";
import { Icon, TrackIcon } from "../ui/icons";
import { NotFound } from "./NotFound";

export function TrackPage() {
  const { trackId = "" } = useParams();
  const track = trackById(trackId);
  useTitle(track ? `Trilha ${track.letter} · ${track.title}` : null);
  if (!track) return <NotFound what="Trilha" />;
  const mods = modulesOfTrack(track.id);
  const i = TRACKS.indexOf(track);
  const prev = TRACKS[i - 1];
  const next = TRACKS[i + 1];
  return (
    <div className="page track-page" style={trackColor(track.color)}>
      <nav className="crumb" aria-label="Você está em">
        <Link to="/">Trilhas</Link> <span aria-hidden="true">/</span> Trilha {track.letter}
      </nav>
      <header className="track-head">
        <span className="track-head-icon">
          <TrackIcon id={track.id} size={56} />
        </span>
        <div>
          <p className="eyebrow">
            Trilha {track.letter} · {mods.length} {mods.length === 1 ? "módulo" : "módulos"}
          </p>
          <h1 className="page-title">{track.title}</h1>
          <p className="page-lead">{track.summary}</p>
        </div>
      </header>
      <ul className="module-grid">
        {mods.map((m) => (
          <li key={m.id}>
            <Link to={`/m/${m.slug}`} className="card module-card">
              <span className="module-card-top">
                <span className="chip">{m.id}</span>
                <span className="badge">{m.dimension.toUpperCase()}</span>
              </span>
              <h3>{m.title}</h3>
              <p>{m.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
      <nav className="pager" aria-label="Trilhas vizinhas">
        {prev ? (
          <Link to={`/trilha/${prev.id}`} className="pager-card prev">
            <small>
              <Icon name="arrowLeft" size={14} /> Trilha anterior
            </small>
            <span>
              {prev.letter} · {prev.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={`/trilha/${next.id}`} className="pager-card next">
            <small>
              Próxima trilha <Icon name="arrowRight" size={14} />
            </small>
            <span>
              {next.letter} · {next.title}
            </span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </div>
  );
}
