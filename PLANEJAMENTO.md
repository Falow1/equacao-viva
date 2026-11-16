# Planejamento — Site interativo de Geometria Analítica e Álgebra Linear

Este documento é a especificação completa para implementar o site. Ele é autossuficiente: quem for implementar não precisa de nenhum outro contexto.

## 1. Objetivo

Um site em português (PT-BR) em que cada equação de Geometria Analítica e Álgebra Linear aparece ao lado do seu gráfico interativo. O estudante mexe no gráfico (arrasta pontos e vetores) e a equação muda; edita a equação (números, sliders) e o gráfico muda. A ligação nos dois sentidos é o requisito central do produto.

**Público:** estudantes de graduação cursando GAAL (Geometria Analítica e Álgebra Linear) e professores que queiram projetar as demonstrações em aula.

**Fora do escopo:** contas de usuário, backend, banco de dados, exercícios com nota, CAS simbólico completo.

## 2. Decisões já tomadas

| Tema | Decisão |
|---|---|
| Linguagem | TypeScript (modo `strict`) |
| Framework | React + Vite |
| Gráficos 2D | Mafs (plano cartesiano, pontos arrastáveis, vetores, curvas paramétricas) + plotador implícito próprio (marching squares) |
| Gráficos 3D | Three.js via `@react-three/fiber` + `@react-three/drei` (OrbitControls) |
| Fórmulas | KaTeX |
| Parser de expressões | math.js (só no Laboratório livre e em campos de equação digitada) |
| Roteamento | `react-router` com `HashRouter` (funciona em hospedagem estática sem configuração) |
| Estilo | CSS puro com variáveis (tokens) em `:root`, tema claro e escuro; sem framework de CSS |
| Estado | Estado local do React por módulo + sincronização com a URL; sem biblioteca global de estado |
| Testes | Vitest para o núcleo matemático |
| Hospedagem | Build estático (`vite build`, `base: './'`), publicável em GitHub Pages, Netlify ou Vercel |
| Idioma | Toda a interface e os textos em PT-BR; código (nomes de variáveis e funções) em inglês |

Ambiente verificado na máquina: Node 24.22, npm 11.19, git 2.45, Windows 11. A pasta do projeto está vazia e ainda não é um repositório git.

**Atenção:** a pasta fica dentro do OneDrive. A sincronização de `node_modules` pelo OneDrive deixa o `npm install` lento e pode travar arquivos. Se isso acontecer, pausar a sincronização do OneDrive durante a instalação. Não mover o projeto de pasta sem perguntar ao dono.

Ao instalar, usar as versões estáveis mais recentes e conferir que a versão do Mafs e do react-three-fiber aceitam a versão do React instalada. Se houver conflito de peer dependency, fixar o React na maior versão aceita pelas duas bibliotecas, em vez de usar `--force`.

## 3. Princípios de interação

Valem para todos os módulos.

1. **Ligação nos dois sentidos.** Todo objeto do gráfico que tem parâmetro na equação pode ser manipulado pelos dois lados.
2. **Cor consistente.** Cada objeto tem uma cor, e a mesma cor aparece no gráfico e no termo correspondente da fórmula (`\textcolor` no KaTeX). A paleta tem no máximo 6 cores de objeto, com contraste suficiente nos dois temas.
3. **Equação viva.** A fórmula geral aparece em cima (com letras) e logo abaixo a mesma fórmula com os valores atuais substituídos.
4. **Números legíveis.** Valores racionais simples aparecem como fração (1/2, −3/4); os demais com 2 casas decimais. Nunca mostrar `-0`, `1x`, `+ -3` ou `0y`: a formatação de polinômios e equações lineares passa por uma função única que limpa esses casos.
5. **Encaixe na grade.** Arrastar encaixa em múltiplos de 0,5 por padrão; um botão desliga o encaixe.
6. **Exemplos prontos.** Cada módulo tem de 3 a 6 exemplos em botões, e pelo menos um deles é caso degenerado ou de borda (retas paralelas, matriz singular, vetor nulo, cônica degenerada).
7. **Casos de borda explicados.** Quando o estado é degenerado, o painel diz o que aconteceu em uma frase ("As retas são paralelas: o sistema não tem solução"), em vez de mostrar `NaN`, `Infinity` ou um gráfico vazio.
8. **Reiniciar e compartilhar.** Todo módulo tem "Reiniciar" e "Copiar link"; o link reproduz o estado exato.
9. **Texto curto.** A explicação de cada módulo cabe em 3 a 6 frases. O gráfico é o conteúdo principal.

