# Melhorias de interface e identidade

Documento de trabalho para quem for implementar. Complementa o `PLANEJAMENTO.md`: lá está **o que** o site faz; aqui está **como ele deve ficar** depois de uma passada de acabamento visual. Nada aqui muda a matemática nem o conteúdo dos módulos.

## 0. Como usar este documento

- Faça na ordem das seções 2 → 8. Cada seção vira **um commit** em português.
- Depois de cada seção rode `npx tsc --noEmit`, `npm test` (57 testes têm que continuar passando) e `npm run build`.
- Confira no navegador em 1440 px, 1000 px e 375 px, nos temas claro e escuro. Sem rolagem horizontal em nenhum deles.
- Onde o texto diz **"perguntar ao dono"**, pare e pergunte; não invente nomes de pessoas, professor ou curso.

### Restrições que continuam valendo

- **Não publicar** o site nem criar repositório remoto sem pedido explícito do dono.
- Não mover a pasta do projeto. Sem backend, login ou analytics.
- Não adicionar bibliotecas, com **uma exceção autorizada aqui**: `@fontsource-variable/inter` (seção 2.1).
- Não mexer em `src/math/**`, nos testes, nem no conteúdo (textos de explicação, presets, fórmulas) dos módulos.
- Não trocar a paleta `--obj1…--obj6` nem as cores de fundo: elas já funcionam nos dois temas.
- Manter o estado na URL (`useUrlState`) e todos os links atuais (`/m/:slug`, `/trilha/:trackId`, `/laboratorio`, `/sobre`).

---

## 1. Diagnóstico

### O que está bom e deve ser preservado

- Layout de módulo (gráfico grande à esquerda, painel à direita; no celular o gráfico fica preso no topo). É a decisão certa.
- Cores por objeto iguais no gráfico e na fórmula (`\htmlClass{objN}`), nos dois temas.
- Tema escuro bem resolvido, tokens organizados em `src/styles/tokens.css`.
- Código organizado: um arquivo por módulo, componentes de painel reaproveitados (`Block`, `LiveEquation`, `Results`, `Presets`).
- Formatação PT-BR (vírgula decimal, `(a; b)`, frações).

### O que está fraco

| # | Problema | Onde |
|---|----------|------|
| 1 | Sem identidade: nome genérico ("GAAL Interativo"), logo que é só um risco com um ponto, página inicial sem nenhuma imagem. Para um site cujo assunto é gráfico, a home não mostra um gráfico sequer. | `App.tsx`, `Home.tsx`, `favicon.svg` |
| 2 | A fonte "Inter" está declarada mas **nunca é carregada**; o site cai em Segoe UI/system-ui e o peso 650 dos títulos não existe nessa fonte. | `tokens.css`, `index.html` |
| 3 | No celular (< 760 px) o menu some e não há substituto: não dá para chegar em Laboratório nem em Sobre a partir de um módulo. | `base.css` linha 155 |
| 4 | No painel do módulo, a **Explicação fica no fim** de uma rolagem longa (1 275 px na elipse, 1 931 px na diagonalização 3×3, em tela de 900 px). Quem abre o módulo não vê que existe explicação. Os botões Reiniciar / Copiar link também ficam lá embaixo. | `ModuleLayout.tsx` |
| 5 | Erro de texto: "TRILHA D · 1 módulos". | `Home.tsx` linha 24 |
| 6 | Classe `hint` usada em `E1.tsx` e `H3.tsx` não tem CSS. | `base.css` |
| 7 | Telas de carregamento e de "não encontrado" são texto solto no canto. | `App.tsx` 137, `ModulePage.tsx` 40, `TrackPage.tsx` |
| 8 | Fórmulas largas estouram o cartão (Hamilton–Cayley: 667 px de conteúdo em 463 px) e a única pista é a barra de rolagem padrão do sistema. | `.equation`, `.katex-display` |
| 9 | 58 `style={{…}}` espalhados em 25 arquivos; páginas `TrackPage` e `About` definem tamanho de título inline. | vários |
| 10 | No 3D do módulo H3 os rótulos "λ = 3" se repetem e se sobrepõem perto da origem. | `H3.tsx` |
| 11 | Falta rodapé com os créditos do trabalho (disciplina, instituição, autores). Para um trabalho de disciplina isso é obrigatório na prática. | `App.tsx` |
| 12 | Laboratório não oferece exemplos prontos; quem chega vê só campos de texto. | `Lab.tsx` |

