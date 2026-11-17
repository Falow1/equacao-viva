# Plano: versão para celular e novos sliders

Documento de trabalho para quem for implementar. Complementa o `MELHORIAS-INTERFACE.md`.

## Resumo

- **Um site só.** Mesma URL, mesmo código, mesmos 29 módulos. Nada de site separado (`m.…`) nem de detectar o aparelho pelo "user agent". O layout muda por *media queries* (largura, altura, orientação e tipo de ponteiro). Um link copiado no computador abre no mesmo estado no celular, porque o estado já vai na URL.
- **No computador nada muda**, fora os sliders novos.
- **No celular a tela de módulo vira um "app"**: gráfico em cima, painel embaixo com rolagem própria, uma barra entre os dois que mostra a equação atual e serve de alça para redimensionar o gráfico.
- **Sliders redesenhados** em um único componente (`Slider`, usado 33 vezes em 17 arquivos), então a mudança vale para o site todo sem editar módulo por módulo.

## Situação (novembro de 2026)

Fases 1 a 5 implementadas, com as decisões recomendadas da seção 6: página sem rolagem com alça e barra de teclas acima do teclado. A Fase 6 (instalar e usar sem internet) ficou de fora.

| Parte | Onde está |
| --- | --- |
| Base de toque, áreas seguras, `hover` só com mouse | `styles/tokens.css`, `base.css`, `components.css`, `layout.css` |
| Slider novo (trilho com preenchimento a partir do zero, cor do objeto, bolha, botões − e +) | `ui/controls.tsx`, `ui/sliderGeometry.ts`, `tests/slider.test.ts` |
| Tela de módulo no celular (gráfico, barra da equação com alça, painel) | `ui/ModuleLayout.tsx`, `ui/GraphSplit.tsx`, `ui/eqPin.ts`, `styles/module.css` |
| Teclado virtual (`--vvh`, campo visível, barra de teclas) | `ui/viewport.ts`, `ui/KeyBar.tsx` |
| Laboratório, início e cabeçalho | `pages/Lab.tsx`, `pages/HeroDemo.tsx`, `styles/lab.css`, `layout.css` |
| 3D (`frameloop="demand"`, resolução menor em aparelho fraco, menu de vistas) | `viz3d/index.tsx` |

Conferido em emulação (375×812, 812×375 e 1366×768). Falta conferir em aparelho de verdade: teclado do iPhone, zoom ao focar, notch e arrastar pontos com o dedo (seção 5).

## 1. Como estava (medido no site, em emulação, antes das mudanças)

| # | Problema | Medida |
| --- | --- | --- |
| 1 | No celular em pé (375×812) o gráfico fica fixo com 55% da altura. | Gráfico 447 px; sobram ~265 px para o conteúdo. |
| 2 | Ao rolar até os sliders, a equação some da tela. Arrasta-se o slider sem ver a equação mudar, que é a ideia central do site. | Visto no C1 e no D1. |
| 3 | Celular deitado (812×375) fica inutilizável. | Gráfico 206 px; sobram **70 px** para o conteúdo. |
| 4 | Alvos de toque pequenos (o recomendado é 44 px). | 24 controles abaixo de 40 px só no C1: botões do cabeçalho 36, ícones 34, pílulas 32, campos 32, bolinhas de progresso 16×18. |
| 5 | Sliders são os nativos do navegador, só com a cor trocada. | Altura 28 px, bolinha ~16 px, 181 px de largura útil no celular, aparência diferente em cada navegador. |
| 6 | Campos com fonte de 14 px. | No iPhone, o Safari dá zoom sozinho ao focar campo com menos de 16 px. |
| 7 | Campo numérico usa o teclado decimal. | No iPhone esse teclado não tem o sinal de menos nem a barra: não dá para digitar `-3` nem `1/2`. |
| 8 | Com o teclado aberto, o gráfico fixo de 55% ocupa quase toda a área visível. | O campo em edição tende a ficar escondido. |
| 9 | Efeitos de `:hover` ficam "grudados" depois do toque. | Regras de hover sem `@media (hover: hover)`. |
| 10 | Os 4 botões de vista 3D ocupam uma linha inteira do gráfico. | Visto no D1 e no E2. |
| 11 | Sem tratamento de área segura (notch e barra de gestos). | `viewport` sem `viewport-fit=cover`. |

