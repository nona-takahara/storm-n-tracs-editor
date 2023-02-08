/// <reference path="./renderer.d.ts" />
import * as __PIXI from "pixi.js";
import { Vertex, NtracsPolygon, NtracsProject } from "./data.js";
export declare const PIXI: typeof __PIXI;

let prj: NtracsProject;

const textSettings = {
  fontFamily: "Consolas, monospace",
  fontSize: 20 * devicePixelRatio
};

let canvasMove = {
  left: -1500,
  top: -3750,
  scale: 3
};

const app = new PIXI.Application({
  width: window.innerWidth,
  height: window.innerHeight,
  antialias: true,
  background: 0xe0e0e0
});

const parentApp = <HTMLDivElement>document.getElementById("canvas");
const mainContainer = new PIXI.Container();
let polygonGraphics = new PIXI.Graphics();

const componentGraphics = new PIXI.Graphics();
const trackGraphics = new PIXI.Graphics();

moveView();
app.stage.addChild(mainContainer);
parentApp.appendChild(<HTMLCanvasElement>app.view);

addEventListener("load", async () => {
  updateHud();

  for (let ix = -1000; ix <= 10 * 1000; ix += 1000) {
    for (let iy = -14000 + (ix % 2000); iy <= -3 * 1000; iy += 2000) {
      trackGraphics.beginFill(0xf0f0f0);
      trackGraphics.drawRect(ix - 500, iy + 500, 1000, 1000);
      trackGraphics.endFill();
    }
  }

  const res = await window.electronAPI.load();
  if (res) {
    prj = new NtracsProject(
      componentGraphics,
      res,
      await window.electronAPI.loadRomTrack()
    );
  } else {
    return;
  }

  trackGraphics.lineStyle(4, 0xffd000, 1);
  for (const key in prj.tracks) {
    if (Object.prototype.hasOwnProperty.call(prj.tracks, key)) {
      const i = prj.tracks[key];
      for (const j of i.links) {
        if (prj.tracks[j]?.x && prj.tracks[j]?.z) {
          trackGraphics.moveTo(i.x, i.z);
          trackGraphics.lineTo(prj.tracks[j].x, prj.tracks[j].z);
        }
      }
    }
  }
  trackGraphics.lineStyle(1, 0xff8000, 1);
  for (const key in prj.tracks) {
    if (Object.prototype.hasOwnProperty.call(prj.tracks, key)) {
      const i = prj.tracks[key];
      for (const j of i.links) {
        if (prj.tracks[j]?.x && prj.tracks[j]?.z) {
          trackGraphics.moveTo(i.x, i.z);
          trackGraphics.lineTo(prj.tracks[j].x, prj.tracks[j].z);
        }
      }
      if (i.links.length > 2) {
        trackGraphics.drawCircle(i.x, i.z, 1);
      }
    }
  }

  refreshUI();

  mainContainer.addChild(trackGraphics);
  mainContainer.addChild(componentGraphics);
  mainContainer.addChild(polygonGraphics);
});

addEventListener("resize", () => {
  app.renderer.resize(window.innerWidth, window.innerHeight);
  moveView();
});

function moveView() {
  mainContainer.x = canvasMove.left * canvasMove.scale + innerWidth / 2;
  mainContainer.y = canvasMove.top * canvasMove.scale + innerHeight / 2;
  mainContainer.scale.x = canvasMove.scale;
  mainContainer.scale.y = -canvasMove.scale;
}

let nearestVertex: number | undefined = undefined;

let circle: __PIXI.Graphics | undefined;
let circleText: __PIXI.Text | undefined;
app.ticker.add(() => {
  if (nearestVertex) {
    if (!circle) {
      circle = new PIXI.Graphics();
      circle.beginFill(0xff0000);
      circle.drawCircle(0, 0, 5);
      circle.endFill();
      app.stage.addChild(circle);
    }
    if (!circleText) {
      circleText = new PIXI.Text(nearestVertex.toString(), {
        ...textSettings,
        fill: "#ff0000",
        stroke: "#ffffff",
        strokeThickness: 3 * devicePixelRatio
      });
      circleText.y = -10;
      circleText.x = 8;
      circleText.scale.x = 0.8 / devicePixelRatio;
      circleText.scale.y = 0.8 / devicePixelRatio;
      circle.addChild(circleText);
    } else {
      circleText.text = nearestVertex.toString();
    }
    circle.x =
      (canvasMove.left + prj.vertex[nearestVertex].x) * canvasMove.scale +
      innerWidth / 2;
    circle.y =
      (canvasMove.top - prj.vertex[nearestVertex].z) * canvasMove.scale +
      innerHeight / 2;
  } else {
    circleText?.destroy();
    circle?.destroy();
    circleText = undefined;
    circle = undefined;
  }
});

let mousedown = false;
let mouseRdown = false;
function len(x1: number, y1: number, x2: number, y2: number) {
  return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
}

