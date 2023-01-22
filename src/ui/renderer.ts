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

let vertex = [
  { x: 1417.5, z: -3758.5 },
  { x: 1160, z: -3756.3 },
  { x: 1159.8, z: -3764.6 },
  { x: 1417, z: -3767.1 },
  { x: 1417, z: -3767.1 },
  { x: 1159.8, z: -3764.6 },
  { x: 1159.3, z: -3773.9 },
  { x: 1416.1, z: -3776.2 },
  { x: 1160, z: -3756.3 },
  { x: 1116.2, z: -3758.9 },
  { x: 1116.7, z: -3768.1 },
  { x: 1159.8, z: -3764.6 },
  { x: 1159.8, z: -3764.6 },
  { x: 1116.7, z: -3768.1 },
  { x: 1117, z: -3778.7 },
  { x: 1159.3, z: -3773.9 },
  { x: 1416.1, z: -3776.2 },
  { x: 1159.3, z: -3773.9 },
  { x: 1292.5, z: -3785.8 },
  { x: 1415.6, z: -3786.5 },
  { x: 1418.2, z: -3748.6 },
  { x: 1293, z: -3744.7 },
  { x: 1160, z: -3756.3 },
  { x: 1417.5, z: -3758.5 },
  { x: 1625.7, z: -3768.2 },
  { x: 1625.4, z: -3761.9 },
  { x: 1472.9, z: -3760.2 },
  { x: 1418.2, z: -3748.6 },
  { x: 1417.5, z: -3758.5 },
  { x: 1417, z: -3767.1 },
  { x: 1497.9, z: -3768.1 },
  { x: 1625.4, z: -3776.3 },
  { x: 1625.7, z: -3768.2 },
  { x: 1497.9, z: -3768.1 },
  { x: 1417, z: -3767.1 },
  { x: 1416.1, z: -3776.2 },
  { x: 1415.6, z: -3786.5 },
  { x: 1472.5, z: -3775.4 },
  { x: 1116.2, z: -3758.9 },
  { x: 993.7, z: -3770 },
  { x: 871.3, z: -3847.9 },
  { x: 561.7, z: -4137.2 },
  { x: 567.8, z: -4145.1 },
  { x: 1003.3, z: -3797.3 },
  { x: 1116.7, z: -3768.1 },
  { x: 1116.7, z: -3768.1 },
  { x: 1003.3, z: -3797.3 },
  { x: 854.3, z: -3969.7 },
  { x: 907, z: -4159.4 },
  { x: 1196.4, z: -4471.8 },
  { x: 1202.3, z: -4466.5 },
  { x: 567.8, z: -4145.1 },
  { x: 561.7, z: -4137.2 },
  { x: -44, z: -4506.7 },
  { x: 170.9, z: -4510.9 },
  { x: 186.7, z: -4518.1 },
  { x: 1202.3, z: -4466.5 },
  { x: 1196.4, z: -4471.8 },
  { x: 720.2, z: -4987.8 },
  { x: 717, z: -5006.6 },
  { x: 1123, z: -5108.3 },
  { x: 1340, z: -4621.3 },
  { x: 1897, z: -3767.7 },
  { x: 1625.7, z: -3768.2 },
  { x: 1625.4, z: -3776.3 },
  { x: 1896.7, z: -3774.1 },
  { x: 1896.8, z: -3761.3 },
  { x: 1625.4, z: -3761.9 },
  { x: 1625.7, z: -3768.2 },
  { x: 1897, z: -3767.7 },
  { x: 717, z: -5006.6 },
  { x: 720.2, z: -4987.8 },
  { x: 257.7, z: -4785.1 },
  { x: 248.7, z: -4802.1 },
  { x: 186.7, z: -4518.1 },
  { x: 170.9, z: -4510.9 },
  { x: 40.9, z: -4725.6 },
  { x: 248.7, z: -4802.1 },
  { x: 257.7, z: -4785.1 }
];
let polydata: { [name: string]: any } = {
  NHB3T: { links: [], vertex: [0, 1, 2, 3] },
  NHB2T: { links: [], vertex: [4, 5, 6, 7] },
  NHB1RT: { links: [], vertex: [8, 9, 10, 11] },
  NHB2LT: { links: [], vertex: [12, 13, 14, 15] },
  NHB1T: { links: [], vertex: [16, 17, 18, 19] },
  NHB4T: { links: [], vertex: [20, 21, 22, 23] },
  NHB33AT: { links: [], vertex: [24, 25, 26, 27, 28, 29, 30] },
  NHB33BT: { links: [], vertex: [31, 32, 33, 34, 35, 36, 37] },
  HLT_NHB1T: { links: [], vertex: [38, 39, 40, 41, 42, 43, 44] },
  NHB_HLT3T: { links: [], vertex: [45, 46, 47, 48, 49, 50] },
  HLT_NHB2T: { links: [], vertex: [51, 52, 53, 54, 55] },
  NHB_HLT2T: { links: [], vertex: [56, 57, 58, 59, 60, 61] },
  NHB5LT: { links: [], vertex: [62, 63, 64, 65] },
  NHB4RT: { links: [], vertex: [66, 67, 68, 69] },
  NHB_HLT1T: { links: [], vertex: [70, 71, 72, 73] },
  HLT2LT: { links: [], vertex: [74, 75, 76, 77, 78] }
};