---

## 2. Identidade: nome, logo, fonte

### 2.1 Fonte

1. `npm i @fontsource-variable/inter`
2. Em `src/main.tsx`, antes dos CSS do projeto: `import "@fontsource-variable/inter";`
3. Em `tokens.css`: `--font: "Inter Variable", "Inter", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;`
4. Em `base.css`, no `html, body`: `font-feature-settings: "cv11", "ss03"; text-rendering: optimizeLegibility;`

Critério: `document.fonts.check('15px "Inter Variable"')` devolve `true`; o build continua funcionando aberto de subpasta (`base: "./"`).

### 2.2 Nome

Nome **decidido pelo dono**: **Equação Viva**
Assinatura (linha de baixo): **Geometria Analítica e Álgebra Linear**

Por quê: descreve exatamente o que o site faz (a equação muda enquanto você mexe), é fácil de falar na apresentação e o código já usa esse conceito (`LiveEquation`). "GAAL" continua aparecendo na assinatura e nos textos, então o professor reconhece a disciplina.

Não é preciso perguntar de novo: aplicar esse nome direto.

Onde trocar:

| Arquivo | De | Para |
|---------|----|------|
| `index.html` `<title>` | GAAL Interativo | Equação Viva · Geometria Analítica e Álgebra Linear |
| `index.html` description | (atual) | Geometria Analítica e Álgebra Linear com gráficos interativos: arraste o gráfico e veja a equação mudar. |
| `App.tsx` marca | GAAL Interativo | Equação Viva |
| `About.tsx` título | Sobre o GAAL Interativo | Sobre o Equação Viva |
| `README.md` título | (atual) | Equação Viva |
| título da aba por página | fixo | `"<Título do módulo> · Equação Viva"` (via `document.title` em `ModulePage`, `TrackPage`, `Lab`, `About`) |

Novo texto do topo da home:

- Sobrelinha (pequena, maiúsculas): `GEOMETRIA ANALÍTICA E ÁLGEBRA LINEAR`
- Título: `Mexa no gráfico. Veja a equação mudar.`
- Parágrafo: `29 módulos interativos, de vetores a diagonalização. Arraste pontos e vetores e a fórmula acompanha; edite os números e o gráfico responde.` (o número 29 deve vir de `MODULES.length`, não fixo)
- Botões: `Começar por vetores` (primário) e `Abrir o Laboratório` (secundário) — iguais aos atuais.

### 2.3 Logo

Logo **decidida pelo dono** (opção A). Conceito: **paralelogramo de dois vetores**. Dois vetores saindo da origem (azul `--obj1` e vermelho `--obj2`, as mesmas cores dos módulos), o paralelogramo que eles geram (a área é o determinante) e um ponto vazado no vértice oposto, que é a "alça de arrastar". Junta geometria analítica (vetores), álgebra linear (base, determinante) e interatividade (o ponto).

Substituir o componente `Logo()` em `App.tsx` por este SVG (as cores vêm dos tokens, então troca sozinho no tema escuro):

```tsx
function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <polygon points="5,26 21,26 27,9 11,9" fill="var(--obj1)" opacity="0.16" />
      <path d="M21 26 L27 9 M11 9 L27 9" stroke="var(--obj-muted)" strokeWidth="1.4" strokeDasharray="2.4 2.4" strokeLinecap="round" fill="none" />
      <path d="M5 26 L17.5 26" stroke="var(--obj1)" strokeWidth="2.8" strokeLinecap="round" />
      <polygon points="17,22.6 22.6,26 17,29.4" fill="var(--obj1)" />
      <path d="M5 26 L9.2 14.1" stroke="var(--obj2)" strokeWidth="2.8" strokeLinecap="round" />
      <polygon points="12.5,14.9 6.1,12.6 11,9" fill="var(--obj2)" />
      <circle cx="27" cy="9" r="3" fill="var(--bg)" stroke="var(--text)" strokeWidth="1.8" />
      <circle cx="5" cy="26" r="2" fill="var(--text)" />
    </svg>
  );
}
```

