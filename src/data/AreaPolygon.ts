import { TrackFlag } from "./NtracsTrack";
import Project from "./Project";
import Vector2d from "./Vector2d";

class AreaPolygon {
    constructor(public name: string, public vertexes: string[], public leftVertexInnerId: number, public related: AreaPolygon[], public trackFlag: TrackFlag) {}

    toProjectJSON(project: Project) {
        return {
            name: this.name,
            vertexId: this.vertexes,
            leftVertexId: this.vertexes[this.leftVertexInnerId],
            related: this.related.map((v)=>v.name),
            trackFlag: this.trackFlag
        }
    }
}

export default AreaPolygon;