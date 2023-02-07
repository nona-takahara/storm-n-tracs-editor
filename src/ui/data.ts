import * as __PIXI from "pixi.js";
export declare const PIXI: typeof __PIXI;

export class Vertex {
  x: number;
  z: number;
  constructor(x: number, z: number) {
    this.x = x;
    this.z = z;
  }
  poly?: NtracsPolygon[];

  toJSON() {
    return { x: this.x, z: this.z };
  }
}
export class NtracsPolygon {
  name: string;
  vertex: number[];
  polygon?: __PIXI.Polygon;
  prj: NtracsProject;
  constructor(name: string, vertex: number[], prj: NtracsProject) {
    this.name = name;
    this.vertex = vertex;
    this.prj = prj;
  }

  createPolygon(): __PIXI.Polygon {
    this.polygon = new PIXI.Polygon(
      this.vertex.map(
        (v) =>
          <__PIXI.IPointData>{
            x: this.prj.vertex[v].x,
            y: this.prj.vertex[v].z
          }
      )
    );
    return this.polygon;
  }

  getPolygon(): __PIXI.Polygon {
    return this.polygon || this.createPolygon();
  }
}

function len(x1: number, y1: number, x2: number, y2: number) {
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}

export class NtracsProject {
  tracks: Array<any>;
  components: { [addonName: string]: Array<any> };
  vertex: Vertex[];
  polygons: NtracsPolygon[];
  constructor() {
    this.vertex = [];
    this.polygons = [];
    this.components = {};
    this.tracks = [];
  }

  addAndDrawComponents(
    graphics: __PIXI.Graphics,
    name: string,
    components: any[]
  ) {
    this.components[name] = components;
    const textSettings = {
      fontFamily: "Consolas, monospace",
      fontSize: 20 * devicePixelRatio
    };
    for (const c of components) {
      const basicText = new PIXI.Text(c.tag || "", textSettings);
      basicText.x = c.x + 0.8;
      basicText.y = c.z + 0.8;
      basicText.scale.x = 0.1 / devicePixelRatio;
      basicText.scale.y = -0.1 / devicePixelRatio;

      graphics.addChild(basicText);

      if ((c.tag as string).includes("stake")) {
        graphics.lineStyle(0);
        graphics.beginFill(0xa00000, 1);
        graphics.drawCircle(c.x, c.z, 0.5);
        graphics.endFill();
      } else {
        graphics.lineStyle(0.1, 0xff3000, 1);

        function rotate(x: number, z: number) {
          return {
            x: x * c.m00 + z * c.m10,
            z: x * c.m01 + z * c.m11
          };
        }
        const m = [
          rotate(-c.size_x / 2, c.size_z / 2),
          rotate(-c.size_x / 2, -c.size_z / 2),
          rotate(c.size_x / 2, -c.size_z / 2),
          rotate(c.size_x / 2, c.size_z / 2)
        ];
        graphics.beginFill(0xff3000, 0.4);
        graphics.moveTo(c.x + m[0].x, c.z + m[0].z);
        graphics.lineTo(c.x + m[1].x, c.z + m[1].z);
        graphics.lineTo(c.x + m[2].x, c.z + m[2].z);
        graphics.lineTo(c.x + m[3].x, c.z + m[3].z);
        graphics.closePath();
        graphics.drawCircle(c.x, c.z, 0.5);
        graphics.endFill();
      }
    }
  }

  searchNearestVertex(
    x: number,
    z: number,
    length: number
  ): number | undefined {
    length *= length;
    let rets: number | undefined = undefined;
    for (let j = 0; j < this.vertex.length; j++) {
      const i = this.vertex[j];
      if (len(x, z, i.x, i.z) < length) {
        length = len(x, z, i.x, i.z);
        rets = j;
      }
    }
    return rets;
  }

  toJSON() {
    return {
      vertex: this.vertex,
      polygons: this.polygons.map((v) => ({
        name: v.name,
        vertexId: v.vertex,
        rawVertex: v.vertex.map((k) => this.vertex[k]),
        related: v.vertex
          .map((k) => this.vertex[k].poly?.map((s) => s.name))
          .flat()
      }))
    };
  }
}

