import AxleMode from "./AxleMode";
import Vector2d from "./Vector2d";

type Complex = {
  re: number;
  im: number;
}

function cxmul(c1: Complex, c2: Complex): Complex {
  return {
    re: c1.re * c2.re - c1.im * c2.im,
    im: c1.re * c2.im + c1.im * c2.re
  };
}

function cxhalfarg(c: Complex): Complex {
  const r = Math.sqrt(c.re * c.re + c.im * c.im);
  return {
    re: Math.sqrt((c.re + r) / 2),
    im: Math.sign(c.im) * Math.sqrt((-c.re + r) / 2)
  }
}

class AreaPolygon {
  constructor(public vertexes: string[], public leftVertexInnerId: number, public axleMode: AxleMode) { }

  isInArea(vertexes: Map<string, Vector2d>, x: number, z: number) {
    let prod: Complex = { re: 1, im: 0 };
    const v = this.vertexes.map(i => vertexes.get(i)).filter((v): v is Exclude<typeof v, undefined> => v !== undefined)
    let minx = false, minz = false, maxx = false, maxz = false;
    for (const k of v) {
      minx ||= k.x < x;
      minz ||= k.z < z;
      maxx ||= k.x > x;
      maxz ||= k.z > z;
    }

    if (!(minx && minz && maxx && maxz)) {
      return false;
    }

    for (let i = 0; i < this.vertexes.length; i++) {
      const v0 = v[(i) % this.vertexes.length];
      const v1 = v[(i + 1) % this.vertexes.length];

      if (v0 && v1) {
        prod = cxmul(prod, cxhalfarg(cxmul({ re: v1.x - x, im: v1.z - z }, { re: v0.x - x, im: -v0.z + z })));
      }
    }
    return prod.re < 0;
  }
}

export default AreaPolygon;