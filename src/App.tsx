import { useEffect, useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Nav from "./ui/Nav";
import { Stage, Container } from "@pixi/react";
import AreaPolygonsView from "./ui/AreaPolygonsView";
import Project from "./data/Project";
import Vector2d from "./data/Vector2d";
import WorldTrackView from "./ui/WorldTrackView";
import StormTracks from "./data/StormTracks";
import { XMLParser } from "fast-xml-parser";
import DEBUG_VALUES from "./debug_value.json";

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

function App() {
  const [width, height] = useWindowSize();
  const [leftPos, setLeftPos] = useState(-1500);
  const [topPos, setTopPos] = useState(-4000);
  const [scale, setScale] = useState(1);
  const [project, setProject] = useState<Project | undefined>(undefined);
  const [mouseLeftButtonDown, setMouseLeftButtonDown] = useState(false);
  const [mouseX, setMouseX] = useState(-100000);
  const [mouseZ, setMouseZ] = useState(-100000);
  const [tracks, setTracks] = useState<StormTracks[]>([]);

  if (project == undefined) {
    setProject(Project.createTestData())
  }

  if (tracks.length == 0) {
    read_file_command(DEBUG_VALUES.tile_dir + "mega_island_11_1.xml").then(
      (str) => {
        const xmlParser = new XMLParser({
          ignoreAttributes: false,
          ignoreDeclaration: true
        });
        setTracks([StormTracks.loadFromXML(xmlParser.parse(str))]);
      }
    );
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
    //if (!mouseRdown) {
    //  lastMousePos = m;
    //  updateHud();
    //}

    /*if (!mouseLeftButtonDown) {
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
    }*/
  }


  return (
    <>
      <Nav></Nav>
      <div><br />{leftPos},{topPos},{scale} | {mouseLeftButtonDown.toString()}, {mouseX} {mouseZ} </div>
      <Stage
        width={width}
        height={height}
        options={{
          antialias: true,
          background: 0xe0e0e0
        }}
        style={{ margin: 0 }}
        onWheel={wheelEvent}
        onMouseDown={() => setMouseLeftButtonDown(true)}
        onMouseUp={() => setMouseLeftButtonDown(false)}
        onMouseLeave={() => setMouseLeftButtonDown(false)}
        onMouseMove={mouseMove}
      >
        <Container
          position={[
            leftPos * scale + width / 2,
            topPos * scale + height / 2]}
          scale={scale}
        >
          <WorldTrackView project={project} />
          <AreaPolygonsView project={project} />
        </Container>
      </Stage>
    </>
  );
}

export default App;
