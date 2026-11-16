import { parse, type MathNode } from "mathjs";

const RESERVED = new Set(["x", "y", "z", "t", "pi", "e", "E", "PI", "i", "Infinity"]);

export type Compiled = (scope: Record<string, number>) => number;

export interface CompiledExpr {
  fn: Compiled;
  /** Símbolos livres (exceto x, y, z, t e constantes). */
  params: string[];
  /** Variáveis x, y, z, t usadas. */
  vars: string[];
}

function friendly(msg: string): string {
  if (/Parenthesis|parenthesis/.test(msg)) return "Parênteses desbalanceados.";
  if (/Unexpected end/.test(msg)) return "A expressão terminou antes do esperado.";
  if (/Value expected/.test(msg)) return "Falta um número ou variável em algum ponto.";
  if (/Unexpected operator/.test(msg)) return "Operador em posição inesperada.";
  if (/Undefined function/.test(msg)) return `Função desconhecida: ${msg.split(" ").pop()}.`;
  return "Não entendi a expressão. Use ponto como separador decimal e * para multiplicar se precisar.";
}

/** Compila uma expressão matemática (sintaxe math.js). Lança Error com mensagem em português. */
export function compileExpr(src: string): CompiledExpr {
  let node: MathNode;
  try {
    node = parse(src.replace(/\*\*/g, "^"));
  } catch (e) {
    throw new Error(friendly((e as Error).message));
  }
  const fnNames = new Set<string>();
  node.traverse((n) => {
    if ((n as { type: string }).type === "FunctionNode") {
      const fname = (n as unknown as { fn: { name?: string } }).fn?.name;
      if (fname) fnNames.add(fname);
    }
  });
  const symbols = new Set<string>();
  node.traverse((n) => {
    if ((n as { type: string }).type === "SymbolNode") symbols.add((n as unknown as { name: string }).name);
  });
  for (const f of fnNames) symbols.delete(f);
  const vars = [...symbols].filter((s) => ["x", "y", "z", "t"].includes(s));
  const params = [...symbols].filter((s) => !RESERVED.has(s));
  const code = node.compile();
  const fn: Compiled = (scope) => {
    try {
      const r = code.evaluate({ ...scope });
      return typeof r === "number" ? r : NaN;
    } catch {
      return NaN;
    }
  };
  return { fn, params, vars };
}

/** Separa "(a, b, c)" no nível mais externo; null se não for tupla. */
export function splitTuple(src: string): string[] | null {
  const s = src.trim();
  if (!s.startsWith("(") || !s.endsWith(")")) return null;
  const inner = s.slice(1, -1);
  const parts: string[] = [];
  let depth = 0, cur = "";
  for (const ch of inner) {
    if (ch === "(" || ch === "[") depth++;
    if (ch === ")" || ch === "]") depth--;
    if (depth < 0) return null;
    if (ch === "," && depth === 0) {
      parts.push(cur);
      cur = "";
    } else cur += ch;
  }
  parts.push(cur);
  return parts.length >= 2 ? parts.map((p) => p.trim()) : null;
}

/** Separa "[a, b]" ou "[[1,2],[3,4]]" em números; null se não for literal numérico. */
export function parseBracketNumbers(src: string): number[] | number[][] | null {
  try {
    const v = JSON.parse(src.trim().replace(/\s+/g, ""));
    if (Array.isArray(v) && v.every((x) => typeof x === "number")) return v as number[];
    if (Array.isArray(v) && v.every((r) => Array.isArray(r) && r.every((x: unknown) => typeof x === "number"))) return v as number[][];
  } catch {
    /* não é literal */
  }
  return null;
}
