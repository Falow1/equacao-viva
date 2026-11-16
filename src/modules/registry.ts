import { lazy, type ComponentType, type LazyExoticComponent } from "react";

export type TrackId =
  | "vetores"
  | "retas-planos"
  | "conicas"
  | "quadricas"
  | "sistemas"
  | "espacos"
  | "transformacoes"
  | "autovalores";

export interface Track {
  id: TrackId;
  letter: string;
  title: string;
  summary: string;
}

export interface ModuleMeta {
  id: string;
  slug: string;
  title: string;
  track: TrackId;
  dimension: "2d" | "3d";
  summary: string;
  prerequisites: string[];
  component: LazyExoticComponent<ComponentType>;
}

export const TRACKS: Track[] = [
  { id: "vetores", letter: "A", title: "Vetores", summary: "Soma, produto escalar, ângulo, projeção, produto vetorial e misto." },
  { id: "retas-planos", letter: "B", title: "Retas e planos", summary: "Equações da reta e do plano, posições relativas e distâncias." },
  { id: "conicas", letter: "C", title: "Cônicas", summary: "Elipse, hipérbole, parábola e a equação geral do 2º grau." },
  { id: "quadricas", letter: "D", title: "Quádricas", summary: "Superfícies do 2º grau e seus traços." },
  { id: "sistemas", letter: "E", title: "Sistemas lineares e matrizes", summary: "Interpretação geométrica, escalonamento, determinante e operações com matrizes." },
  { id: "espacos", letter: "F", title: "Espaços vetoriais", summary: "Combinação linear, subespaços, base, dimensão, mudança de base, núcleo e imagem." },
  { id: "transformacoes", letter: "G", title: "Transformações lineares", summary: "A matriz como transformação do plano e do espaço." },
  { id: "autovalores", letter: "H", title: "Autovalores e ortogonalidade", summary: "Autovetores, diagonalização, Hamilton–Cayley, Gram–Schmidt e mínimos quadrados." },
];

const m = (
  id: string,
  slug: string,
  title: string,
  track: TrackId,
  dimension: "2d" | "3d",
  summary: string,
  prerequisites: string[],
  loader: () => Promise<{ default: ComponentType }>,
): ModuleMeta => ({ id, slug, title, track, dimension, summary, prerequisites, component: lazy(loader) });