Os itens 6, 7, 8 e 11 dependem do aparelho de verdade: a emulação não mostra teclado, zoom do Safari nem notch. Precisam ser confirmados em um iPhone e em um Android antes e depois.

O que já está bom e deve ser mantido: não há rolagem horizontal em nenhuma tela, o menu e a busca do cabeçalho já funcionam no celular, o 3D já limita a resolução (`dpr={[1, 2]}`) e os módulos já carregam sob demanda.

## 2. Modos de layout

Definir uma vez, em comentário no topo de `src/styles/tokens.css`, e usar sempre os mesmos valores:

| Modo | Condição | Tela de módulo |
| --- | --- | --- |
| Computador | largura ≥ 1000 px | Como hoje: gráfico à esquerda, painel à direita. |
| Celular em pé | largura < 1000 px e altura ≥ 500 px | Gráfico em cima, barra da equação, painel embaixo. |
| Celular deitado | largura < 1000 px e altura < 500 px | Lado a lado: gráfico à esquerda, painel à direita, cabeçalho compacto. |

Tablet em pé (768–999 px) usa o modo "em pé". Tablet deitado (≥ 1000 px) usa o de computador.

Regras de toque usam `@media (pointer: coarse)`, não a largura: um notebook com tela de toque e janela estreita deve receber alvos grandes, e um celular com mouse não precisa.

Criar `src/ui/useLayoutMode.ts` (com `matchMedia`) devolvendo `"desktop" | "portrait" | "landscape"`, só para o que o CSS não resolve sozinho (alça, textos de dica).

## 3. Fases

### Fase 1 — Base de toque (CSS global, risco baixo)

1. `index.html`: `<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content">`. Não usar `user-scalable=no` (acessibilidade).
2. `tokens.css`: `--tap: 44px` e variáveis de área segura (`env(safe-area-inset-*)`).
3. Em `@media (pointer: coarse)`:
   - `.btn`, `.seg button`, `.icon-btn`, `select.select`: mínimo de 44 px.
   - `.pill`: 40 px de altura, `padding: 8px 14px`, espaço de 8 px entre elas.
   - `.num`, `input.expr`, `select`: 44 px de altura e **fonte de 16 px** (resolve o item 6).
   - `.module-tabs button`: `padding: 14px`.
   - `.dot`: área de toque 28×32 px, mantendo o ponto visual de 8 px.
   - Caixa de seleção: 22 px, com a etiqueta inteira clicável e 44 px de altura.
   - Bolinha de cor do Laboratório (`.swatch`): área de toque de 44 px.
4. Envolver toda regra `:hover` de `components.css`, `layout.css`, `module.css` e `lab.css` em `@media (hover: hover)`. Criar estados `:active` para o toque (fundo `--surface-2`).
5. `touch-action: manipulation` em `button, a, input, select, label` e `-webkit-tap-highlight-color: transparent`.
6. `-webkit-text-size-adjust: 100%` no `html`.
7. Área segura: cabeçalho com `padding-inline: max(16px, env(safe-area-inset-left))`; rodapé e fim do painel com `env(safe-area-inset-bottom)`.

**Pronto quando:** o script de medição (seção 5) não encontra nenhum controle com menos de 44 px no modo de toque, e o computador não muda um pixel.

### Fase 2 — Tela de módulo no celular (a parte principal)

Arquivos: `src/ui/ModuleLayout.tsx`, `src/styles/module.css`, `src/ui/controls.tsx` (`LiveEquation`).

**2.1 Estrutura em pé.** A página deixa de rolar. `.module` vira uma grade de três linhas com a altura da tela:

```css
@media (max-width: 999px) and (min-height: 500px) {
  .module {
    display: grid;
    grid-template-rows: var(--graph-h, 48%) auto minmax(0, 1fr);
    height: calc(var(--vvh, 100dvh) - var(--header-h));
    overflow: hidden;
    overscroll-behavior: contain;
  }
  .module-panel { display: flex; flex-direction: column; overflow: hidden; }
  .panel-body { overflow-y: auto; }
}
```

Sai o `position: sticky` do gráfico e das abas: não é mais necessário.