## 4. Estrutura do site

### 4.1 Páginas

| Rota | Página |
|---|---|
| `#/` | Início: apresentação em uma frase, as 8 trilhas em cartões, atalho para o Laboratório |
| `#/trilha/:trilhaId` | Lista dos módulos da trilha, em ordem, com resumo de uma linha |
| `#/m/:slug` | Página de módulo (ver 4.2) |
| `#/laboratorio` | Laboratório livre 2D e 3D (ver 6.9) |
| `#/sobre` | O que é o site, como usar, créditos das bibliotecas |

Navegação: barra superior com logo, menu de trilhas, busca por título de módulo e botão de tema. Dentro de um módulo, botões "anterior" e "próximo" seguem a ordem da trilha.

### 4.2 Anatomia de uma página de módulo

Desktop (largura ≥ 1000 px): gráfico à esquerda ocupando cerca de 62% da largura e toda a altura útil; painel à direita com rolagem própria.

Celular: gráfico em cima com altura de 55% da tela e fixo ao rolar; painel embaixo.

O painel tem, nesta ordem:

1. Título e resumo de uma linha.
2. **Equação viva** (fórmula geral + fórmula com valores).
3. **Controles**: sliders, campos numéricos, seletores, botões de exemplo.
4. **Resultados**: valores calculados (norma, ângulo, determinante, classificação etc.).
5. **Abas** "Explicação" e "Passo a passo" (a segunda só quando o módulo tem cálculo em etapas).
6. Reiniciar, Copiar link, Encaixar na grade.

### 4.3 Estrutura de pastas

```
src/
  main.tsx, App.tsx, routes.tsx
  styles/            tokens.css, base.css
  math/              núcleo matemático puro, sem React (ver seção 5)
  viz2d/             Plane2D, DraggablePoint, VectorArrow, LineThroughPoints,
                     ImplicitCurve, TransformedGrid, AngleArc, RegionFill
  viz3d/             Scene3D, Axes3D, Vector3D, Line3D, PlaneMesh,
                     ParametricSurface, ImplicitSurface, Label3D
  ui/                Tex, LiveEquation, Slider, NumberField, MatrixInput,
                     PresetButtons, ResultRow, Tabs, StepList, ModuleLayout
  state/             useUrlState.ts
  modules/           um arquivo ou pasta por módulo (a1-vetores-plano/, ...)
  modules/registry.ts
  pages/             Home, Track, ModulePage, Lab, About
tests/               espelha src/math
```

`registry.ts` é a única fonte de verdade sobre os módulos:

```ts
interface ModuleMeta {
  id: string;            // "A1"
  slug: string;          // "vetores-no-plano"
  title: string;
  track: TrackId;        // "vetores" | "retas-planos" | ...
  dimension: "2d" | "3d";
  summary: string;       // uma linha
  prerequisites: string[]; // ids
  component: React.LazyExoticComponent<React.ComponentType>;
}
```

Cada módulo é carregado sob demanda (`React.lazy`), e o Three.js só entra no pacote dos módulos 3D.

### 4.4 Estado na URL

`useUrlState(schema, defaults)` guarda o estado do módulo no trecho de query do hash (`#/m/vetores-no-plano?u=2,1&v=-1,3`). Números com no máximo 3 casas decimais. Valores inválidos ou ausentes voltam ao padrão sem erro. A atualização usa `history.replaceState` com debounce de 200 ms para não poluir o histórico durante o arraste.

## 5. Núcleo matemático (`src/math`)

Funções puras, sem dependência de React, com testes. Vetores e matrizes pequenos são arrays simples (`number[]`, `number[][]`).

