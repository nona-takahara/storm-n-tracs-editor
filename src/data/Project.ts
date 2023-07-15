import AreaPolygon from "./AreaPolygon";
import NtracsTrack from "./NtracsTrack";
import Vector2d from "./Vector2d";

class Project {
    constructor(public vertexes: Vector2d[], public areas: AreaPolygon[], public tracks: NtracsTrack[], public addons: string[]) {

    }

    getVertexId(vertex: Vector2d) {
        return this.vertexes.findIndex((v) => v.x ==vertex.x && v.z == vertex.z);
    }

    toJSON() {
        return {
            vertexes: this.vertexes,
            areas: this.areas.map((v) => v.toProjectJSON(this)),
            tracks: this.tracks,
            addons: this.addons
        }
    }

}

export default Project;