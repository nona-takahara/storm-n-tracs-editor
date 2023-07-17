import AreaPolygon from "./AreaPolygon";
import NtracsTrack, { TrackFlag } from "./NtracsTrack";
import Vector2d from "./Vector2d";
import DEBUG_VALUE from "./debug_value.json";

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
    const r = c.re * c.re + c.im * c.im;
    return {
        re: Math.sqrt((c.re + r) / 2),
        im: Math.sign(c.im) * Math.sqrt((-c.re + r) / 2)
    }
}

class Project {
    constructor(public vertexes: Map<number, Vector2d>, public areas: AreaPolygon[], public tracks: NtracsTrack[], public addons: string[]) {

    }

    isInArea(area: AreaPolygon, x: number, z: number) {
        let prod: Complex = { re: 1, im: 0 };

        for (let i = 0; i < area.vertexes.length; i++) {
            const v0 = this.vertexes.get(area.vertexes[i]);
            const v1 = this.vertexes.get((area.vertexes[i] + 1) % area.vertexes.length);
            if (v0 && v1) {
                prod = cxmul(prod, cxhalfarg(cxmul({ re: v1.x - x, im: v1.z - z }, { re: v0.x - x, im: -v0.z + z }))
                );
            }
        }
        return prod.re < 0;
    }

    toJSON() {
        return {
            vertexes: this.vertexes,
            areas: this.areas.map((v) => v.toProjectJSON(this)),
            tracks: this.tracks,
            addons: this.addons
        }
    }

    static createTestData() {
        const t = DEBUG_VALUE;
        const vertexesMap = new Map();
        t.vertexes.forEach((v, i) => vertexesMap.set(i, new Vector2d(v.x, v.z)));

        return new Project(
            vertexesMap,
            t.areas.map((v) => new AreaPolygon(
                v.name,
                v.vertexId,
                v.vertexId.indexOf(v.leftIndex),
                [],
                TrackFlag.none
            )), [], t.addons);
    }
}

export default Project;