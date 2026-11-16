import { Link } from "react-router";
import { Logo, useTitle } from "../ui/brand";
import { Search } from "../ui/Header";

/** Página única para rota, trilha ou módulo inexistente. */
export function NotFound({ what = "Página" }: { what?: "Página" | "Trilha" | "Módulo" }) {
  const title = `${what} não encontrad${what === "Módulo" ? "o" : "a"}`;
  useTitle(title);
  return (
    <div className="page not-found">
      <Logo size={56} />
      <h1 className="page-title">{title}</h1>
      <p className="page-lead">O endereço pode estar errado ou o conteúdo mudou de lugar. Procure um módulo pelo nome ou volte para as trilhas.</p>
      <Search inline />
      <Link to="/" className="btn primary">
        Ver trilhas
      </Link>
    </div>
  );
}