| Arquivo | Conteúdo |
|---|---|
| `tolerance.ts` | `EPS = 1e-9`, `isZero`, `approxEq` (tolerância relativa e absoluta) |
| `vec.ts` | soma, subtração, escalar, norma, normalizar, produto escalar, vetorial, misto, ângulo, projeção, rejeição |
| `mat.ts` | produto, transposta, determinante (2×2, 3×3, n×n), inversa, posto, traço |
| `rref.ts` | eliminação de Gauss e Gauss–Jordan devolvendo a lista de passos (operação elementar + matriz resultante); aritmética em frações quando a entrada é racional |
| `fraction.ts` | tipo racional, simplificação, `toFraction(x, maxDen)` para exibição |
| `linsys.ts` | classificação do sistema (determinado, indeterminado, impossível), solução geral parametrizada, núcleo, base da imagem |
| `eigen.ts` | autovalores e autovetores de 2×2 geral (reais, repetidos, complexos) e de 3×3 simétrica; polinômio característico |
| `lines.ts` | reta 2D: conversão entre formas geral, reduzida, paramétrica e segmentária; interseção; ângulo; distância ponto–reta |
| `space.ts` | reta e plano em 3D: conversões, interseções reta×reta, reta×plano, plano×plano, três planos; distâncias; classificação da posição relativa (inclui retas reversas) |
| `conics.ts` | classificação de `Ax²+Bxy+Cy²+Dx+Ey+F=0` pelos invariantes; centro, ângulo de rotação, forma canônica, semieixos, focos, vértices, diretrizes, assíntotas, excentricidade; todos os casos degenerados |
| `quadrics.ts` | classificação de quádricas pela assinatura da forma quadrática; parametrização das formas canônicas |
| `orthogonal.ts` | Gram–Schmidt com passos, projeção em subespaço, mínimos quadrados (equações normais) |
| `svd2.ts` | SVD de matriz 2×2 (só se o módulo H5 for feito) |
| `implicit2d.ts` | marching squares: de `F(x,y)` e de uma janela para lista de segmentos, com interpolação linear nas arestas |
| `implicit3d.ts` | marching cubes: de `F(x,y,z)` e de uma caixa para malha de triângulos |
| `parse.ts` | invólucro do math.js: compila expressão em função, valida variáveis permitidas, devolve erro legível em português |
| `format.ts` | número → texto/LaTeX; equação linear e polinômio → LaTeX limpo (regra 4 da seção 3) |

**Testes obrigatórios** (tabelas de casos no Vitest):

- `conics`: circunferência, elipse rotacionada, parábola rotacionada, hipérbole, par de retas concorrentes, par de paralelas, reta dupla, ponto, conjunto vazio.
- `space`: retas concorrentes, paralelas, coincidentes, reversas; reta contida em plano; três planos nos 8 arranjos clássicos.
- `rref` e `linsys`: sistemas determinado, indeterminado e impossível; matriz com linha nula; necessidade de troca de linhas.
- `eigen`: autovalores reais distintos, repetido com 2 autovetores, repetido defectivo, complexos.
- `format`: coeficientes 0, 1, −1, frações, sinal do primeiro termo.

## 6. Módulos

25 módulos em 8 trilhas, mais o Laboratório. Para cada um: o que se vê, o que se manipula, o que o painel mostra. Itens marcados **(opcional)** só entram depois de todo o resto estar pronto.

### 6.1 Trilha A — Vetores

**A1 · Vetores no plano** (2D). Vetores `u` e `v` com pontas arrastáveis; escalares `α` e `β` em sliders. Mostra `u+v` pela regra do paralelogramo, `u−v`, e `αu+βv`. Painel: coordenadas, normas, a soma componente a componente.

**A2 · Produto escalar, ângulo e projeção** (2D). `u` e `v` arrastáveis. Mostra o arco do ângulo, a projeção de `u` sobre `v` e a componente ortogonal. Painel: `u·v`, `cos θ`, `θ` em graus, `proj_v u`. Destaca quando `u·v = 0` (ortogonais). Caso de borda: `v = 0`.

