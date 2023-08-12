import { useReducer, useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Nav from "./ui/Nav";
import { Stage, Container, Text } from "@pixi/react";
import AreaPolygonsView from "./ui/AreaPolygonsView";
import Project from "./data/Project";
import Vector2d from "./data/Vector2d";
import WorldTrackView from "./ui/WorldTrackView";
import StormTracks from "./data/StormTracks";
import { XMLParser } from "fast-xml-parser";
import DEBUG_VALUES from "./debug_value.json";
import AreaPolygon from "./data/AreaPolygon";
import DebugView from "./ui/DebugView";
import { Button } from "@blueprintjs/core";
import InfoView from "./ui/InfoView";
import { TextStyle } from "pixi.js";

const useWindowSize = (): number[] => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener('resize', updateSize);
    updateSize();

    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
};

function read_file_command(filepath: string) {
  return invoke("read_file_command", { path: filepath }) as Promise<string>;
}

function mousePos(e: React.MouseEvent, innerWidth: number, innerHeight: number, leftPos: number, topPos: number, scale: number): Vector2d {
  return new Vector2d(-((innerWidth / 2 - e.clientX) / scale + leftPos), (innerHeight / 2 - e.clientY) / scale + topPos);
}

function len(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

function projectReducer(project: Project, action: any) {
  if (action.type == 'move_vertex') {
    const m = new Map([...project.vertexes]);
    m.set(action.target, new Vector2d(action.x, action.z));
    return Object.assign(project, {
      vertexes: m
    }) as Project;
  } else if (action.type == 'reload') {
    return Project.createTestData();
  }
  return project;
}

function App() {
  const [width, height] = useWindowSize();
  const [leftPos, setLeftPos] = useState(-1500);
  const [topPos, setTopPos] = useState(-4000);
  const [scale, setScale] = useState(1);

  const [mouseLeftButtonDown, setMouseLeftButtonDown] = useState(false);
  const [mouseX, setMouseX] = useState(-100000);
  const [mouseZ, setMouseZ] = useState(-100000);

  const [project, projectDispatch] = useReducer(projectReducer, Project.createTestData());
  const [tracks, setTracks] = useState<StormTracks[]>([]);
  const [nearestVertex, setNearestVertex] = useState<string | undefined>(undefined);
  const [selectedPolygon, setSelectedPolygon] = useState<AreaPolygon | undefined>(undefined);

  function reload() {
    console.clear();
    projectDispatch({ type: 'reload'});
    setTracks([]);
    for (let x = 0; x <= 16; x++) {
      for (let y = 0; y <= 9; y++) {
        read_file_command(DEBUG_VALUES.tile_dir + `mega_island_${x}_${y}.xml`).then(
          (str) => {
            const xmlParser = new XMLParser({
              ignoreAttributes: false,
              ignoreDeclaration: true
            });
            setTracks((old) => {
              const list = old.slice();
              list[(x)*10+y] = StormTracks.loadFromXML((x-8)*1000, (y*1000)-12000, xmlParser.parse(str));
              return list;
            });
          }
        ).catch(() => console.log(x,y));
      }
    }
    
  }

  const wheelEvent = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.ctrlKey) {
      if (e.deltaY > 0) {
        setScale(Math.max(0.25, scale - 0.25));
      } else {
        setScale(Math.min(10, scale + 0.25));
      }
    } else if (e.shiftKey) {
      setLeftPos(leftPos - Math.floor(e.deltaY / scale));
    } else {
      setTopPos(topPos - Math.floor(e.deltaY / scale));
      setLeftPos(leftPos - Math.floor(e.deltaX / scale));
    }
    const m = mousePos(e, width, height, leftPos, topPos, scale);
    setMouseX(m.x);
    setMouseZ(m.z);
  };

  const mouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const m = mousePos(e, width, height, leftPos, topPos, scale);
    setMouseX(m.x);
    setMouseZ(m.z);

    if (!mouseLeftButtonDown) {
      if (project) {
        let rets: string | undefined = undefined;
        let length = 1;
        for (const [k, v] of project.vertexes.entries()) {
          const len_to_vx = len(m.x, m.z, v.x, v.z);
          if (len_to_vx < length) {
            length = len_to_vx;
            rets = k;
          }
        }
        setNearestVertex(rets);
      } else {
        setNearestVertex(undefined);
      }
    } else {
      if (nearestVertex !== undefined) {
        projectDispatch({
          type: 'move_vertex',
          with_join: true,
          x: Math.floor(m.x * 10) / 10,
          z: Math.floor(m.z * 10) / 10,
          target: nearestVertex
        })
      }
    }
  }

  const mouseDown = (e: React.MouseEvent) => {
    const m = mousePos(e, width, height, leftPos, topPos, scale);
    if (e.button == 0) {
      setMouseLeftButtonDown(true);
      if (project) {
        for (const item of project.areas) {
          if (project.isInArea(item, m.x, m.z)) {
            setSelectedPolygon(item);
            return;
          }
        }
        setSelectedPolygon(undefined);
      }
    }
  }

  const mouseUp = (e: React.MouseEvent) => {
    if (e.button == 0) {
      setMouseLeftButtonDown(false);
    }
  }

  const mouseLeave = (e: React.MouseEvent) => {
    setMouseLeftButtonDown(false);
  };

  const nv = nearestVertex && project.vertexes.get(nearestVertex);

  return (
    <>
      <Nav></Nav>
      <DebugView>
        {leftPos},{topPos},{scale} | {mouseLeftButtonDown.toString()}, {mouseX >> 1},{mouseZ >> 1} | {nearestVertex}<br /><Button onClick={reload}>Reload</Button>
      </DebugView>
      <InfoView project={project} selectedArea={selectedPolygon}></InfoView>
      <Stage
        width={width}
        height={height}
        options={{
          antialias: true,
          background: 0xe0e0e0
        }}
        style={{ margin: 0 }}
        onWheel={wheelEvent}
        onMouseDown={mouseDown}
        onMouseUp={mouseUp}
        onMouseLeave={mouseLeave}
        onMouseMove={mouseMove}
      >
        <Container
          position={[
            leftPos * scale + width / 2,
            topPos * scale + height / 2]}
          scale={scale}
        >
          <WorldTrackView project={project} tracks={tracks} />
          <AreaPolygonsView project={project} nearestIndex={nearestVertex} selectedArea={selectedPolygon} />
          {nv && <Text
            text={nearestVertex}
            anchor={0.5}
            x={nv.x}
            y={-nv.z-(20/scale)}
            scale={
              {x: 0.8 / scale, y: 0.8 / scale}
            }
            style={new TextStyle(
              {
                fontFamily: "Consolas, monospace",
                fontSize: 20 * devicePixelRatio
              }
            )}
          />}
        </Container>
      </Stage>
    </>
  );
}

export default App;
