# Equação Viva

**Geometria Analítica e Álgebra Linear** com gráficos interativos: mexa no gráfico e veja a equação mudar.

Site para estudar **Geometria Analítica e Álgebra Linear** mexendo nos gráficos. Cada módulo mostra uma equação ao lado do seu gráfico, e os dois
andam juntos: arrastar um ponto muda os números da equação, e editar um número move o desenho. O planejamento completo está em
[PLANEJAMENTO.md](PLANEJAMENTO.md).

Tudo roda no navegador, sem servidor, login ou coleta de dados.

## Conteúdo

| Trilha | Módulos |
| --- | --- |
| A · Vetores | A1 vetores no plano · A2 produto escalar e projeção · A3 produto vetorial e misto (3D) |
| B · Retas e planos | B1 reta no plano · B2 duas retas e distâncias · B3 reta no espaço · B4 plano no espaço · B5 posições relativas e distâncias no espaço |
| C · Cônicas | C1 elipse · C2 hipérbole · C3 parábola · C4 equação geral do 2º grau (rotação e translação) |
| D · Quádricas | D1 galeria das quádricas com plano de corte e traço |
| E · Sistemas e matrizes | E1 sistemas como retas e planos (Rouché–Capelli, Cramer) · E2 escalonamento passo a passo · E3 determinante como área e volume · E4 operações com matrizes e inversa por Gauss–Jordan |
| F · Espaços vetoriais | F1 combinação linear e espaço gerado · F2 subespaços, base e dimensão · F3 mudança de base · F4 núcleo, imagem e posto |
| G · Transformações lineares | G1 matriz de uma transformação · G2 composição e inversa · G3 transformações no espaço |
| H · Autovalores e ortogonalidade | H1 autovalores e autovetores · H2 diagonalização e formas quadráticas · H3 diagonalização 3×3, polinômio minimal e Hamilton–Cayley · H4 Gram–Schmidt · H5 mínimos quadrados |

Há também o **Laboratório livre** (2D e 3D), onde se digitam expressões como `y = a*x^2`, `x^2 + y^2 = 9`, `(cos(t), sin(2t))`,
`M = [[1,2],[0,1]]`, `z = x*y` ou `x^2 + y^2 - z^2 = 1`. Letras livres viram sliders.

O estado de cada módulo fica no endereço da página, então **Copiar link** guarda exatamente o que está na tela.

## Como rodar

Precisa de [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
npm install
```

```bash
npm run dev
```

Abra o endereço que aparecer (normalmente http://localhost:5173).

Outros comandos:

```bash
npm test
```

```bash
npm run typecheck
```

```bash
npm run build
```

```bash
npm run preview
```

`npm test` roda os testes do núcleo matemático (classificação de cônicas, sistemas, escalonamento, posições no espaço, autovalores etc.).
`npm run build` gera o site estático na pasta `dist/`, e `npm run preview` serve essa pasta para conferir.

## Como publicar

O build é estático e usa caminhos relativos (`base: "./"`) e rotas com `#`, então a pasta `dist/` funciona em qualquer hospedagem de arquivos,
inclusive dentro de uma subpasta (por exemplo GitHub Pages em `usuario.github.io/gaal/`), sem configuração de servidor. Basta enviar o conteúdo de
`dist/`.

## Estrutura

```
src/
  math/       núcleo matemático puro (vetores, matrizes, sistemas, cônicas, quádricas, formatação em pt-BR)
  viz2d/      componentes de gráfico 2D (sobre o Mafs)
  viz3d/      cena 3D (Three.js + React Three Fiber), com eixo z para cima
  modules/    um arquivo por módulo (A1.tsx … H4.tsx) e o registro em registry.ts
  pages/      página inicial, trilhas, módulo, laboratório, sobre e página não encontrada
  ui/         cabeçalho, rodapé, logo, ícones, controles, equação viva e layout dos módulos
  styles/     tokens (cores e medidas), base, componentes, páginas, módulo e laboratório
  state/      estado sincronizado com a URL
  credits.ts  créditos do trabalho (aparecem no rodapé e na página Sobre)
tests/        testes do núcleo matemático (Vitest)
```

Para mudar os créditos (curso, professor, autores, período), edite `src/credits.ts`; campos vazios não aparecem no site.

Convenções da notação: vírgula decimal, coordenadas separadas por ponto e vírgula, `(2; −1)`, e frações quando o número é uma fração simples.

## Tecnologias

React, TypeScript, Vite, fonte Inter, [Mafs](https://mafs.dev) (2D), [Three.js](https://threejs.org) com React Three Fiber (3D), [KaTeX](https://katex.org)
(equações) e [math.js](https://mathjs.org) (expressões do Laboratório).