**A3 · Vetores no espaço, produto vetorial e misto** (3D). `u`, `v`, `w` editáveis por campos numéricos e sliders. Mostra `u×v` perpendicular ao paralelogramo de `u` e `v`, e o paralelepípedo de `u`, `v`, `w`. Painel: determinante simbólico do produto vetorial, área, produto misto, volume. Caso de borda: vetores coplanares (volume 0).

### 6.2 Trilha B — Retas e planos

**B1 · Equações da reta no plano** (2D). Dois pontos arrastáveis definem a reta. Painel mostra ao mesmo tempo as formas geral, reduzida, paramétrica e segmentária, além do vetor diretor e do vetor normal desenhados. Também dá para editar `a, b, c` ou `m, n` e o gráfico acompanha. Caso de borda: reta vertical (sem forma reduzida) e reta pela origem (sem forma segmentária).

**B2 · Duas retas e um ponto** (2D). Duas retas e um ponto `P` arrastável. Mostra a interseção, o ângulo entre as retas e o segmento perpendicular de `P` a uma delas. Painel: posição relativa (concorrentes, paralelas, coincidentes), ângulo, distância com a fórmula `|ax₀+by₀+c|/√(a²+b²)` preenchida.

**B3 · Reta no espaço** (3D). Ponto `A` e vetor diretor `d`; parâmetro `t` em slider movendo um ponto sobre a reta. Painel: formas vetorial, paramétrica e simétrica. Caso de borda: componente nula do diretor (forma simétrica muda).

**B4 · Plano no espaço** (3D). Três modos de entrada: equação geral `ax+by+cz=d`; ponto e normal; três pontos. Mostra o plano, o vetor normal e os interceptos com os eixos. Painel: as formas geral, vetorial e paramétrica. Caso de borda: três pontos colineares.

**B5 · Posições relativas e distâncias no espaço** (3D). Seletor de cenário: reta×reta, reta×plano, plano×plano, ponto×plano, ponto×reta. Mostra a interseção (ponto ou reta) ou o segmento de menor distância. Painel: classificação e o cálculo da distância. Exemplos incluem retas reversas.

### 6.3 Trilha C — Cônicas

**C1 · Circunferência e elipse** (2D). Centro arrastável, semieixos `a` e `b` em sliders. Mostra focos, vértices e um ponto `P` arrastável sobre a curva com os segmentos até os focos e a soma `d₁+d₂ = 2a`. Painel: equação canônica, equação geral expandida, excentricidade.

**C2 · Hipérbole** (2D). Mesmo esquema: focos, vértices, assíntotas, retângulo fundamental, ponto `P` com `|d₁−d₂| = 2a`. Alterna eixo real horizontal e vertical.

**C3 · Parábola** (2D). Vértice arrastável, parâmetro `p` em slider, quatro orientações. Mostra foco, diretriz e ponto `P` com as duas distâncias iguais.

**C4 · Equação geral do 2º grau** (2D). Seis sliders ou campos `A, B, C, D, E, F`. Curva desenhada pelo plotador implícito. Painel: discriminante `B²−4AC`, classificação, ângulo de rotação, centro, e a forma canônica. Botão "Girar e transladar os eixos" anima os eixos novos `x'y'` até a posição canônica. Exemplos cobrem todos os casos degenerados.

**C5 · Definição unificada por excentricidade (opcional)** (2D). Um foco, uma diretriz e slider de `e`: a curva passa de elipse a parábola a hipérbole.

### 6.4 Trilha D — Quádricas

**D1 · Galeria das quádricas** (3D). Seletor: elipsoide, hiperboloide de uma folha, de duas folhas, cone, paraboloide elíptico, paraboloide hiperbólico, cilindros elíptico, hiperbólico e parabólico. Sliders `a, b, c`. Um plano de corte móvel (`x=k`, `y=k` ou `z=k`) mostra o traço, e um quadro 2D pequeno ao lado desenha esse traço como cônica com o nome dela.

**D2 · Quádrica geral e eixos principais (opcional)** (3D). Entrada da matriz simétrica 3×3 e termos lineares; classificação por autovalores; desenho por marching cubes.

### 6.5 Trilha E — Sistemas lineares e matrizes

