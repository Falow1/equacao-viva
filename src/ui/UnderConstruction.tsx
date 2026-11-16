import { useContext } from "react";
import { Link } from "react-router";
import { ModuleMetaContext } from "./ModuleLayout";

export function UnderConstruction() {
  const meta = useContext(ModuleMetaContext);
  return (
    <div className="page">
      <h1>{meta?.title ?? "Módulo"}</h1>
      <p className="muted">Em construção.</p>
      <p><Link to="/">Voltar às trilhas</Link></p>
    </div>
  );
}