let canvasMove = {
  left: -1500,
  top: -3750,
  scale: 3
};
moveView();

function moveView() {
  app.stage.x = canvasMove.left * canvasMove.scale + innerWidth / 2;
  app.stage.y = canvasMove.top * canvasMove.scale + innerHeight / 2;
  app.stage.scale.x = canvasMove.scale;
  app.stage.scale.y = -canvasMove.scale;

  (document.getElementById("debug") as HTMLParagraphElement).innerText =
    JSON.stringify({
      x: app.stage.x,
      y: app.stage.y,
      scale: app.stage.scale.x,
      left: canvasMove.left,
      top: canvasMove.top
    });
}

parentApp.appendChild(<HTMLCanvasElement>app.view);
addEventListener("DOMContentLoaded", async () => {
  const islandData = await window.electronAPI.loadRomTrack();
  const componentsData = await window.electronAPI.loadAddon();
  const graphics = new PIXI.Graphics();
  for (let ix = -1000; ix <= 10 * 1000; ix += 1000) {
    for (let iy = -10000 + (ix % 2000); iy <= -3 * 1000; iy += 2000) {
      graphics.beginFill(0xf0f0f0);
      graphics.drawRect(ix - 500, iy + 500, 1000, 1000);
      graphics.endFill();
    }
  }

  graphics.lineStyle(4, 0xffd000, 1);
  for (const key in islandData) {
    if (Object.prototype.hasOwnProperty.call(islandData, key)) {
      const i = islandData[key];
      for (const j of i.links) {
        graphics.moveTo(i.x, i.z);
        graphics.lineTo(islandData[j].x, islandData[j].z);
      }
    }
  }
  graphics.lineStyle(1, 0xff8000, 1);
  for (const key in islandData) {
    if (Object.prototype.hasOwnProperty.call(islandData, key)) {
      const i = islandData[key];
      for (const j of i.links) {
        graphics.moveTo(i.x, i.z);
        graphics.lineTo(islandData[j].x, islandData[j].z);
      }
      if (i.links.length > 2) {
        graphics.drawCircle(i.x, i.z, 1);
      }
    }
  }

  graphics.lineStyle(0.2, 0x0000ff, 1);
  for (const key in polydata) {
    if (Object.prototype.hasOwnProperty.call(polydata, key)) {
      const p: any = polydata[key];
      const pp = new PIXI.Polygon(
        (p.vertex as Array<any>).map(
          (v: any) => <__PIXI.IPointData>{ x: vertex[v].x, y: vertex[v].z }
        )
      );
      pp.closeStroke = true;
      graphics.beginFill(0x0000ff, 0.3);
      graphics.drawPolygon(pp);
      graphics.endFill();
    }
  }

  app.stage.addChild(graphics);

  console.log(componentsData);
  for (const c of componentsData) {
    if ((c.tag as string).includes("stake")) {
      graphics.lineStyle(0);
      graphics.beginFill(0xff0000, 1);
      graphics.drawCircle(c.x, c.z, 0.5);
      graphics.endFill();
    } else {
      graphics.lineStyle(0.1, 0xff3000, 1);
      graphics.beginFill(0xff3000, 0.4);
      graphics.drawCircle(c.x, c.z, 1.5);
      graphics.endFill();
    }
  }
});

addEventListener("resize", () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  moveView();
});

parentApp.addEventListener("mousedown", (e) => {});

parentApp.addEventListener("mousemove", (e) => {});

parentApp.addEventListener("mouseup", () => {});

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
  }
  moveView();
});

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