function mousePos(e: MouseEvent) {
  return {
    x: -((innerWidth / 2 - e.clientX) / canvasMove.scale + canvasMove.left),
    z: (innerHeight / 2 - e.clientY) / canvasMove.scale + canvasMove.top
  };
}

let lastMousePos: { x: number; z: number } = { x: 0, z: 0 };

parentApp.addEventListener("mousemove", (e) => {
  const m = mousePos(e);
  if (!mouseRdown) {
    lastMousePos = m;
    updateHud();
  }

  if (!mousedown) {
    nearestVertex = prj?.searchNearestVertex(m.x, m.z, 8.0 / canvasMove.scale);
  } else if (nearestVertex && mousedown) {
    prj.vertex[nearestVertex].x = Math.floor(m.x * 10) / 10.0;
    prj.vertex[nearestVertex].z = Math.floor(m.z * 10) / 10.0;
    const ps = prj.vertex[nearestVertex].poly;
    if (ps) {
      for (const p of ps) {
        p.createPolygon();
      }
    }
    refreshUI();
  }
});

let selectedPolygon: number | undefined = undefined;
let newPolygon = false;

parentApp.addEventListener("mousedown", (e) => {
  mousedown = true;
  const m = mousePos(e);
  lastMousePos = m;
  mouseRdown = e.button == 2;

  if (newPolygon) {
    if (selectedPolygon) {
      if (nearestVertex) {
        if (prj.polygons[selectedPolygon].vertex[0] == nearestVertex) {
          newPolygon = false;
        } else {
          prj.polygons[selectedPolygon].vertex.push(nearestVertex);
          prj.vertex[nearestVertex].poly?.push(prj.polygons[selectedPolygon]);
        }
      } else {
        const v = new Vertex(m.x, m.z);
        v.poly = [prj.polygons[selectedPolygon]];
        prj.vertex.push(v);
        prj.polygons[selectedPolygon].vertex.push(prj.vertex.length - 1);
      }
    } else {
      newPolygon = false;
    }
    refreshUI();
  } else if (!nearestVertex || !selectedPolygon) {
    selectedPolygon = undefined;
    for (let key = 0; key < prj.polygons.length; key++) {
      const element = prj.polygons[key];
      function contains(vs: NtracsPolygon, x: number, z: number): boolean {
        const poly = vs.vertex.map((v) => prj.vertex[v]);
        let vt: number;
        let f = false;
        if (poly.length < 2) {
          return false;
        }
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

      if (contains(element, m.x, m.z)) {
        selectedPolygon = key;
      }
    }
    refreshUI();
  }
});

function updateHud() {
  const hud = document.getElementById("hud");
  if (hud) {
    while (hud.firstChild) {
      hud.removeChild(hud.firstChild);
    }
    const p = document.createElement("p");
    p.innerText = `${lastMousePos.x.toFixed(1)}, ${lastMousePos.z.toFixed(
      1
    )} : ${mlen.toFixed(1)}`;
    hud.appendChild(p);

    if (newPolygon) {
      const p = document.createElement("p");
      p.innerText = "New polygon mode: click first vertex to finish";
      hud.appendChild(p);
    }

    if (selectedPolygon) {
      const name_h3 = document.createElement("h3");
      name_h3.innerText = prj.polygons[selectedPolygon].name;

      const name_input = document.createElement("input");
      name_input.value = prj.polygons[selectedPolygon].name;
      name_input.addEventListener("input", () => {
        ss.name = name_input.value;
        name_h3.innerText = ss.name;
      });
      hud.appendChild(name_h3);

      const rvbutton = document.createElement("button");
      rvbutton.innerText = "reverse";
      rvbutton.addEventListener("click", () => {
        if (selectedPolygon) {
          prj.polygons[selectedPolygon].vertex =
            prj.polygons[selectedPolygon].vertex.reverse();
          prj.polygons[selectedPolygon].createPolygon();
          updateHud();
        }
      });

      const rmbutton = document.createElement("button");
      rmbutton.innerText = "remove";
      rmbutton.addEventListener("click", () => {
        if (
          selectedPolygon &&
          confirm(`Remove ${prj.polygons[selectedPolygon].name} ?`)
        ) {
          prj.polygons.splice(selectedPolygon, 1);
          selectedPolygon = undefined;

          refreshUI();
        }
      });
      hud.appendChild(rvbutton);
      hud.appendChild(rmbutton);

      hud.appendChild(name_input);

      const ul = document.createElement("ul");
      const ss = prj.polygons[selectedPolygon];
      for (let i = 0; i < prj.polygons[selectedPolygon].vertex.length; i++) {
        const v = prj.polygons[selectedPolygon].vertex[i];

        const li1 = document.createElement("li");
        li1.innerText = `${v} (${prj.vertex[v].x.toFixed(1)},${prj.vertex[
          v
        ].z.toFixed(1)})`;
        const delbutton = document.createElement("button");
        delbutton.innerText = "x";

        delbutton.addEventListener("click", () => {
          if (ss) {
            const [data] = ss.vertex.splice(i, 1);
            const polys = prj.vertex[data].poly;
            const did = polys?.findIndex((s) => s == ss);
            if (polys && did) {
              polys.splice(did, 1);
              if (polys.length <= 0) {
                prj.vertex[data] = new Vertex(0, 0);
              }
            }
          }
          ss.vertex = [...ss.vertex];
          ss.createPolygon();
          refreshUI();
        });
        if (ss.vertex.length > 3) {
          li1.appendChild(delbutton);
        }

        const li2 = document.createElement("li");
        const addbutton = document.createElement("button");
        addbutton.innerHTML = "+";
        addbutton.addEventListener("click", () => {
          if (selectedPolygon) {
            const s = prj.vertex[ss.vertex[i]];
            const e = prj.vertex[ss.vertex[(i + 1) % ss.vertex.length]];
            prj.vertex.push(new Vertex((s.x + e.x) / 2, (s.z + e.z) / 2));
            prj.vertex[prj.vertex.length - 1].poly = [ss];
            ss.vertex.splice(i + 1, 0, prj.vertex.length - 1);
            ss.vertex = [...ss.vertex];
            ss.createPolygon();
            refreshUI();
          }
        });
        li2.appendChild(addbutton);
        ul.appendChild(li1);
        ul.appendChild(li2);
      }
      hud.appendChild(ul);
    } else {
      const load = document.createElement("button");
      load.innerText = "Load";
      load.addEventListener("click", async () => {
        const res = await window.electronAPI.load();
        if (res) {
          prj = new NtracsProject(
            componentGraphics,
            res,
            await window.electronAPI.loadRomTrack()
          );
          selectedPolygon = undefined;
          refreshUI();
        }
      });
      hud.appendChild(load);

      const save = document.createElement("button");
      save.innerText = "Save";
      save.addEventListener("click", () => {
        window.electronAPI.save(JSON.stringify(prj));
      });
      hud.appendChild(save);

      const add = document.createElement("button");
      add.innerText = "Add add-on";
      add.addEventListener("click", async () => {
        prj.addAndDrawComponents(
          componentGraphics,
          await window.electronAPI.loadAddon()
        );
      });
      hud.appendChild(add);

      const create = document.createElement("button");
      create.innerHTML = "Create Polygon";
      create.addEventListener("click", () => {
        prj.polygons.push(
          new NtracsPolygon(`Area_${prj.polygons.length}`, [], prj)
        );
        selectedPolygon = prj.polygons.length - 1;
        newPolygon = true;
      });
      hud.appendChild(create);
    }
  }
}

let mlen = 0;
parentApp.addEventListener("mouseup", (e) => {
  mousedown = false;
  if (mouseRdown) {
    const m = mousePos(e);
    mlen = Math.sqrt(len(lastMousePos.x, lastMousePos.z, m.x, m.z));
    mouseRdown = false;
  }

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
    for (let j = 0; j < prj.vertex.length; j++) {
      const i = prj.vertex[j];
      if (j != nearestVertex && len(mouse_ax, mouse_az, i.x, i.z) < length) {
        length = len(mouse_ax, mouse_az, i.x, i.z);
        newNearestVertex = j;
      }
    }

    if (!e.shiftKey && newNearestVertex != nearestVertex) {
      const polygons = prj.vertex[nearestVertex].poly;
      if (polygons) {
        for (const i of polygons) {
          i.vertex = <number[]>(
            i.vertex.map((v) => (v == nearestVertex ? newNearestVertex : v))
          );
          if (prj.vertex[newNearestVertex].poly) {
            prj.vertex[newNearestVertex].poly?.push(i);
          } else {
            prj.vertex[newNearestVertex].poly = [i];
          }
          i.createPolygon();
        }
        prj.vertex[nearestVertex] = new Vertex(0, 0);
        refreshUI();
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

function refreshUI() {
  drawPolygons();
  updateHud();
}

function drawPolygons() {
  polygonGraphics.clear();
  polygonGraphics.lineStyle(0.2, 0x0000ff, 1);
  for (let key = 0; key < prj.polygons.length; key++) {
    if (key == selectedPolygon) {
      polygonGraphics.beginFill(0x8080ff, 0.3);
    } else {
      polygonGraphics.beginFill(0x0000ff, 0.3);
    }
    polygonGraphics.drawPolygon(prj.polygons[key].getPolygon());
    polygonGraphics.endFill();
  }

  polygonGraphics.lineStyle(0);
  for (const v of prj.vertex) {
    polygonGraphics.beginFill(0x0000ff, 1);
    polygonGraphics.drawCircle(v.x, v.z, 0.4);
    polygonGraphics.endFill();
  }
}
