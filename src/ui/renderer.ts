/// <reference path="./renderer.d.ts" />
import * as __PIXI from "pixi.js";
declare const PIXI: typeof __PIXI;

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  background: 0xe0e0e0
});

const parentApp = <HTMLDivElement>document.getElementById("canvas");

class Vertex {
  x: number;
  z: number;
  constructor(x: number, z: number) {
    this.x = x;
    this.z = z;
  }
  poly?: NtracsPolygon[];
}

class NtracsPolygon {
  vertex: number[];
  polygon?: __PIXI.Polygon;
  constructor(vertex: number[]) {
    this.vertex = vertex;
  }

  createPolygon(): __PIXI.Polygon {
    this.polygon = new PIXI.Polygon(
      this.vertex.map(
        (v) => <__PIXI.IPointData>{ x: vertex[v].x, y: vertex[v].z }
      )
    );
    return this.polygon;
  }

  getPolygon(): __PIXI.Polygon {
    return this.polygon || this.createPolygon();
  }
}

let vertex: Vertex[] = [
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
];
let polydata: { [name: string]: NtracsPolygon } = {
  NHB3T: new NtracsPolygon([1, 2, 3, 4]),
  NHB2T: new NtracsPolygon([4, 3, 5, 6]),
  NHB1RT: new NtracsPolygon([2, 7, 8, 3]),
  NHB2LT: new NtracsPolygon([3, 8, 9, 5]),
  NHB1T: new NtracsPolygon([6, 5, 10, 11]),
  NHB4T: new NtracsPolygon([12, 13, 2, 1]),
  NHB33AT: new NtracsPolygon([14, 15, 16, 12, 1, 4, 17]),
  NHB33BT: new NtracsPolygon([18, 14, 17, 4, 6, 11, 19]),
  HLT_NHB1T: new NtracsPolygon([7, 20, 21, 22, 23, 24, 8]),
  NHB_HLT3T: new NtracsPolygon([8, 24, 25, 26, 27, 28]),
  HLT_NHB2T: new NtracsPolygon([23, 22, 29, 30, 31]),
  NHB_HLT2T: new NtracsPolygon([28, 27, 32, 33, 34, 35]),
  NHB5LT: new NtracsPolygon([36, 14, 18, 37]),
  NHB4RT: new NtracsPolygon([38, 15, 14, 36]),
  NHB_HLT1T: new NtracsPolygon([33, 32, 39, 40]),
  HLT2LT: new NtracsPolygon([31, 30, 41, 40, 39])
};

let canvasMove = {
  left: -1500,
  top: -3750,
  scale: 3
};

for (const key in polydata) {
  if (Object.prototype.hasOwnProperty.call(polydata, key)) {
    const poly = polydata[key];
    for (const v of poly.vertex) {
      if (vertex[v].poly) {
        vertex[v].poly?.push(poly);
      } else {
        vertex[v].poly = [poly];
      }
    }
    poly.createPolygon();
  }
}

const mainContainer = new PIXI.Container();
let polygonGraphics = new PIXI.Graphics();

moveView();
app.stage.addChild(mainContainer);

function moveView() {
  mainContainer.x = canvasMove.left * canvasMove.scale + innerWidth / 2;
  mainContainer.y = canvasMove.top * canvasMove.scale + innerHeight / 2;
  mainContainer.scale.x = canvasMove.scale;
  mainContainer.scale.y = -canvasMove.scale;
}

