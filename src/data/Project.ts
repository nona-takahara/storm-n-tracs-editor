import AreaPolygon from "./AreaPolygon";
import NtracsTrack, { TrackFlag } from "./NtracsTrack";
import Vector2d from "./Vector2d";

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
        const t = { "vertexes": [{ "x": 0, "z": 0 }, { "x": 1337.6969696969697, "z": -3747.878787878788 }, { "x": 1337.5, "z": -3754 }, { "x": 1416.2, "z": -3756.4 }, { "x": 1416.7, "z": -3750.3 }, { "x": 1450.7, "z": -3762.8 }, { "x": 1452.2, "z": -3757.4 }, { "x": 1450.5454545454545, "z": -3768.242424242424 }, { "x": 1486.5, "z": -3768.3 }, { "x": 1486.4, "z": -3763.2 }, { "x": 1416.2, "z": -3761.2 }, { "x": 1416.1, "z": -3766.6 }, { "x": 1274.9, "z": -3758.1 }, { "x": 1274.6, "z": -3764 }, { "x": 1780, "z": -3773 }, { "x": 1780, "z": -3768.5 }, { "x": 1626.3, "z": -3768.4 }, { "x": 1626.4, "z": -3772.7 }, { "x": 1923.2, "z": -3771.9 }, { "x": 1923, "z": -3767.3 }, { "x": 1626.1, "z": -3763.5 }, { "x": 1922.8, "z": -3762.7 }, { "x": 1416.2, "z": -3768.9 }, { "x": 1416.2, "z": -3774.3 }, { "x": 1450.3, "z": -3772.5 }, { "x": 1452, "z": -3777.9 }, { "x": 1404.7, "z": -3778.9 }, { "x": 1299.5, "z": -3777.15 }, { "x": 1299.3, "z": -3784.6 }, { "x": 1408.5, "z": -3786 }, { "x": 1300.1, "z": -3746.9 }, { "x": 1299.9, "z": -3752.9 }, { "x": 2279.6, "z": -3760.6 }, { "x": 2122.6, "z": -3753.8 }, { "x": 2129.4, "z": -3763.9 }, { "x": 2278.5, "z": -3770.7 }, { "x": 2278.95, "z": -3765.45 }], "areas": [{ "name": "", "vertexId": [], "rawVertex": [], "related": [], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_1", "vertexId": [1, 2, 3, 4], "rawVertex": [{ "x": 1337.6969696969697, "z": -3747.878787878788 }, { "x": 1337.5, "z": -3754 }, { "x": 1416.2, "z": -3756.4 }, { "x": 1416.7, "z": -3750.3 }], "related": ["Area_1", "Area_12", "Area_2"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_2", "vertexId": [4, 3, 5, 6], "rawVertex": [{ "x": 1416.7, "z": -3750.3 }, { "x": 1416.2, "z": -3756.4 }, { "x": 1450.7, "z": -3762.8 }, { "x": 1452.2, "z": -3757.4 }], "related": ["Area_1", "Area_2", "Area_3", "Area_4"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_3", "vertexId": [6, 5, 7, 8, 9], "rawVertex": [{ "x": 1452.2, "z": -3757.4 }, { "x": 1450.7, "z": -3762.8 }, { "x": 1450.5454545454545, "z": -3768.242424242424 }, { "x": 1486.5, "z": -3768.3 }, { "x": 1486.4, "z": -3763.2 }], "related": ["Area_2", "Area_3", "Area_4", "Area_10", "Area_9"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_4", "vertexId": [5, 10, 11, 7], "rawVertex": [{ "x": 1450.7, "z": -3762.8 }, { "x": 1416.2, "z": -3761.2 }, { "x": 1416.1, "z": -3766.6 }, { "x": 1450.5454545454545, "z": -3768.242424242424 }], "related": ["Area_2", "Area_3", "Area_4", "Area_5", "Area_10"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_5", "vertexId": [10, 12, 13, 11], "rawVertex": [{ "x": 1416.2, "z": -3761.2 }, { "x": 1274.9, "z": -3758.1 }, { "x": 1274.6, "z": -3764 }, { "x": 1416.1, "z": -3766.6 }], "related": ["Area_4", "Area_5"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_6", "vertexId": [14, 15, 16, 17], "rawVertex": [{ "x": 1780, "z": -3773 }, { "x": 1780, "z": -3768.5 }, { "x": 1626.3, "z": -3768.4 }, { "x": 1626.4, "z": -3772.7 }], "related": ["Area_6", "Area_7", "Area_8", "Area_9", "Area_10"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_7", "vertexId": [15, 14, 18, 19], "rawVertex": [{ "x": 1780, "z": -3768.5 }, { "x": 1780, "z": -3773 }, { "x": 1923.2, "z": -3771.9 }, { "x": 1923, "z": -3767.3 }], "related": ["Area_6", "Area_7", "Area_8", "Area_13"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_8", "vertexId": [20, 16, 15, 19, 21], "rawVertex": [{ "x": 1626.1, "z": -3763.5 }, { "x": 1626.3, "z": -3768.4 }, { "x": 1780, "z": -3768.5 }, { "x": 1923, "z": -3767.3 }, { "x": 1922.8, "z": -3762.7 }], "related": ["Area_8", "Area_9", "Area_6", "Area_10", "Area_7", "Area_13"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_9", "vertexId": [20, 9, 8, 16], "rawVertex": [{ "x": 1626.1, "z": -3763.5 }, { "x": 1486.4, "z": -3763.2 }, { "x": 1486.5, "z": -3768.3 }, { "x": 1626.3, "z": -3768.4 }], "related": ["Area_8", "Area_9", "Area_3", "Area_10", "Area_6"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_10", "vertexId": [22, 23, 24, 25, 17, 16, 8, 7], "rawVertex": [{ "x": 1416.2, "z": -3768.9 }, { "x": 1416.2, "z": -3774.3 }, { "x": 1450.3, "z": -3772.5 }, { "x": 1452, "z": -3777.9 }, { "x": 1626.4, "z": -3772.7 }, { "x": 1626.3, "z": -3768.4 }, { "x": 1486.5, "z": -3768.3 }, { "x": 1450.5454545454545, "z": -3768.242424242424 }], "related": ["Area_10", "Area_11", "Area_6", "Area_8", "Area_9", "Area_3", "Area_4"], "downTrack": "", "upTrack": "", "leftIndex": 2, "rightIndex": 2 }, { "name": "Area_11", "vertexId": [24, 26, 27, 28, 29, 25], "rawVertex": [{ "x": 1450.3, "z": -3772.5 }, { "x": 1404.7, "z": -3778.9 }, { "x": 1299.5, "z": -3777.15 }, { "x": 1299.3, "z": -3784.6 }, { "x": 1408.5, "z": -3786 }, { "x": 1452, "z": -3777.9 }], "related": ["Area_10", "Area_11"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_12", "vertexId": [1, 30, 31, 2], "rawVertex": [{ "x": 1337.6969696969697, "z": -3747.878787878788 }, { "x": 1300.1, "z": -3746.9 }, { "x": 1299.9, "z": -3752.9 }, { "x": 1337.5, "z": -3754 }], "related": ["Area_1", "Area_12"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }, { "name": "Area_13", "vertexId": [32, 33, 21, 19, 18, 34, 35, 36], "rawVertex": [{ "x": 2279.6, "z": -3760.6 }, { "x": 2122.6, "z": -3753.8 }, { "x": 1922.8, "z": -3762.7 }, { "x": 1923, "z": -3767.3 }, { "x": 1923.2, "z": -3771.9 }, { "x": 2129.4, "z": -3763.9 }, { "x": 2278.5, "z": -3770.7 }, { "x": 2278.95, "z": -3765.45 }], "related": ["Area_13", "Area_8", "Area_7"], "downTrack": "", "upTrack": "", "leftIndex": 0, "rightIndex": 0 }], "addons": ["N_TRACS_Soya_Express\\playlist.xml", "SER_Akatsuchi\\playlist.xml", "SER_Oneru\\playlist.xml", "SER_Unanone\\playlist.xml", "SER_Holt\\playlist.xml", "SER_Kagamigaike\\playlist.xml", "SER_Hokko\\playlist.xml"] };

        return new Project(
            t.vertexes.map((v) => new Vector2d(v.x, v.z)),
            t.areas.map((v) => new AreaPolygon(
                v.name,
                v.vertexId.map((k) => t.vertexes[k]),
                v.vertexId.indexOf(v.leftIndex),
                [],
                TrackFlag.none
            )), [], t.addons);
    }
}

export default Project;