export const MODULES: ModuleMeta[] = [
  m("A1", "vetores-no-plano", "Vetores no plano", "vetores", "2d", "Soma pela regra do paralelogramo, diferença e combinação αu + βv.", [], () => import("./A1")),
  m("A2", "produto-escalar", "Produto escalar, ângulo e projeção", "vetores", "2d", "O produto escalar mede o quanto dois vetores apontam na mesma direção.", ["A1"], () => import("./A2")),
  m("A3", "produto-vetorial", "Produto vetorial e misto", "vetores", "3d", "u × v é perpendicular a u e v; o produto misto dá o volume.", ["A2"], () => import("./A3")),
  m("B1", "reta-no-plano", "Equações da reta no plano", "retas-planos", "2d", "Formas geral, reduzida, paramétrica e segmentária da mesma reta.", ["A1"], () => import("./B1")),
  m("B2", "duas-retas", "Duas retas e um ponto", "retas-planos", "2d", "Interseção, ângulo entre retas e distância de ponto a reta.", ["B1"], () => import("./B2")),
  m("B3", "reta-no-espaco", "Reta no espaço", "retas-planos", "3d", "Formas vetorial, paramétrica e simétrica da reta em 3D.", ["A1"], () => import("./B3")),
  m("B4", "plano-no-espaco", "Plano no espaço", "retas-planos", "3d", "Equação geral, vetor normal e o plano por três pontos.", ["A3"], () => import("./B4")),
  m("B5", "posicoes-no-espaco", "Posições relativas e distâncias", "retas-planos", "3d", "Retas reversas, interseções e distâncias no espaço.", ["B3", "B4"], () => import("./B5")),
  m("C1", "elipse", "Circunferência e elipse", "conicas", "2d", "A soma das distâncias aos focos é constante: d₁ + d₂ = 2a.", ["B1"], () => import("./C1")),
  m("C2", "hiperbole", "Hipérbole", "conicas", "2d", "A diferença das distâncias aos focos é constante: |d₁ − d₂| = 2a.", ["C1"], () => import("./C2")),
  m("C3", "parabola", "Parábola", "conicas", "2d", "Cada ponto está à mesma distância do foco e da diretriz.", ["C1"], () => import("./C3")),
  m("C4", "equacao-geral-conicas", "Equação geral do 2º grau", "conicas", "2d", "Classifique Ax² + Bxy + Cy² + Dx + Ey + F = 0 e gire os eixos.", ["C1", "C2", "C3"], () => import("./C4")),
  m("D1", "quadricas", "Galeria das quádricas", "quadricas", "3d", "Elipsoide, hiperboloides, cone, paraboloides e cilindros com seus traços.", ["C4"], () => import("./D1")),
  m("E1", "sistemas-lineares", "Sistemas lineares: o que é a solução", "sistemas", "2d", "Cada equação é uma reta (ou plano); a solução é onde todas se encontram.", [], () => import("./E1")),
  m("E2", "eliminacao-de-gauss", "Eliminação de Gauss passo a passo", "sistemas", "3d", "Operações elementares mudam as equações, mas não a solução.", ["E1"], () => import("./E2")),
  m("E3", "determinante", "Determinante como área e volume", "sistemas", "2d", "O determinante é a área (ou volume) com sinal gerada pelas colunas.", ["A3"], () => import("./E3")),
  m("E4", "operacoes-com-matrizes", "Operações com matrizes e inversa", "sistemas", "2d", "Soma, produto, transposta e a inversa calculada por Gauss–Jordan.", ["E2"], () => import("./E4")),
  m("F1", "combinacao-linear", "Combinação linear e espaço gerado", "espacos", "2d", "Quais vetores dá para alcançar com c₁v₁ + c₂v₂?", ["A1"], () => import("./F1")),
  m("F2", "subespacos", "Subespaços, base e dimensão", "espacos", "3d", "Quando um conjunto é subespaço, e como achar uma base e a dimensão.", ["F1"], () => import("./F2")),
  m("F3", "mudanca-de-base", "Base e mudança de base", "espacos", "2d", "O mesmo ponto tem coordenadas diferentes em bases diferentes.", ["F2"], () => import("./F3")),
  m("F4", "nucleo-e-imagem", "Núcleo, imagem e posto", "espacos", "3d", "O que a matriz anula e o que ela alcança: posto + nulidade = n.", ["F2", "E1"], () => import("./F4")),
  m("G1", "matriz-transformacao", "Matriz como transformação do plano", "transformacoes", "2d", "As colunas da matriz são as imagens de e₁ e e₂.", ["F1"], () => import("./G1")),
  m("G2", "composicao-e-inversa", "Composição e inversa", "transformacoes", "2d", "Aplicar B e depois A é multiplicar AB; a ordem importa.", ["G1"], () => import("./G2")),
  m("G3", "transformacoes-3d", "Transformações no espaço", "transformacoes", "3d", "Rotações, reflexões, projeções e escalas aplicadas a um cubo.", ["G1"], () => import("./G3")),
  m("H1", "autovalores", "Autovalores e autovetores", "autovalores", "2d", "Direções que a matriz só estica: Av = λv.", ["G1"], () => import("./H1")),
  m("H2", "diagonalizacao", "Diagonalização e formas quadráticas", "autovalores", "2d", "Nos eixos dos autovetores a matriz simétrica vira diagonal.", ["H1", "C4"], () => import("./H2")),
  m("H3", "diagonalizacao-3x3", "Diagonalização 3×3 e Hamilton–Cayley", "autovalores", "3d", "Multiplicidades, autoespaços, polinômio minimal e p(A) = 0.", ["H2"], () => import("./H3")),
  m("H4", "gram-schmidt", "Projeção ortogonal e Gram–Schmidt", "autovalores", "2d", "Transforme uma base qualquer em uma base ortonormal.", ["A2"], () => import("./H4")),
  m("H5", "minimos-quadrados", "Mínimos quadrados", "autovalores", "2d", "A reta que melhor se ajusta aos pontos, pelas equações normais.", ["H4"], () => import("./H5")),
];

export const moduleBySlug = (slug: string) => MODULES.find((x) => x.slug === slug);
export const moduleById = (id: string) => MODULES.find((x) => x.id === id);
export const trackById = (id: string) => TRACKS.find((t) => t.id === id);
export const modulesOfTrack = (id: TrackId) => MODULES.filter((x) => x.track === id);