Marca no cabeçalho: logo 28 px + "Equação Viva" em peso 700, `letter-spacing: -0.02em`, 16 px. Sem a assinatura no cabeçalho (ela aparece na home e no rodapé).

Novo `public/favicon.svg` (versão simplificada, legível em 16 px, com cores fixas porque favicon não lê tokens):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect x="1" y="1" width="30" height="30" rx="7" fill="#1f3f95"/><polygon points="7,24 20,24 25,10 12,10" fill="#fff" opacity=".22"/><path d="M7 24 L20 24" stroke="#fff" stroke-width="3" stroke-linecap="round"/><path d="M7 24 L12 10" stroke="#ffb49f" stroke-width="3" stroke-linecap="round"/><circle cx="25" cy="10" r="2.6" fill="#fff"/></svg>
```

Critério: logo nítida nos dois temas; favicon reconhecível na aba; nenhum texto "GAAL Interativo" sobrando (`grep -ri "GAAL Interativo" src index.html README.md` vazio).

---

## 3. Tokens e base visual

Em `src/styles/tokens.css`, acrescentar ao `:root` (e ao bloco escuro quando o valor mudar):

```css
--radius-sm: 6px;
--radius-pill: 999px;
--shadow-sm: 0 1px 2px rgba(20, 18, 14, 0.06), 0 1px 1px rgba(20, 18, 14, 0.04);
--shadow-md: 0 6px 20px rgba(20, 18, 14, 0.10), 0 2px 6px rgba(20, 18, 14, 0.06);
--on-accent: #ffffff;          /* escuro: #10131a */
--focus-ring: 0 0 0 3px var(--accent-soft);
```

No tema escuro, `--shadow-sm` e `--shadow-md` usam `rgba(0,0,0,0.35)` e `rgba(0,0,0,0.5)`.

Em `base.css`:

- Trocar valores soltos pelos tokens: `border-radius: 6px` → `var(--radius-sm)`, `99px` → `var(--radius-pill)`, a sombra de `.search-results` → `var(--shadow-md)`, `.btn.primary { color: var(--on-accent) }`.
- Tamanho de texto: `.page` passa a 16 px; o painel do módulo continua em 15 px.
- Títulos: `h1 { letter-spacing: -0.02em; text-wrap: balance; }`.
- Barras de rolagem discretas em tudo que rola por dentro (`.module-panel`, `.lab-list`, `.equation`, `.katex-display`, `.search-results`, `.result-row .rv`):

```css
scrollbar-width: thin;
scrollbar-color: var(--border-strong) transparent;
```

- Cartões clicáveis (`a.card`): no hover, `border-color: var(--accent); box-shadow: var(--shadow-sm);` e o mesmo em `:focus-visible`.
- Criar a classe que falta: `.hint { font-size: 13px; color: var(--text-2); margin-top: 4px; }`.
- Classes de página para acabar com estilos inline: `.page-title { font-size: clamp(26px, 3.4vw, 34px); margin-bottom: 6px; }`, `.page-lead { color: var(--text-2); font-size: 17px; max-width: 62ch; margin-bottom: 24px; }`, `.eyebrow { font-size: 12px; font-weight: 650; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); }`. Usar em `TrackPage`, `About`, `Home`.

Critério: `TrackPage.tsx` e `About.tsx` sem nenhum `style={{`. Nos módulos, os `style={{ marginTop: 8 }}` viram uma classe utilitária `.mt-8` (ou o `gap` de um `.stack`). Sobram apenas estilos realmente dinâmicos (cores calculadas, posições).

---

## 4. Página inicial

Arquivo: `src/pages/Home.tsx` (+ CSS em `base.css`).

### 4.1 Topo com gráfico de verdade

Duas colunas a partir de 900 px (texto à esquerda, demonstração à direita); empilhado abaixo disso, com a demonstração depois do texto.

A coluna da direita é um **mini módulo funcionando**, não uma imagem: um `Plane2D` de ~340 px de altura dentro de um cartão (`.hero-demo`, borda, `--radius-lg`, `--shadow-md`), com a reta por dois pontos arrastáveis e, embaixo, a equação viva `y = mx + b` com as mesmas cores. Reaproveitar `DraggablePoint`, `InfLine`, `Tex` e as funções de `src/math/lines.ts`. Estado local (`useState`), **sem** `useUrlState`, para não sujar a URL da home. Carregar com `lazy` para não pesar a primeira pintura; enquanto carrega, mostrar o cartão vazio com a mesma altura.

Legenda pequena sob o cartão: `Arraste os pontos.`

### 4.2 Faixa "como funciona"

Três itens em linha (empilham no celular), cada um com um ícone SVG de 20 px, título curto e uma frase:

1. **Arraste** — Pontos e vetores se movem com o mouse, o dedo ou o teclado.
2. **Edite** — Todo valor tem um campo; mude o número e o gráfico acompanha.
3. **Compartilhe** — "Copiar link" guarda o estado exato do que está na tela.

### 4.3 Cartões de trilha

- Grade fixa: 4 colunas ≥ 1100 px, 2 colunas entre 560 e 1099 px, 1 coluna abaixo. São 8 trilhas, então fecha em 2 linhas certinhas (hoje a grade automática deixa buracos).
- Cada cartão ganha um **ícone da trilha** (SVG inline de 40 px, traço de 2 px, na cor da trilha) e a letra num selo redondo. Cor por trilha, reaproveitando a paleta: A `--obj1`, B `--obj3`, C `--obj4`, D `--obj6`, E `--obj5`, F `--obj2`, G `--obj1`, H `--obj4`.
- Ícones (desenhar simples, mesmo estilo de traço): A vetor com seta; B reta cortando um plano; C elipse; D sela/paraboloide; E colchetes de matriz com pontos; F grade inclinada; G quadrado virando paralelogramo; H seta sobre uma reta (autovetor).
- Guardar cor e ícone no próprio `TRACKS` de `registry.ts` (campo `color`) e um componente `TrackIcon({ id })` em `src/ui/TrackIcon.tsx`.
- Corrigir o plural: `{n} {n === 1 ? "módulo" : "módulos"}`.
- Lista dos módulos dentro do cartão: logo abaixo do resumo, os IDs em linha (`A1 · A2 · A3`) em `--text-3`, para dar noção do tamanho.
- O cartão do Laboratório sai da grade e vira uma **faixa larga** abaixo dela (ícone, título, frase e botão "Abrir o Laboratório").

### 4.4 Rodapé (em todas as páginas de conteúdo, não nos módulos nem no Lab)

Componente `Footer` em `App.tsx`, mostrado nas rotas `/`, `/trilha/*`, `/sobre`:

```
Equação Viva · Trabalho da disciplina de Geometria Analítica e Álgebra Linear
<Instituição · Curso · Professor(a) · Autores · Ano>
```

**Perguntar ao dono** os dados da segunda linha (instituição, curso, professor, nomes dos autores, semestre). Guardar tudo num único arquivo `src/credits.ts` para ele editar fácil. A mesma informação aparece numa seção "Créditos" em `About.tsx`.

Critério da seção 4: a home mostra um gráfico arrastável sem rolar em 1440×900; grade de trilhas sem buracos; nenhum "1 módulos"; rodapé com créditos.

---

## 5. Navegação

Arquivo: `src/App.tsx` (+ CSS).

1. **Menu no celular.** Abaixo de 760 px, mostrar um botão de menu (ícone de três linhas, `aria-label="Menu"`, `aria-expanded`) que abre um painel abaixo do cabeçalho com: Trilhas (as 8, com letra e título), Laboratório, Sobre. Fecha ao escolher, ao apertar Esc e ao tocar fora. A busca vira um botão de lupa que expande o campo na largura toda.
2. **"Trilhas" vira menu.** No desktop, o item "Trilhas" abre um painel com as 8 trilhas em duas colunas (letra, título, nº de módulos). Clicar no próprio "Trilhas" continua indo para a home. Assim qualquer trilha fica a um clique de qualquer página.
3. **Busca.** Atalho `/` e `Ctrl+K` focam o campo; placeholder `Buscar módulo  /`; cada resultado mostra o selo da trilha com a cor dela; mensagem "Nenhum módulo encontrado" quando vazio.
4. **Página ativa.** Dentro de um módulo, marcar "Trilhas" como ativo (hoje nada fica marcado).
5. **Carregando.** Trocar o texto solto por um componente `Loading`: centralizado na área, logo pulsando devagar (respeitando `prefers-reduced-motion`) e "Carregando…" abaixo. No `ModulePage`, o fallback deve ter o mesmo esqueleto do módulo (área do gráfico vazia + painel com 3 blocos cinza) para a tela não pular.
6. **Não encontrado.** Uma página única `NotFound` (usada por `*`, trilha inexistente e módulo inexistente): logo, "Página não encontrada", campo de busca e botão "Ver trilhas".

Critério: em 375 px dá para ir de um módulo ao Laboratório e ao Sobre em até dois toques; Tab percorre o menu; Esc fecha.

---

## 6. Página de módulo

Arquivos: `src/ui/ModuleLayout.tsx`, `src/ui/controls.tsx`, `base.css`. Como todos os 29 módulos passam por `ModuleLayout`, quase tudo aqui se resolve **sem editar os módulos**.

### 6.1 Cabeçalho do painel com as ações

```
C · Cônicas   ● ○ ○ ○                         [↺] [🔗] [⌗]
Circunferência e elipse
A soma das distâncias aos focos é constante…
```

- As três ações (Reiniciar, Copiar link, Encaixar na grade) sobem do fim do painel para o canto direito do cabeçalho, como botões de ícone 34×34 com `aria-label` e `title`. Desenhar os ícones em SVG inline (seta circular, corrente, grade); o `🔗` acima é só ilustração — **não usar emoji**. "Copiar link" mostra "Link copiado" num balãozinho por 1,8 s.
- Ao lado da trilha, **bolinhas de progresso**: uma por módulo da trilha, a atual preenchida com a cor da trilha; cada uma é um link com `title` e `aria-label` do módulo. Substitui o texto "1 de 4".
- O cabeçalho fica **fixo no topo do painel** (`position: sticky; top: 0; background: var(--bg); z-index: 2`) no desktop.

### 6.2 Abas no topo: Explorar · Explicação · Passo a passo

Hoje: equação → controles → exemplos → resultados → (lá embaixo) abas Explicação / Passo a passo.

Passa a ser: logo abaixo do cabeçalho, uma barra de abas fixa.

- **Explorar** (padrão): os `children` do módulo, como hoje.
- **Explicação**: o `explain`.
- **Passo a passo**: o `steps`, só quando existir.

O gráfico continua visível à esquerda em qualquer aba, então dá para ler a explicação olhando para ele. A aba escolhida vai num parâmetro `aba` da URL **somente se** isso não exigir mudar `useUrlState`; se exigir, usar `useState` simples.

No celular, mesma barra de abas, presa logo abaixo do gráfico.

### 6.3 Equação em destaque

Em `LiveEquation` / `.equation`:

- A forma geral fica menor e apagada, com o rótulo "Forma geral"; a equação atual ganha o rótulo "Agora", tamanho `1.2em` e uma faixa de 3 px à esquerda em `--accent` (sem cantos arredondados nessa faixa).
- Quando o conteúdo estoura a largura: rolagem horizontal com barra fina **e** um degradê de 24 px na borda direita indicando que continua (`mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent)` aplicado só quando `scrollWidth > clientWidth`, medido com `ResizeObserver`).
- Variante `wide` (prop opcional) com `font-size: 0.9em` para fórmulas de matriz 3×3; aplicar no bloco Hamilton–Cayley do `H3.tsx` e onde mais estourar em 1440 px.

### 6.4 Exemplos como atalhos

`Presets`: mover para logo depois do bloco da equação (antes dos controles) e desenhar como pílulas (`border-radius: var(--radius-pill)`). São o jeito mais rápido de explorar e hoje ficam escondidos depois dos controles. Como a ordem é decidida em cada módulo, fazer assim: `ModuleLayout` aceita uma prop opcional `presets`; os módulos que hoje renderizam `<Presets …/>` no fim dos `children` passam a entregar pela prop. Mudança mecânica nos 29 arquivos, sem tocar em conteúdo.

### 6.5 Rodapé do painel

`pager`: dois cartões lado a lado, cada um com rótulo pequeno ("Anterior" / "Próximo") e o título do módulo embaixo, seta no canto. Largura igual, texto cortado com reticências.

### 6.6 Dica de primeira visita

Um selo flutuante no centro inferior do gráfico: "Arraste os pontos coloridos" (2D) ou "Arraste para girar" (3D). Some no primeiro `pointerdown` dentro do gráfico e não volta na mesma sessão (`sessionStorage`, com `try/catch`). `pointer-events: none`.

### 6.7 Rótulos no 3D

Em `H3.tsx`: quando um autoespaço tem dimensão 2, rotular só **um** dos vetores da base com "λ = …" (o outro fica sem rótulo). Verificar o mesmo padrão em `F2.tsx` e `G3.tsx`. Em `viz3d/index.tsx`, os números dos eixos passam a usar `--text-2` (hoje estão quase invisíveis) e 12 px.

Critério da seção 6: em 1440×900, ao abrir qualquer módulo vê-se sem rolar: título, ações, abas, equação e pelo menos o começo dos controles; a explicação está a um clique; nenhuma fórmula cortada sem indicação; os 29 módulos abrem sem erro no console.

---

## 7. Página de trilha, Sobre e Laboratório

**Trilha** (`TrackPage.tsx`)
- Cabeçalho com o ícone grande da trilha (56 px), sobrelinha "TRILHA B", título e resumo, usando `.eyebrow`, `.page-title`, `.page-lead`.
- Lista de módulos em grade de 2 colunas ≥ 800 px. Cada cartão: selo com o ID (`B1`) na cor da trilha, título, resumo e selo "2D"/"3D" alinhado à direita.
- Navegação entre trilhas nos dois sentidos (hoje só existe "Próxima"), no mesmo desenho do `pager` dos módulos.

**Sobre** (`About.tsx`)
- Mesmo cabeçalho de página; seções em cartões; "Como usar" com os mesmos três ícones da home; nova seção **Créditos** lendo de `src/credits.ts`.

**Laboratório** (`Lab.tsx`)
- Linha de exemplos em pílulas acima da lista, que troca conforme 2D/3D. 2D: `y = x^2`, `x^2 + y^2 = 9`, `(3cos(t); 2sin(2t))`, `y = a*x + b`. 3D: `z = x*y`, `x^2 + y^2 + z^2 = 9`, `z = a*x^2 - y^2`. Usar a sintaxe que o analisador (`src/math/parse.ts`) realmente aceita — conferir antes.
- Um bloco recolhível "Sintaxe" (`<details>`) com 5 ou 6 linhas: operadores, funções, como declarar ponto, vetor, curva paramétrica e parâmetro.
- Estado vazio: quando não há expressão, mostrar no lugar da lista "Digite uma expressão ou escolha um exemplo acima."
- Tirar os 9 estilos inline para classes.

---

## 8. Organização do CSS (só se sobrar tempo)

`base.css` tem 625 linhas num arquivo só. Dividir, sem mudar regra nenhuma, em:

```
src/styles/
  tokens.css      (já existe)
  base.css        reset, tipografia, utilitários
  layout.css      cabeçalho, menu, busca, rodapé, páginas
  components.css  botões, cartões, campos, abas, notas, resultados
  module.css      layout de módulo, painel, equação, sobreposições do gráfico
  lab.css         laboratório
```

Importar na mesma ordem em `main.tsx`. Critério: diferença visual zero.

---

## 9. Conferência final

- [ ] `npx tsc --noEmit` limpo, `npm test` com 57 testes passando, `npm run build` sem erro.
- [ ] Console do navegador sem erros em: home, uma trilha, um módulo 2D, um módulo 3D, Laboratório 2D e 3D, Sobre, página inexistente.
- [ ] Tema claro e escuro conferidos em 1440, 1000 e 375 px; sem rolagem horizontal.
- [ ] Navegação por teclado: Tab chega em menu, busca, abas, ações do módulo e pontos do gráfico; foco sempre visível.
- [ ] Build aberto de uma subpasta continua funcionando (fontes e favicon com caminho relativo).
- [ ] `README.md` atualizado com o nome novo.
- [ ] Nada publicado, nenhum remoto criado.

## 10. Fora de escopo

- Novos módulos (C5, D2 e afins).
- Mudar cores de objeto, fundos ou o motor 2D/3D.
- Fazer `useUrlState` reler a URL ao navegar dentro do mesmo módulo (limitação conhecida; fica para outra tarefa).
- Publicação.
