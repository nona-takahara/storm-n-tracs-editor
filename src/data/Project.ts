import AreaPolygon from "./AreaPolygon";
import NtracsTrack, { TrackFlag } from "./NtracsTrack";
import Vector2d from "./Vector2d";
import DEBUG_VALUE from "./debug_value.json";

class Project {
    constructor(public vertexes: Vector2d[], public areas: AreaPolygon[], public tracks: NtracsTrack[], public addons: string[]) {

    }

    getVertexId(vertex: Vector2d) {
        return this.vertexes.findIndex((v) => v.x == vertex.x && v.z == vertex.z);
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

        return new Project(
            t.vertexes.map((v) => new Vector2d(v.x, v.z)),
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