parentApp.appendChild(<HTMLCanvasElement>app.view);
addEventListener("load", async () => {
  const islandData = await window.electronAPI.loadRomTrack();
  const componentsData = await window.electronAPI.loadAddon();

  const graphics = new PIXI.Graphics();

  for (let ix = -1000; ix <= 10 * 1000; ix += 1000) {
    for (let iy = -12000 + (ix % 2000); iy <= -3 * 1000; iy += 2000) {
      graphics.beginFill(0xf0f0f0);
      graphics.drawRect(ix - 500, iy + 500, 1000, 1000);
      graphics.endFill();
    }
  }

  console.log(islandData);
  graphics.lineStyle(4, 0xffd000, 1);
  for (const key in islandData) {
    if (Object.prototype.hasOwnProperty.call(islandData, key)) {
      const i = islandData[key];
      for (const j of i.links) {
        if (islandData[j]?.x && islandData[j]?.z) {
          graphics.moveTo(i.x, i.z);
          graphics.lineTo(islandData[j].x, islandData[j].z);
        }
      }
    }
  }
  graphics.lineStyle(1, 0xff8000, 1);
  for (const key in islandData) {
    if (Object.prototype.hasOwnProperty.call(islandData, key)) {
      const i = islandData[key];
      for (const j of i.links) {
        if (islandData[j]?.x && islandData[j]?.z) {
          graphics.moveTo(i.x, i.z);
          graphics.lineTo(islandData[j].x, islandData[j].z);
        }
      }
      if (i.links.length > 2) {
        graphics.drawCircle(i.x, i.z, 1);
      }
    }
  }

  drawPolygons();

  console.log(componentsData);
  for (const c of componentsData) {
    const basicText = new PIXI.Text(c.tag || "", {
      fontFamily: "Consolas, monospace",
      fontSize: 20
    });
    basicText.x = c.x + 0.8;
    basicText.y = c.z + 0.8;
    basicText.scale.x = 0.1;
    basicText.scale.y = -0.1;

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
  mainContainer.addChild(graphics);
  mainContainer.addChild(polygonGraphics);
});

addEventListener("resize", () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  moveView();
});

let nearestVertex: number | undefined = undefined;

let circle: __PIXI.Graphics | undefined;
app.ticker.add(() => {
  if (nearestVertex) {
    if (!circle) {
      circle = new PIXI.Graphics();
      circle.beginFill(0xff0000);
      circle.drawCircle(0, 0, 5);
      circle.endFill();
      app.stage.addChild(circle);
    }
    circle.x =
      (canvasMove.left + vertex[nearestVertex].x) * canvasMove.scale +
      innerWidth / 2;
    circle.y =
      (canvasMove.top - vertex[nearestVertex].z) * canvasMove.scale +
      innerHeight / 2;
  } else {
    circle?.destroy();
    circle = undefined;
  }
});
let mousedown = false;
function len(x1: number, y1: number, x2: number, y2: number) {
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}
parentApp.addEventListener("mousemove", (e) => {
  let length = 8.0 / canvasMove.scale;
  length *= length;

  const mouse_ax = -(
    (innerWidth / 2 - e.clientX) / canvasMove.scale +
    canvasMove.left
  );
  const mouse_az =
    (innerHeight / 2 - e.clientY) / canvasMove.scale + canvasMove.top;

  if (!mousedown) {
    nearestVertex = undefined;
    for (let j = 0; j < vertex.length; j++) {
      const i = vertex[j];

      if (len(mouse_ax, mouse_az, i.x, i.z) < length) {
        console.log(len(mouse_ax, mouse_az, i.x, i.z));
        length = len(mouse_ax, mouse_az, i.x, i.z);
        nearestVertex = j;
      }
    }
  } else if (nearestVertex && mousedown) {
    vertex[nearestVertex].x = Math.floor(mouse_ax * 10) / 10.0;
    vertex[nearestVertex].z = Math.floor(mouse_az * 10) / 10.0;

    const ps = vertex[nearestVertex].poly;
    if (ps) {
      for (const p of ps) {
        p.createPolygon();
      }
    }
    drawPolygons();
  }

  (document.getElementById("debug") as HTMLParagraphElement).innerText =
    JSON.stringify({
      x: mouse_ax.toFixed(1),
      y: mouse_az.toFixed(1),
      nearestVertex: nearestVertex
    });
});

