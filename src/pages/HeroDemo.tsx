import { Coordinates, Mafs } from "mafs";
import { useState } from "react";
import { o1, o2, o3, texTuple } from "../math/format";
import { add } from "../math/vec";
import { Tex } from "../ui/Tex";
import { Arrow, DraggablePoint, Fill, Segment, type P2 } from "../viz2d";

/**
 * Mini módulo da página inicial: soma de vetores pela regra do paralelogramo (o mesmo desenho da logo).
 * Estado local, sem zoom nem arraste do fundo, para não atrapalhar a rolagem da página.
 */
export default function HeroDemo() {
  const [u, setU] = useState<P2>([3, 1]);
  const [v, setV] = useState<P2>([1, 2]);
  const sum = add(u, v) as P2;
  return (
    <>
      <div className="hero-demo-graph" role="figure" aria-label="Dois vetores arrastáveis e a soma deles">
        <Mafs height={300} width="auto" pan={false} zoom={false} viewBox={{ x: [-1, 6], y: [-1, 4.5], padding: 0.3 }} preserveAspectRatio="contain">
          <Coordinates.Cartesian subdivisions={false} />
          <Fill points={[[0, 0], u, sum, v]} color="var(--obj1)" opacity={0.1} />
          <Segment a={u} b={sum} dashed />
          <Segment a={v} b={sum} dashed />
          <Arrow tip={sum} color="var(--obj3)" label="u + v" />
          <Arrow tip={u} color="var(--obj1)" label="u" />
          <Arrow tip={v} color="var(--obj2)" label="v" />
          <DraggablePoint point={u} onMove={setU} color="var(--obj1)" />
          <DraggablePoint point={v} onMove={setV} color="var(--obj2)" />
        </Mafs>
      </div>
      <div className="hero-demo-eq">
        <Tex block>{`${o1("\\vec u")} + ${o2("\\vec v")} = ${o1(texTuple(u))} + ${o2(texTuple(v))} = ${o3(texTuple(sum))}`}</Tex>
      </div>
    </>
  );
}
