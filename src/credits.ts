/**
 * Créditos do trabalho. Edite aqui: o rodapé e a página Sobre leem deste arquivo.
 * Campos vazios simplesmente não aparecem no site.
 */
export const CREDITS = {
  disciplina: "Geometria Analítica e Álgebra Linear",
  instituicao: "UNEMAT",
  curso: "",
  professor: "",
  /** Nomes de quem fez o trabalho, na ordem em que devem aparecer. */
  autores: [] as string[],
  /** Ex.: "2026/2" */
  periodo: "",
};

/** Linha de detalhes (curso, professor, autores, período) sem os campos vazios. */
export function creditDetails(): string[] {
  const c = CREDITS;
  return [
    c.curso && `Curso: ${c.curso}`,
    c.professor && `Professor(a): ${c.professor}`,
    c.autores.length > 0 && `${c.autores.length > 1 ? "Autores" : "Autor(a)"}: ${c.autores.join(", ")}`,
    c.periodo && `Período: ${c.periodo}`,
  ].filter((x): x is string => Boolean(x));
}
