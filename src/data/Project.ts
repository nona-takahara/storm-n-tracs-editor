import AreaPolygon from "./AreaPolygon";
import NtracsTrack, { TrackFlag } from "./NtracsTrack";
import Vector2d from "./Vector2d";
import DEBUG_VALUE from "./debug_value.json";

class Project {
    constructor(public vertexes: Map<number,Vector2d>, public areas: AreaPolygon[], public tracks: NtracsTrack[], public addons: string[]) {

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