**E1 · Sistemas lineares: o que é a solução** (2D e 3D, com alternador). Sistema 2×2 como duas retas ou 3×3 como três planos. Coeficientes editáveis numa matriz aumentada. Painel: classificação (possível determinado, possível indeterminado, impossível), solução ou solução geral. Exemplos em 3D: ponto único, reta comum, planos paralelos, prisma triangular sem solução.

**E2 · Eliminação de Gauss passo a passo** (2D ou 3D conforme o tamanho). Matriz aumentada editável; botões "próximo passo" e "passo anterior". A cada operação elementar o gráfico redesenha as retas ou planos, e o ponto solução não sai do lugar. Painel: lista de operações (`L₂ ← L₂ − 3L₁`) com a matriz de cada etapa em frações.

**E3 · Determinante como área e volume** (2D, com alternador para 3D). Colunas da matriz como vetores arrastáveis; o paralelogramo é preenchido com uma cor quando o determinante é positivo e outra quando é negativo. Painel: cálculo do determinante e leitura geométrica (área, orientação, singular quando 0).

### 6.6 Trilha F — Espaços vetoriais

**F1 · Combinação linear e espaço gerado** (2D, com alternador para 3D). Vetores `v₁`, `v₂` arrastáveis, um alvo `w` arrastável. O site calcula e mostra `c₁` e `c₂` tais que `c₁v₁+c₂v₂ = w` e desenha o caminho. Quando `v₁` e `v₂` são paralelos, o espaço gerado vira uma reta destacada e o painel diz se `w` pertence a ela. Em 3D: dois vetores geram um plano, três geram o espaço ou um plano.

**F2 · Base e mudança de base** (2D). Base `B = {b₁, b₂}` arrastável; grade da base desenhada sobre a grade canônica. Um ponto arrastável mostra suas coordenadas nas duas bases. Painel: matriz de mudança de base e sua inversa, com o cálculo `[v]_B = P⁻¹v`.

**F3 · Núcleo, imagem e posto** (3D). Matriz 3×3 editável. Mostra o núcleo (ponto, reta, plano ou espaço) no domínio e a imagem no contradomínio, em duas cenas lado a lado. Painel: posto, nulidade e `posto + nulidade = 3`.

### 6.7 Trilha G — Transformações lineares

**G1 · Matriz como transformação do plano** (2D). Matriz 2×2 editável, e também arrastando as imagens de `e₁` e `e₂`. A grade inteira deforma junto, com uma figura de referência (a letra F) para evidenciar reflexão. Slider `t` de 0 a 1 interpola da identidade até a matriz. Exemplos: rotação, reflexão, cisalhamento, escala, projeção, singular. Painel: matriz, determinante, leitura das colunas como imagens da base.

**G2 · Composição e inversa** (2D). Duas matrizes `A` e `B`; mostra `B` depois `A` em duas etapas animadas e compara `AB` com `BA`. Botão "aplicar inversa" desfaz a transformação; quando a matriz é singular, o painel explica por que não existe inversa.

**G3 · Transformações no espaço** (3D). Matriz 3×3 aplicada a um cubo unitário e aos eixos. Exemplos: rotações em torno de cada eixo, reflexão num plano, projeção num plano, escala não uniforme.

### 6.8 Trilha H — Autovalores e ortogonalidade

**H1 · Autovalores e autovetores** (2D). Matriz 2×2 editável; vetor `v` arrastável e sua imagem `Av`. Quando `v` fica alinhado a um autovetor (dentro de uma tolerância angular), os dois vetores são destacados e o painel mostra `Av = λv`. As retas dos autoespaços ficam desenhadas. Painel: polinômio característico, autovalores, autovetores. Exemplos: reais distintos, repetido defectivo (cisalhamento), complexos (rotação, sem autovetor real, com explicação).

**H2 · Diagonalização e formas quadráticas** (2D). Matriz simétrica 2×2; mostra a curva de nível `xᵀAx = 1`, os eixos principais (autovetores) e `A = PDPᵀ`. Liga explicitamente ao módulo C4: o termo `Bxy` some nos eixos dos autovetores.

