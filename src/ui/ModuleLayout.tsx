import { createContext, useContext, useState, type ReactNode } from "react";
import { Link } from "react-router";
import { MODULES, trackById, type ModuleMeta } from "../modules/registry";
import { SnapContext } from "../state/context";
import { Tabs } from "./controls";

export const ModuleMetaContext = createContext<ModuleMeta | null>(null);

/**
 * Página de módulo: gráfico à esquerda (em cima no celular) e painel à direita.
 * O painel recebe a equação viva, controles e resultados como children.
 */
export function ModuleLayout({
  graph,
  children,
  explain,
  steps,
  onReset,
  snapToggle = true,
}: {
  graph: ReactNode;
  children: ReactNode;
  explain: ReactNode;
  steps?: ReactNode;
  onReset: () => void;
  snapToggle?: boolean;
}) {
  const meta = useContext(ModuleMetaContext);
  const [snap, setSnap] = useState(true);
  const [copied, setCopied] = useState(false);
  const track = meta ? trackById(meta.track) : undefined;
  const sameTrack = meta ? MODULES.filter((x) => x.track === meta.track) : [];
  const idx = meta ? MODULES.indexOf(meta) : -1;
  const prev = idx > 0 ? MODULES[idx - 1] : undefined;
  const next = idx >= 0 && idx < MODULES.length - 1 ? MODULES[idx + 1] : undefined;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.prompt("Copie o link:", window.location.href);
    }
  };

  const tabs = [{ id: "exp", label: "Explicação", content: explain }];
  if (steps) tabs.push({ id: "steps", label: "Passo a passo", content: steps });

  return (
    <SnapContext.Provider value={{ snap, step: 0.5 }}>
      <div className="module">
        <div className="module-graph">{graph}</div>
        <aside className="module-panel" aria-label="Painel do módulo">
          {meta && (
            <header className="panel-head">
              <div className="crumb">
                {track && <Link to={`/trilha/${track.id}`}>{track.letter} · {track.title}</Link>} · {sameTrack.indexOf(meta) + 1} de {sameTrack.length}
              </div>
              <h1>{meta.title}</h1>
              <p className="summary">{meta.summary}</p>
            </header>
          )}
          {children}
          <Tabs tabs={tabs} />
          <div className="toolbar">
            <button type="button" className="btn small" onClick={onReset}>
              Reiniciar
            </button>
            <button type="button" className="btn small" onClick={copy}>
              {copied ? "Link copiado" : "Copiar link"}
            </button>
            {snapToggle && (
              <button type="button" className="btn small" aria-pressed={snap} onClick={() => setSnap((s) => !s)}>
                Encaixar na grade
              </button>
            )}
          </div>
          <nav className="pager" aria-label="Módulos vizinhos">
            {prev ? <Link to={`/m/${prev.slug}`}>← {prev.id} · {prev.title}</Link> : <span />}
            {next ? <Link to={`/m/${next.slug}`} style={{ textAlign: "right" }}>{next.id} · {next.title} →</Link> : <span />}
          </nav>
        </aside>
      </div>
    </SnapContext.Provider>
  );
}
