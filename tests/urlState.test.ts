import { describe, expect, it } from "vitest";
import { parseParam, positive } from "../src/state/useUrlState";
import { createEqPin } from "../src/ui/eqPin";

describe("parâmetros vindos do link", () => {
  it("texto fora da lista de aceitos volta ao padrão", () => {
    expect(parseParam("misto", "vet", ["vet", "misto"])).toBe("misto");
    expect(parseParam("xyz", "vet", ["vet", "misto"])).toBeUndefined();
    // sem lista, qualquer texto passa (expressões do Laboratório)
    expect(parseParam("y = x^2", "", undefined)).toBe("y = x^2");
  });

  it("números e vetores continuam validados pelo tipo do padrão", () => {
    expect(parseParam("2.5", 1)).toBe(2.5);
    expect(parseParam("abc", 1)).toBeUndefined();
    expect(parseParam("1,2", [0, 0])).toEqual([1, 2]);
    expect(parseParam("1,2,3", [0, 0])).toBeUndefined();
  });

  it("parâmetro positivo: valor absoluto, com mínimo, e nunca NaN", () => {
    expect(positive(2, 0.5)).toBe(2);
    expect(positive(-2, 0.5)).toBe(2);
    expect(positive(0, 0.5)).toBe(0.5);
    expect(positive(0.1, 0.25)).toBe(0.25);
    expect(positive(NaN, 0.5)).toBe(1);
  });
});

describe("equação da barra do celular", () => {
  it("vale a primeira habilitada; as fórmulas largas ficam de fora", () => {
    const pin = createEqPin();
    pin.set("a", "A", false);
    pin.set("b", "B", true);
    pin.set("c", "C", true);
    expect(pin.get()).toEqual({ id: "b", tex: "B" });
    pin.remove("b");
    expect(pin.get()).toEqual({ id: "c", tex: "C" });
    pin.set("c", "C2", true);
    expect(pin.get().tex).toBe("C2");
  });
});
