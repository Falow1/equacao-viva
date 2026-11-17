import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";

export type UrlVal = number | number[] | number[][] | string | boolean;

const r3 = (x: number) => String(Math.round(x * 1000) / 1000);

function serialize(v: UrlVal): string {
  if (typeof v === "number") return r3(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  if (typeof v === "string") return v;
  if (v.length > 0 && Array.isArray(v[0])) return (v as number[][]).map((r) => r.map(r3).join(",")).join(";");
  return (v as number[]).map(r3).join(",");
}

function parseLike(raw: string, def: UrlVal): UrlVal | undefined {
  const num = (s: string) => {
    const n = Number(s);
    return Number.isFinite(n) ? n : undefined;
  };
  if (typeof def === "number") return num(raw);
  if (typeof def === "boolean") return raw === "1" ? true : raw === "0" ? false : undefined;
  if (typeof def === "string") return raw;
  if (raw === "") return def.length > 0 && Array.isArray(def[0]) && (def as number[][]).length > 3 ? [] : undefined;
  if (def.length > 0 && Array.isArray(def[0])) {
    const rows = raw.split(";").map((r) => r.split(",").map(num));
    const d = def as number[][];
    if (rows.some((r) => r.some((x) => x === undefined))) return undefined;
    // Para matrizes, o número de colunas deve ser o mesmo do padrão; linhas podem variar se o padrão permitir.
    if (rows.some((r) => r.length !== d[0].length)) return undefined;
    // Matrizes pequenas têm tamanho fixo; listas de pontos (mais de 4 linhas no padrão) podem variar.
    if (d.length <= 4 && rows.length !== d.length) return undefined;
    return rows as number[][];
  }
  const arr = raw.split(",").map(num);
  if (arr.some((x) => x === undefined)) return undefined;
  if ((def as number[]).length > 0 && arr.length !== (def as number[]).length && raw !== "") {
    // vetores de tamanho fixo
    if ((def as number[]).length <= 3) return undefined;
  }
  return arr as number[];
}

/** Valores aceitos para os parâmetros de texto (modos, abas, dimensão). */
export type UrlChoices<T> = { [K in keyof T]?: readonly string[] };

/** Lê um parâmetro de texto da URL só se ele estiver entre os valores aceitos. */
export function parseParam(raw: string, def: UrlVal, choices?: readonly string[]): UrlVal | undefined {
  if (typeof def === "string" && choices && !choices.includes(raw)) return undefined;
  return parseLike(raw, def);
}

/**
 * Parâmetro que só faz sentido positivo (semieixo, parâmetro da parábola): usa o valor absoluto,
 * com um mínimo (o começo do slider), para que 0 ou um negativo digitado (ou vindo de um link)
 * não gere divisão por zero nem uma equação com "x²/0" depois de arredondada.
 */
export const positive = (x: number, min: number) => (Number.isFinite(x) ? Math.max(min, Math.abs(x)) : Math.max(min, 1));

/**
 * Estado do módulo sincronizado com a query do hash (#/m/slug?u=2,1).
 * Valores inválidos voltam ao padrão: números que não são números, vetores com tamanho errado e,
 * se `choices` disser quais são os aceitos, textos fora da lista (um link editado à mão com ?modo=xyz).
 * Escreve na URL com debounce, sem poluir o histórico.
 */
export function useUrlState<T extends Record<string, UrlVal>>(
  defaults: T,
  choices?: UrlChoices<T>,
): [T, (patch: Partial<T> | ((s: T) => Partial<T>)) => void, () => void] {
  const [params, setParams] = useSearchParams();
  const defaultsRef = useRef(defaults);
  const [state, setState] = useState<T>(() => {
    const s = { ...defaults };
    for (const k of Object.keys(defaults) as (keyof T)[]) {
      const raw = params.get(k as string);
      if (raw === null) continue;
      const v = parseParam(raw, defaults[k], choices?.[k]);
      if (v !== undefined) s[k] = v as T[keyof T];
    }
    return s;
  });

  useEffect(() => {
    const id = window.setTimeout(() => {
      const next = new URLSearchParams();
      const d = defaultsRef.current;
      for (const k of Object.keys(state)) {
        const sv = serialize(state[k]);
        if (sv !== serialize(d[k])) next.set(k, sv);
      }
      if (next.toString() !== params.toString()) setParams(next, { replace: true, preventScrollReset: true });
    }, 200);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const update = useCallback((patch: Partial<T> | ((s: T) => Partial<T>)) => {
    setState((s) => ({ ...s, ...(typeof patch === "function" ? patch(s) : patch) }));
  }, []);
  const reset = useCallback(() => setState({ ...defaultsRef.current }), []);
  return [state, update, reset];
}