parentApp.addEventListener("mousedown", (e) => {
  mousedown = true;
  const mouse_ax = -(
    (innerWidth / 2 - e.clientX) / canvasMove.scale +
    canvasMove.left
  );
  const mouse_az =
    (innerHeight / 2 - e.clientY) / canvasMove.scale + canvasMove.top;
  for (const key in polydata) {
    if (Object.prototype.hasOwnProperty.call(polydata, key)) {
      const element = polydata[key];
      function contains(vs: NtracsPolygon, x: number, z: number): boolean {
        const poly = vs.vertex.map((v) => vertex[v]);
        let vt: number;
        let f = false;
        for (let i = 0; i < poly.length - 1; i++) {
          if (
            (poly[i].z <= z && poly[i + 1].z > z) ||
            (poly[i].z > z && poly[i + 1].z <= z)
          ) {
            vt = (z - poly[i].z) / (poly[i + 1].z - poly[i].z);
            if (x < poly[i].x + vt * (poly[i + 1].x - poly[i].x)) {
              f = !f;
            }
          }
        }
        if (
          (poly[poly.length - 1].z <= z && poly[0].z > z) ||
          (poly[poly.length - 1].z > z && poly[0].z <= z)
        ) {
          vt =
            (z - poly[poly.length - 1].z) /
            (poly[0].z - poly[poly.length - 1].z);
          if (
            x <
            poly[poly.length - 1].x + vt * (poly[0].x - poly[poly.length - 1].x)
          ) {
            f = !f;
          }
        }
        return f;
      }

      if (contains(element, mouse_ax, mouse_az)) {
        const hud = document.getElementById("hud");
        if (hud) {
          let item = "";
          for (let i = 0; i < polydata[key].vertex.length; i++) {
            const v = polydata[key].vertex[i];
            item += `<li>${v} (${vertex[v].x.toFixed(1)},${vertex[v].z.toFixed(
              1
            )}) <button>x</button></li><li><button>+</button></li>`;
          }

          hud.innerHTML = `<h3>${key}</h3><ul>${item}</ul>`;
        }
      }
    }
  }
});

parentApp.addEventListener("mouseup", (e) => {
  mousedown = false;
  const mouse_ax = -(
    (innerWidth / 2 - e.clientX) / canvasMove.scale +
    canvasMove.left
  );
  const mouse_az =
    (innerHeight / 2 - e.clientY) / canvasMove.scale + canvasMove.top;

  if (nearestVertex) {
    let length = 8.0 / canvasMove.scale;
    length *= length;
    let newNearestVertex = nearestVertex;
    for (let j = 0; j < vertex.length; j++) {
      const i = vertex[j];
      if (j != nearestVertex && len(mouse_ax, mouse_az, i.x, i.z) < length) {
        length = len(mouse_ax, mouse_az, i.x, i.z);
        newNearestVertex = j;
      }
    }

    if (!e.shiftKey && newNearestVertex != nearestVertex) {
      const polygons = vertex[nearestVertex].poly;
      if (polygons) {
        for (const i of polygons) {
          i.vertex = <number[]>(
            i.vertex.map((v) => (v == nearestVertex ? newNearestVertex : v))
          );
          if (vertex[newNearestVertex].poly) {
            vertex[newNearestVertex].poly?.push(i);
          } else {
            vertex[newNearestVertex].poly = [i];
          }
          i.createPolygon();
        }
        vertex[nearestVertex] = new Vertex(0, 0);
        drawPolygons();
      }
    }
  }
});

parentApp.addEventListener("wheel", (e) => {
  const oldScale = canvasMove.scale;
  if (e.ctrlKey) {
    if (e.deltaY > 0) {
      canvasMove.scale = Math.max(0.5, oldScale - 0.25);
    } else {
      canvasMove.scale = Math.min(10, oldScale + 0.25);
    }
  } else if (e.shiftKey) {
    canvasMove.left -= Math.floor(e.deltaY / canvasMove.scale);
  } else {
    canvasMove.top -= Math.floor(e.deltaY / canvasMove.scale);
    canvasMove.left -= Math.floor(e.deltaX / canvasMove.scale);
  }
  moveView();
});

