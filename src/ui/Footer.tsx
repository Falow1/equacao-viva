import { CREDITS, creditDetails } from "../credits";
import { Logo, SITE_NAME } from "./brand";

export function Footer() {
  const details = creditDetails();
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <Logo size={22} />
          <strong>{SITE_NAME}</strong>
        </div>
        <p>
          Trabalho da disciplina de {CREDITS.disciplina}
          {CREDITS.instituicao && ` · ${CREDITS.instituicao}`}
        </p>
        {details.length > 0 && <p className="footer-details">{details.join(" · ")}</p>}
      </div>
    </footer>
  );
}