**H3 · Projeção ortogonal e Gram–Schmidt** (2D e 3D). Vetores de entrada arrastáveis; o processo avança passo a passo, mostrando a cada etapa a projeção subtraída e o vetor ortogonal resultante, e ao final a normalização.

**H4 · Mínimos quadrados** (2D). Pontos arrastáveis (clique adiciona, clique duplo remove); reta ajustada em tempo real com os resíduos verticais desenhados. Painel: equações normais `AᵀAx = Aᵀb` preenchidas e a soma dos quadrados dos resíduos. Alternador para ajuste por parábola.

**H5 · SVD: círculo vira elipse (opcional)** (2D). Matriz 2×2 decomposta em rotação, escala e rotação, animada em três etapas.

### 6.9 Laboratório livre

Lista de expressões à esquerda, gráfico à direita, com alternador 2D/3D.

Em 2D aceita, com detecção automática do tipo:

- explícita: `y = x^2 - 3`
- implícita: `x^2 + y^2 = 9`, `x*y = 1`
- paramétrica: `(cos(t), sin(2t))` com intervalo de `t`
- ponto: `(2, 3)`; vetor: `v = [2, 3]`
- matriz `M = [[1,2],[0,1]]` com opção de aplicar à grade

Em 3D aceita `z = f(x,y)`, `F(x,y,z) = 0`, curva paramétrica `(x(t), y(t), z(t))`, pontos e vetores.

Parâmetros livres (qualquer letra que não seja variável) viram sliders automaticamente. Cada expressão tem cor, botão de ocultar e de remover. Erros de sintaxe aparecem em português sob a linha, sem derrubar as outras expressões. A lista inteira vai para a URL.

## 7. Detalhes técnicos de visualização

**2D.** Zoom com a roda do mouse e gesto de pinça, arraste do fundo para mover a janela, botão "enquadrar". Rótulos dos eixos se adaptam ao zoom. O plotador implícito amostra uma grade de 160×160 sobre a janela visível e recalcula a cada mudança de janela ou parâmetro; durante o arraste pode cair para 80×80 e refinar ao soltar.

**3D.** Eixos coloridos com rótulos `x`, `y`, `z` e com **z para cima** (convenção dos livros brasileiros; o Three.js usa y para cima por padrão, então a cena precisa ser configurada). Grade no plano `xy`. Planos são retângulos semitransparentes recortados numa caixa; retas são recortadas na mesma caixa. Superfícies com material de dupla face e aramado leve por cima. Marching cubes com resolução 48³, rodando fora do quadro de renderização (em `useMemo` ou Web Worker se travar). Rótulos em HTML sobreposto. Botões de vista: isométrica, topo, frente, lado.

**Desempenho.** Meta de arraste fluido a 60 quadros por segundo num notebook comum. Cálculos pesados memorizados por parâmetros. Pacote inicial (sem módulos 3D) abaixo de 350 kB comprimido.

**Acessibilidade.** Todo ponto arrastável também se move pelo teclado (setas, com Shift para passo fino) e tem um campo numérico equivalente. Foco visível. Contraste AA nos dois temas. O significado nunca depende só da cor: objetos também têm rótulo.

**Responsividade.** Funciona de 360 px de largura para cima, sem rolagem horizontal. Alvos de toque de pelo menos 40 px.

## 8. Identidade visual

- Aparência de caderno de matemática limpo: fundo claro levemente quente, grade discreta, traços nítidos. Tema escuro equivalente.
- Tipografia: uma fonte sem serifa para a interface e a fonte do KaTeX para a matemática; números do painel com algarismos tabulares.
- Paleta de objetos (6 cores) definida como tokens, com versão para cada tema.
- Animações curtas (150 a 300 ms) em troca de exemplo e em transformações; respeitar `prefers-reduced-motion`.

## 9. Fases de entrega

Cada fase termina com o site funcionando, `npm run build` sem erros, `npm test` passando e um commit.