**2.2 Barra da equação (nova).** Entre o gráfico e o painel, sempre visível:

- Em cima, a alça: um traço de 36×4 px centralizado.
- Embaixo, a equação "Agora" do módulo, em fonte menor, com rolagem horizontal e degradê na borda (reaproveitar `useScrollFade`).
- Altura de 44 a 72 px, conforme a fórmula.
- De onde vem a equação: `ModuleLayout` cria um contexto; o primeiro `LiveEquation` da aba Explorar registra nele o seu `current`. Nova prop `pin?: boolean` em `LiveEquation` para escolher outro ou desligar. Fórmulas `wide` (matrizes 3×3, como no H3) não vão para a barra por padrão.
- Módulo sem `LiveEquation`: a barra mostra só a alça (28 px).
- No celular, o bloco "Equação" do painel mostra só a forma geral; a linha "Agora" fica na barra, para não repetir.

Resolve o item 2: a equação fica à vista em qualquer posição de rolagem e em qualquer tamanho de gráfico.

**2.3 Alça para redimensionar o gráfico.** Três posições: pequeno (30%), médio (48%, padrão) e grande (76%).

- Arrastar a barra segue o dedo (`setPointerCapture`); ao soltar, encaixa na posição mais próxima com transição de 180 ms (sem transição com `prefers-reduced-motion`).
- Tocar na barra alterna entre médio e grande.
- Acessibilidade: `role="separator"`, `aria-orientation="horizontal"`, `aria-valuenow`, foco por teclado e setas para cima e para baixo.
- Guardar a última posição em `sessionStorage` (`altura-grafico`).
- Conferir se o Mafs e o canvas 3D acompanham a mudança de tamanho sem piscar; atualizar a altura com `requestAnimationFrame`.

**2.4 Cabeçalho do painel compacto.** Uma linha com trilha, bolinhas e ações; título com 18 px; o resumo sai do cabeçalho e vira o primeiro parágrafo da aba Explicação. Ganha cerca de 60 px.

**2.5 Teclado virtual** (item 8).

- Novo `src/ui/useVisualViewport.ts`: escreve `--vvh` (altura visível) no `:root` a partir de `window.visualViewport`. No Android o `interactive-widget=resizes-content` já resolve; no iPhone é o `--vvh` que resolve.
- Com o teclado aberto (altura visível caiu mais de 150 px): gráfico vai para "pequeno" e o campo em foco recebe `scrollIntoView({ block: "center" })`. Ao fechar, volta à posição anterior.

**2.6 Celular deitado** (item 3).

```css
@media (max-width: 999px) and (max-height: 499px) {
  :root { --header-h: 44px; }
  .module { grid-template-columns: minmax(0, 1fr) minmax(300px, 46%); }
}
```

Gráfico à esquerda com a altura inteira; painel à direita com a barra da equação no topo (sem alça).

**2.7 Sobre o gráfico.**

- Vistas 3D (item 10): no celular, um botão só, "Vista: Isométrica", que abre um menu com as quatro (reaproveitar `useDismiss` do cabeçalho).
- "Enquadrar" vira botão de ícone de 44 px.
- Dica inicial com texto de toque: 2D "Arraste os pontos · pinça para zoom"; 3D "Um dedo gira · dois dedos movem e dão zoom".
- Conferir o tamanho da área de toque dos pontos arrastáveis do Mafs (mínimo de 44 px de diâmetro).

**Pronto quando:** em 375×812, arrastar qualquer slider de qualquer módulo mantém a equação visível; em 667×375 o painel tem pelo menos 250 px de altura útil; com o teclado aberto o campo em edição aparece.

### Fase 3 — Sliders novos

Arquivos: `src/ui/controls.tsx` (`Slider`), `src/styles/components.css`. Nenhum módulo precisa ser editado.

Continua sendo um `<input type="range">` de verdade (teclado, leitor de tela e toque vêm de graça), com a aparência toda refeita.

**3.1 Visual.**

