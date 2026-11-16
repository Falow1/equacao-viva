import { Component, Suspense, type ReactNode } from "react";
import { Link, useParams } from "react-router";
import { moduleBySlug } from "../modules/registry";
import { ModuleMetaContext } from "../ui/ModuleLayout";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  render() {
    if (this.state.error)
      return (
        <div className="page">
          <h1>Algo deu errado neste módulo</h1>
          <p className="muted">{this.state.error.message}</p>
          <p>
            <a href={window.location.href.split("?")[0]} onClick={() => setTimeout(() => window.location.reload(), 0)}>Recarregar com os valores iniciais</a>
          </p>
        </div>
      );
    return this.props.children;
  }
}

export function ModulePage() {
  const { slug = "" } = useParams();
  const meta = moduleBySlug(slug);
  if (!meta)
    return (
      <div className="page">
        <h1>Módulo não encontrado</h1>
        <p><Link to="/">Voltar para o início</Link></p>
      </div>
    );
  const C = meta.component;
  return (
    <ModuleMetaContext.Provider value={meta}>
      <ErrorBoundary key={slug}>
        <Suspense fallback={<div className="page muted">Carregando módulo…</div>}>
          <C key={slug} />
        </Suspense>
      </ErrorBoundary>
    </ModuleMetaContext.Provider>
  );
}
