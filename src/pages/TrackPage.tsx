import { Link, useParams } from "react-router";
import { TRACKS, modulesOfTrack, trackById } from "../modules/registry";

export function TrackPage() {
  const { trackId = "" } = useParams();
  const track = trackById(trackId);
  if (!track)
    return (
      <div className="page">
        <h1>Trilha não encontrada</h1>
        <p><Link to="/">Voltar para o início</Link></p>
      </div>
    );
  const mods = modulesOfTrack(track.id);
  const i = TRACKS.indexOf(track);
  const next = TRACKS[i + 1];
  return (
    <div className="page">
      <p className="muted" style={{ marginBottom: 6 }}><Link to="/">Trilhas</Link> · Trilha {track.letter}</p>
      <h1 style={{ fontSize: 30, marginBottom: 6 }}>{track.title}</h1>
      <p style={{ color: "var(--text-2)", marginBottom: 22 }}>{track.summary}</p>
      <ul className="module-list">
        {mods.map((m) => (
          <li key={m.id}>
            <Link to={`/m/${m.slug}`} className="card">
              <span className="id">{m.id}</span>
              <span>
                <h3 style={{ display: "inline" }}>{m.title}</h3>
                <span className="badge">{m.dimension.toUpperCase()}</span>
                <p style={{ marginTop: 4 }}>{m.summary}</p>
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {next && (
        <p style={{ marginTop: 24 }}>
          Próxima trilha: <Link to={`/trilha/${next.id}`}>{next.letter} · {next.title}</Link>
        </p>
      )}
    </div>
  );
}
