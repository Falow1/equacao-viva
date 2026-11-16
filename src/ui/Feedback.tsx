import { Logo } from "./brand";

/** Tela de carregamento: logo pulsando devagar e texto. */
export function Loading({ text = "Carregando…" }: { text?: string }) {
  return (
    <div className="loading" role="status">
      <Logo size={40} className="pulse" />
      <span>{text}</span>
    </div>
  );
}

/** Esqueleto do módulo enquanto o código dele carrega, para a tela não pular. */
export function ModuleSkeleton() {
  return (
    <div className="module" role="status" aria-label="Carregando módulo">
      <div className="module-graph skeleton-graph">
        <Logo size={44} className="pulse" />
      </div>
      <aside className="module-panel">
        <div className="panel-head">
          <div className="sk sk-line short" />
          <div className="sk sk-title" />
          <div className="sk sk-line" />
        </div>
        <div className="panel-body">
          <div className="sk sk-block" />
          <div className="sk sk-block tall" />
          <div className="sk sk-block" />
        </div>
      </aside>
    </div>
  );
}