export async function loadDummy(graphics: __PIXI.Graphics) {
  let prj = new NtracsProject();
  prj.vertex = [
    { x: 0, z: 0 },
    { x: 1417.5, z: -3758.5 },
    { x: 1160, z: -3756.3 },
    { x: 1159.8, z: -3764.6 },
    { x: 1417, z: -3767.1 },
    { x: 1159.3, z: -3773.9 },
    { x: 1416.1, z: -3776.2 },
    { x: 1116.2, z: -3758.9 },
    { x: 1116.7, z: -3768.1 },
    { x: 1117, z: -3778.7 },
    { x: 1292.5, z: -3785.8 },
    { x: 1415.6, z: -3786.5 },
    { x: 1418.2, z: -3748.6 },
    { x: 1293, z: -3744.7 },
    { x: 1625.7, z: -3768.2 },
    { x: 1625.4, z: -3761.9 },
    { x: 1472.9, z: -3760.2 },
    { x: 1497.9, z: -3768.1 },
    { x: 1625.4, z: -3776.3 },
    { x: 1472.5, z: -3775.4 },
    { x: 993.7, z: -3770 },
    { x: 871.3, z: -3847.9 },
    { x: 561.7, z: -4137.2 },
    { x: 567.8, z: -4145.1 },
    { x: 1003.3, z: -3797.3 },
    { x: 854.3, z: -3969.7 },
    { x: 907, z: -4159.4 },
    { x: 1196.4, z: -4471.8 },
    { x: 1202.3, z: -4466.5 },
    { x: -44, z: -4506.7 },
    { x: 170.9, z: -4510.9 },
    { x: 186.7, z: -4518.1 },
    { x: 720.2, z: -4987.8 },
    { x: 717, z: -5006.6 },
    { x: 1123, z: -5108.3 },
    { x: 1340, z: -4621.3 },
    { x: 1897, z: -3767.7 },
    { x: 1896.7, z: -3774.1 },
    { x: 1896.8, z: -3761.3 },
    { x: 257.7, z: -4785.1 },
    { x: 248.7, z: -4802.1 },
    { x: 40.9, z: -4725.6 }
  ].map((v) => new Vertex(v.x, v.z));
  prj.polygons = [
    new NtracsPolygon("", [], prj),
    new NtracsPolygon("NHB3T", [1, 2, 3, 4], prj),
    new NtracsPolygon("NHB2T", [4, 3, 5, 6], prj),
    new NtracsPolygon("NHB1RT", [2, 7, 8, 3], prj),
    new NtracsPolygon("NHB2LT", [3, 8, 9, 5], prj),
    new NtracsPolygon("NHB1T", [6, 5, 10, 11], prj),
    new NtracsPolygon("NHB4T", [12, 13, 2, 1], prj),
    new NtracsPolygon("NHB33AT", [14, 15, 16, 12, 1, 4, 17], prj),
    new NtracsPolygon("NHB33BT", [18, 14, 17, 4, 6, 11, 19], prj),
    new NtracsPolygon("HLT_NHB1T", [7, 20, 21, 22, 23, 24, 8], prj),
    new NtracsPolygon("NHB_HLT3T", [8, 24, 25, 26, 27, 28], prj),
    new NtracsPolygon("HLT_NHB2T", [23, 22, 29, 30, 31], prj),
    new NtracsPolygon("NHB_HLT2T", [28, 27, 32, 33, 34, 35], prj),
    new NtracsPolygon("NHB5LT", [36, 14, 18, 37], prj),
    new NtracsPolygon("NHB4RT", [38, 15, 14, 36], prj),
    new NtracsPolygon("NHB_HLT1T", [33, 32, 39, 40], prj),
    new NtracsPolygon("HLT2LT", [31, 30, 41, 40, 39], prj)
  ];
  for (let key = 0; key < prj.polygons.length; key++) {
    const poly = prj.polygons[key];
    for (const v of poly.vertex) {
      if (prj.vertex[v].poly) {
        prj.vertex[v].poly?.push(poly);
      } else {
        prj.vertex[v].poly = [poly];
      }
    }
    poly.createPolygon();
  }
  prj.tracks = await window.electronAPI.loadRomTrack();
  prj.addAndDrawComponents(
    graphics,
    "default",
    await window.electronAPI.loadAddon()
  );
  return prj;
}