**Fase 0 — Fundações.** `git init`, `.gitignore`, projeto Vite + React + TS, dependências, tokens de estilo e temas, layout com barra superior, roteamento, `registry.ts` com os 25 módulos cadastrados (os não implementados mostram "em construção"), componentes `Tex`, `Slider`, `NumberField`, `MatrixInput`, `ModuleLayout`, `useUrlState`. Página inicial e de trilha prontas.

**Fase 1 — Núcleo matemático.** Todo o `src/math` da seção 5, exceto `implicit3d`, `quadrics` e `svd2`, com os testes obrigatórios.

**Fase 2 — Motor 2D e primeiros módulos.** Componentes de `viz2d`. Módulos A1, A2, B1, B2. É a fase que valida a ligação nos dois sentidos, a formatação de equações e o estado na URL; os padrões definidos aqui são reaproveitados em todos os outros módulos.

**Fase 3 — Cônicas.** `ImplicitCurve` e módulos C1, C2, C3, C4.

**Fase 4 — Álgebra linear em 2D.** `TransformedGrid` e módulos E1 (2×2), E2, E3, F1, F2, G1, G2, H1.

**Fase 5 — Motor 3D.** Componentes de `viz3d`, `quadrics`, `implicit3d`. Módulos A3, B3, B4, B5, D1, F3, G3, e os modos 3D de E1, E2, E3 e F1.

**Fase 6 — Ortogonalidade e Laboratório.** Módulos H2, H3, H4 e o Laboratório livre 2D e 3D.

**Fase 7 — Acabamento.** Revisão de responsividade e teclado em todos os módulos, busca, página Sobre, metadados e favicon, verificação de tamanho do pacote, `README.md` com instruções de execução e publicação. Só depois disso, os opcionais C5, D2, H5.

## 10. Critérios de pronto

Um módulo está pronto quando:

1. Arrastar no gráfico atualiza a equação e os resultados, e editar os controles atualiza o gráfico.
2. Todos os exemplos carregam, incluindo o de caso de borda, sem `NaN`, `Infinity` ou gráfico vazio sem explicação.
3. "Copiar link" aberto em outra aba reproduz o mesmo estado.
4. Funciona em 360 px de largura e por teclado.
5. O console do navegador fica sem erros e sem avisos do React durante o uso.
6. Foi aberto e manipulado no navegador de verdade (servidor de desenvolvimento), não só compilado.

O projeto está pronto quando todos os módulos não opcionais cumprem os itens acima, `npm run build` e `npm test` passam, e a pasta `dist/` abre corretamente servida de um subcaminho (teste com `vite preview`).

## 11. Riscos conhecidos

| Risco | Tratamento |
|---|---|
| Mafs não tem curva implícita | Plotador próprio em `implicit2d.ts`, desenhado como caminho SVG dentro do sistema de coordenadas do Mafs |
| Conflito de versões entre React, Mafs e react-three-fiber | Conferir peer dependencies na Fase 0 e fixar versões; não usar `--force` |
| Marching cubes lento ao arrastar slider | Resolução menor durante a interação, refinamento ao soltar; Web Worker se necessário |
| Formatação de equações com muitos casos especiais | Função única em `format.ts`, coberta por testes desde a Fase 1 |
| Cônicas quase degeneradas oscilando de classificação | Classificação com tolerância relativa; exemplos degenerados usam coeficientes exatos |
| Toque em 3D conflitando com a rolagem da página | `touch-action: none` no canvas e gráfico com altura fixa no celular |
| OneDrive sincronizando `node_modules` | Pausar a sincronização durante a instalação (ver seção 2) |

## 12. Instruções para quem implementa

- Seguir as fases na ordem. Não começar a Fase 5 antes de a Fase 2 estar sólida: os padrões de módulo nascem ali.
- Ao terminar cada módulo, abri-lo no navegador e conferir os critérios da seção 10 antes de passar ao próximo.
- Um commit por fase, no mínimo; mensagens em português.
- Não adicionar backend, autenticação, analytics, nem bibliotecas além das listadas, salvo necessidade concreta, que deve ser relatada.
- Não publicar o site nem criar repositório remoto sem pedido explícito do dono.
- Se uma decisão deste documento se mostrar inviável na prática, parar, explicar o problema e propor a alternativa, em vez de trocar em silêncio.
