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

app.stage.scale.x = 5;
app.stage.scale.y = -5;

parentApp.appendChild(<HTMLCanvasElement>app.view);
addEventListener("DOMContentLoaded", async () => {
  const islandData = await window.electronAPI.loadRomTrack();
  const graphics = new PIXI.Graphics();
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
    }
  }
  app.stage.addChild(graphics);
});

let canvasMove = {
  left: 0,
  top: 0,
  scale: 5
};

addEventListener("resize", () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  app.stage.x = canvasMove.left * canvasMove.scale + innerWidth / 2;
  app.stage.y = canvasMove.top * canvasMove.scale + innerHeight / 2;
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
    canvasMove.left -= (e.deltaY / 25) * canvasMove.scale;
  } else {
    canvasMove.top -= (e.deltaY / 25) * canvasMove.scale;
  }
  app.stage.x = canvasMove.left * canvasMove.scale + innerWidth / 2;
  app.stage.y = canvasMove.top * canvasMove.scale + innerHeight / 2;
  app.stage.scale.x = canvasMove.scale;
  app.stage.scale.y = -canvasMove.scale;
  (document.getElementById("debug") as HTMLParagraphElement).innerText =
    JSON.stringify({
      x: app.stage.x,
      y: app.stage.y,
      scale: app.stage.scale.x
    });
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
