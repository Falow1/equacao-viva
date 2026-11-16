import { Link } from "react-router";
import { CREDITS, creditDetails } from "../credits";
import { MODULES, TRACKS } from "../modules/registry";
import { Logo, SITE_NAME, SITE_TAGLINE, useTitle } from "../ui/brand";
import { Icon, type IconName } from "../ui/icons";

const USE: { icon: IconName; text: string }[] = [
  { icon: "drag", text: "Arraste os pontos coloridos. Cada objeto tem a mesma cor no gráfico e na fórmula." },
  { icon: "edit", text: "Todo ponto também tem um campo numérico no painel. Pelo teclado: Tab até um ponto e use as setas." },
  { icon: "search", text: "Roda do mouse ou pinça dá zoom; arrastar o fundo move a janela; “Enquadrar” volta à vista inicial." },
  { icon: "reset", text: "Nos módulos 3D, arraste para girar, use a roda para aproximar e os botões de vista para posições prontas." },
  { icon: "link", text: "“Copiar link” guarda o estado exato do módulo: quem abrir o link vê o mesmo gráfico." },
  { icon: "grid", text: "“Encaixar na grade” prende os pontos em múltiplos de 0,5. Desligue para valores livres." },
];

export function About() {
  useTitle("Sobre");
  const details = creditDetails();
  return (
    <div className="page about">
      <header className="about-head">
        <Logo size={56} />
        <div>
          <p className="eyebrow">{SITE_TAGLINE}</p>
          <h1 className="page-title">Sobre o {SITE_NAME}</h1>
          <p className="page-lead">
            Um site para estudar Geometria Analítica e Álgebra Linear vendo cada equação ao lado do seu gráfico. A ligação vale nos dois sentidos:
            mexer no gráfico muda a equação, e mexer na equação muda o gráfico. São {MODULES.length} módulos em {TRACKS.length} trilhas, mais um
            laboratório livre.
          </p>
        </div>
      </header>

      <section className="about-section">
        <h2>Como usar</h2>
        <ul className="use-list">
          {USE.map((u) => (
            <li key={u.icon}>
              <span className="how-icon">
                <Icon name={u.icon} size={18} />
              </span>
              <span>{u.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="about-grid">
        <section className="about-section">
          <h2>Convenções</h2>
          <ul className="plain-list">
            <li>Coordenadas são separadas por ponto e vírgula, como (1; 2), porque a vírgula é o separador decimal.</li>
            <li>No espaço, o eixo z aponta para cima.</li>
            <li>Valores racionais simples aparecem como fração; os demais com até duas casas decimais.</li>
          </ul>
        </section>
        <section className="about-section">
          <h2>Feito com</h2>
          <p>React, Mafs (gráficos 2D), Three.js e React Three Fiber (gráficos 3D), KaTeX (fórmulas) e math.js (expressões do Laboratório).</p>
          <p className="muted">Tudo roda no navegador, sem servidor, login ou coleta de dados.</p>
        </section>
      </div>

      <section className="about-section">
        <h2>Créditos</h2>
        <p>
          Trabalho da disciplina de {CREDITS.disciplina}
          {CREDITS.instituicao && ` · ${CREDITS.instituicao}`}.
        </p>
        {details.length > 0 && (
          <ul className="plain-list">
            {details.map((d) => (
              <li key={d}>{d}</li>
            ))}
          </ul>
        )}
      </section>

      <p>
        <Link to="/" className="btn">
          <Icon name="arrowLeft" size={16} /> Voltar às trilhas
        </Link>
      </p>
    </div>
  );
}