| Parte | Especificação |
| --- | --- |
| Trilho | 6 px de altura, cantos redondos, fundo `--surface-3`. |
| Preenchimento | Na cor do slider. Se o intervalo cruza o zero (ex.: −5 a 5), preenche **do zero até a bolinha**, para os dois lados. Se não cruza, preenche da esquerda. |
| Marca do zero | Traço de 2×10 px em `--border-strong`, só quando o intervalo cruza o zero. |
| Bolinha | 22 px (28 px no toque), fundo `--surface`, borda de 2 px na cor do slider, `--shadow-sm`. |
| Hover | Halo de 6 px na cor do slider a 18% (só com `hover: hover`). |
| Arrastando | Bolinha 10% maior, halo de 9 px, cursor `grabbing`. |
| Foco por teclado | Anel de 3 px (`--focus-ring`). |
| Balão de valor | Enquanto arrasta, mostra o valor acima da bolinha (vírgula decimal, via `fmt`). No celular o dedo cobre a bolinha, então o balão é o que mostra o número. |
| Área de toque | Altura do campo: 28 px no mouse, 44 px no toque. O trilho continua com 6 px. |

**3.2 Cor ligada ao objeto.** O slider usa a cor do objeto que o parâmetro controla (`obj1`…`obj6`), seguindo a regra do site de "mesma cor no gráfico e na fórmula". Nova prop `color?: ObjColor`; se não vier, deduzir da `className` do rótulo quando ela já contém `objN`; senão, `--accent`.

**3.3 Estrutura.**

```tsx
<div className="slider" style={{ "--sl": cor, "--lo": lo, "--hi": hi }} data-dragging={arrastando}>
  <input type="range" … />
  <output aria-hidden="true">{fmt(value)}</output>
</div>
```

`lo` e `hi` são números de 0 a 1: o começo e o fim do preenchimento (`min(posição, zero)` e `max(posição, zero)`).

```css
.slider { --th: 22px; position: relative; height: 28px; }
.slider input {
  appearance: none; width: 100%; height: 100%; margin: 0;
  background: transparent; touch-action: pan-y;
}
.slider input::-webkit-slider-runnable-track {
  height: 6px; border-radius: 999px;
  background: linear-gradient(to right,
    var(--surface-3) 0 var(--a), var(--sl) var(--a) var(--b), var(--surface-3) var(--b) 100%);
}
.slider {
  /* o centro da bolinha anda de th/2 até 100% − th/2: o preenchimento usa a mesma conta */
  --a: calc(var(--th) / 2 + (100% - var(--th)) * var(--lo));
  --b: calc(var(--th) / 2 + (100% - var(--th)) * var(--hi));
}
.slider input::-webkit-slider-thumb {
  appearance: none; width: var(--th); height: var(--th);
  margin-top: calc((6px - var(--th)) / 2);
  border-radius: 50%; background: var(--surface); border: 2px solid var(--sl);
  box-shadow: var(--shadow-sm); transition: box-shadow .12s, transform .12s;
}
@media (pointer: coarse) { .slider { --th: 28px; height: 44px; } }
```

Repetir as regras de trilho e bolinha com `::-moz-range-track` e `::-moz-range-thumb` (Firefox). Conferir nos dois temas.

**3.4 Linha do controle.**

- Computador: uma linha, como hoje (rótulo, slider, campo). A coluna do rótulo passa de 78 px fixos para `minmax(56px, max-content)` com teto de 120 px.
- Celular (< 480 px): **duas linhas**. Em cima, o rótulo à esquerda e, à direita, `[−] [valor] [+]`. Embaixo, o slider com a largura inteira (343 px em vez dos 181 px de hoje, quase o dobro de precisão).
- Botões `−` e `+`: um passo por toque; segurar repete (espera 400 ms, depois a cada 60 ms). Só no modo de toque.

**3.5 Não mudar valor sem querer.** `touch-action: pan-y` no slider: gesto vertical rola o painel, gesto horizontal move o slider.

**3.6 Digitar números no celular** (item 7). Barra de teclas fixa logo acima do teclado, que aparece quando um campo numérico está em foco no modo de toque: `±`, `−passo`, `+passo`, `/` e `OK`. Um componente só (`src/ui/KeyBar.tsx`), posicionado com `visualViewport`, serve para sliders, vetores e matrizes.

**Pronto quando:** o slider tem a mesma aparência no Chrome, Safari e Firefox, nos dois temas; o preenchimento encosta no centro da bolinha em qualquer valor; dá para chegar a `-2,5` e a `1/2` em um iPhone.

