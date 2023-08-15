import AreaPolygon from "./AreaPolygon";
import NtracsTrack, { TrackFlag } from "./NtracsTrack";
import Vector2d from "./Vector2d";
import DEBUG_VALUE from "./debug_value.json";

class Project {
    constructor(public vertexes: Map<string, Vector2d>, public areas: Map<string, AreaPolygon>, public tracks: NtracsTrack[], public addons: string[]) {

    }

    static createTestData() {
        const t = DEBUG_VALUE;
        const vertexesMap = new Map();
        t.vertexes.forEach((v, i) => vertexesMap.set("v" + i, new Vector2d(v.x, v.z)));

        const areaMap = new Map();
        t.areas.forEach((v) => {
            areaMap.set(v.name, new AreaPolygon(
                v.vertexId.map(k => "v" + k),
                v.leftIndex));
        }
        );

        return new Project(
            vertexesMap,
            areaMap,
            []
            , t.addons);
    }
}

export default Project;