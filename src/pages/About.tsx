import { Link } from "react-router";

export function About() {
  return (
    <div className="page prose">
      <h1 style={{ fontSize: 30, marginBottom: 12 }}>Sobre o GAAL Interativo</h1>
      <p>
        Um site para estudar Geometria Analítica e Álgebra Linear vendo cada equação ao lado do seu gráfico. A ligação vale nos dois sentidos:
        mexer no gráfico muda a equação, e mexer na equação muda o gráfico.
      </p>
      <h2>Como usar</h2>
      <ul>
        <li>Arraste os pontos coloridos. Cada objeto tem a mesma cor no gráfico e na fórmula.</li>
        <li>Pelo teclado: dê Tab até um ponto e use as setas. Todo ponto também tem um campo numérico no painel.</li>
        <li>Roda do mouse ou pinça dá zoom; arrastar o fundo move a janela; “Enquadrar” volta à vista inicial.</li>
        <li>Nos módulos 3D, arraste para girar, use a roda para aproximar e os botões de vista para posições prontas.</li>
        <li>“Copiar link” guarda o estado exato do módulo: quem abrir o link vê o mesmo gráfico.</li>
        <li>“Encaixar na grade” prende os pontos em múltiplos de 0,5. Desligue para valores livres.</li>
      </ul>
      <h2>Convenções</h2>
      <ul>
        <li>Coordenadas são separadas por ponto e vírgula, como (1; 2), porque a vírgula é o separador decimal.</li>
        <li>No espaço, o eixo z aponta para cima.</li>
        <li>Valores racionais simples aparecem como fração; os demais com até duas casas decimais.</li>
      </ul>
      <h2>Feito com</h2>
      <p>
        React, Mafs (gráficos 2D), Three.js e React Three Fiber (gráficos 3D), KaTeX (fórmulas) e math.js (expressões do Laboratório).
      </p>
      <p><Link to="/">Voltar às trilhas</Link></p>
    </div>
  );
}