### Fase 4 — Outras telas

- **Laboratório:** mesma estrutura da Fase 2 (gráfico, alça, lista com rolagem própria). Campo de expressão com 44 px e 16 px. A barra de teclas da Fase 3.6 ganha um segundo conjunto para expressões: `^ ( ) * / sqrt( pi sin( cos( x y t =`, inserindo na posição do cursor. Botão "Adicionar expressão" fixo no fim da lista.
- **Início:** a página tem que rolar mesmo quando o gesto começa em cima da demonstração (`touch-action: pan-y` nela, mantendo o arraste dos pontos). Demonstração com no máximo 46% da altura. Botões principais com largura inteira abaixo de 400 px.
- **Cabeçalho:** botões com 44 px; lista de resultados da busca limitada à altura visível (com `--vvh`); menu com área segura.
- **Fórmulas e matrizes largas:** conferir E4, F3 e H3 em 360 px. O que não couber rola dentro da própria caixa, com o degradê que já existe.

### Fase 5 — Desempenho no celular

- 3D: limitar `dpr` a 1,5 quando `pointer: coarse` e `navigator.deviceMemory ≤ 4`. Avaliar `frameloop="demand"` no `Canvas` (hoje não está definido) para não redesenhar com a cena parada.
- Limitar a uma atualização por quadro (`requestAnimationFrame`) enquanto se arrasta slider, ponto ou alça.
- Medir no Lighthouse em modo celular antes e depois.

### Fase 6 — Instalar no celular (opcional)

`manifest.webmanifest` (nome, ícones 192 e 512 feitos do logo, `display: standalone`, `start_url: "./"`), `apple-touch-icon` e `vite-plugin-pwa` para funcionar sem internet em sala de aula. Custo: o navegador guarda cerca de 1,7 MB. Só vale se for usar o site sem Wi-Fi.

## 4. Ordem e tamanho

| Ordem | Fase | Tamanho | Depende de |
| --- | --- | --- | --- |
| 1 | Fase 1, base de toque | Pequeno | — |
| 2 | Fase 3, sliders (3.1 a 3.5) | Médio | Fase 1 |
| 3 | Fase 2, tela de módulo | Grande | Fase 1 |
| 4 | Fase 3.6 e Fase 4 (barra de teclas, Laboratório, Início) | Médio | Fase 2 |
| 5 | Fase 5, desempenho | Pequeno | Fase 2 |
| 6 | Fase 6, instalar | Pequeno | opcional |

Os sliders vêm antes da tela de módulo porque melhoram também o computador e não dependem do layout novo. Cada fase vira um commit e pode ser publicada sozinha.

## 5. Como conferir

**Tamanhos de tela:** 360×640, 375×667, 390×844 e 412×915 em pé; 667×375 e 844×390 deitado; 768×1024; 1366×768 (não pode mudar nada além dos sliders).

**Aparelho de verdade, pelo menos uma vez cada:** iPhone com Safari e Android com Chrome. Conferir teclado, zoom ao focar, notch, digitação de negativo e fração, e arrastar pontos com o dedo.

**Varredura automática nos 29 módulos** (mesmo roteiro já usado para achar o erro do KaTeX), em 375×812:

- nenhuma rolagem horizontal;
- nenhum controle com menos de 44 px (hoje são 24 só no C1);
- `.katex-error` igual a zero;
- a barra da equação visível depois de rolar o painel até o fim.

**Testes:** `npm test` e `npm run typecheck` continuam passando. Teste novo para a conta do preenchimento do slider (`lo` e `hi` para intervalos que cruzam e não cruzam o zero).

## 6. Decisões em aberto

1. **Página sem rolagem com alça (recomendado) ou manter a rolagem de hoje com ajustes?** A alça dá mais controle e mantém a equação visível, mas é a parte mais trabalhosa.
2. **Barra de teclas acima do teclado (3.6):** resolve negativos e frações no iPhone. Alternativa mais simples: trocar para o teclado completo de texto, que tem `-` e `/` mas é pior para digitar números.
3. **Fase 6 (instalar e usar sem internet):** fazer ou deixar de fora.