function drawPolygons() {
  polygonGraphics.clear();
  polygonGraphics.lineStyle(0.2, 0x0000ff, 1);
  for (const key in polydata) {
    if (Object.prototype.hasOwnProperty.call(polydata, key)) {
      polygonGraphics.beginFill(0x0000ff, 0.3);
      polygonGraphics.drawPolygon(polydata[key].getPolygon());
      polygonGraphics.endFill();
    }
  }

  polygonGraphics.lineStyle(0);
  for (const v of vertex) {
    polygonGraphics.beginFill(0x0000ff, 1);
    polygonGraphics.drawCircle(v.x, v.z, 0.4);
    polygonGraphics.endFill();
  }
}
/*
let islandData: any;
let context: CanvasRenderingContext2D | null;
let canvasMove = {
  mouseDown: false,
  left: 0,
  top: 0,
  lastMouseX: 0,
  lastMouseY: 0,
  scale: 1
};

function frame() {
  if (context && islandData) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);

    context.beginPath();

    const vpos = (sx: number, sy: number) => {
      return {
        x: (512 + sx + canvasMove.left) * canvasMove.scale,
        y: (512 - sy + canvasMove.top) * canvasMove.scale
      };
    };
    const line = (sx: number, sy: number, ex: number, ey: number) => {
      const s = vpos(sx, sy),
        e = vpos(ex, ey);
      if (context) {
        if (
          (s.x > 0 &&
            s.x < context.canvas.width &&
            s.y > 0 &&
            s.y < context.canvas.height) ||
          (e.x > 0 &&
            e.x < context.canvas.width &&
            e.y > 0 &&
            e.y < context.canvas.height)
        ) {
          context.moveTo(s.x, s.y);
          context.lineTo(e.x, e.y);
        }
      }
    };

    context.strokeStyle = "#ffc000";
    context.lineWidth = 3.5 * canvasMove.scale;
    for (const key in islandData) {
      if (Object.prototype.hasOwnProperty.call(islandData, key)) {
        const i = islandData[key];
        for (const j of i.links) {
          line(i.x, i.z, islandData[j].x, islandData[j].z);
          context.stroke();
        }
      }
    }

    context.strokeStyle = "#000000";
    context.lineWidth = 0.5;
    for (const key in islandData) {
      if (Object.prototype.hasOwnProperty.call(islandData, key)) {
        const i = islandData[key];
        for (const j of i.links) {
          line(i.x, i.z, islandData[j].x, islandData[j].z);
          context.stroke();
        }
      }
    }

    requestAnimationFrame(frame);
  }
}

addEventListener("load", async () => {
  const canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const body = document.body;
  if (canvas) {
    const width = body.clientWidth,
      height = body.clientHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
    context = canvas.getContext("2d", { alpha: false });
    islandData = await window.electronAPI.loadRomTrack();

    canvas.addEventListener("mousedown", (e) => {
      canvasMove.mouseDown = true;
      canvasMove.lastMouseX = e.clientX;
      canvasMove.lastMouseY = e.clientY;
    });

    canvas.addEventListener("mousemove", (e) => {
      if (canvasMove.mouseDown && e.shiftKey) {
        canvasMove.left +=
          (e.clientX - canvasMove.lastMouseX) / canvasMove.scale;
        canvasMove.top +=
          (e.clientY - canvasMove.lastMouseY) / canvasMove.scale;
      }
      canvasMove.lastMouseX = e.clientX;
      canvasMove.lastMouseY = e.clientY;
    });

    canvas.addEventListener("mouseup", () => {
      canvasMove.mouseDown = false;
    });

    canvas.addEventListener("wheel", (e) => {
      const oldScale = canvasMove.scale;
      if (e.ctrlKey) {
        if (e.deltaY > 0) {
          canvasMove.scale = Math.max(0.1, oldScale - 0.1);
        } else {
          canvasMove.scale = Math.min(10, oldScale + 0.1);
        }
      }
      canvasMove.left -= e.clientX / oldScale - e.clientX / canvasMove.scale;
      canvasMove.top -= e.clientY / oldScale - e.clientY / canvasMove.scale;
    });

    requestAnimationFrame(frame);
  }
});

addEventListener("resize", () => {
  const canvas = <HTMLCanvasElement>document.getElementById("canvas");
  const body = document.body;
  if (canvas) {
    const width = body.clientWidth,
      height = body.clientHeight;
    canvas.width = width * devicePixelRatio;
    canvas.height = height * devicePixelRatio;
  }
});
// */
