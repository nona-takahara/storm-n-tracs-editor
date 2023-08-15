import { useReducer, useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Nav from "./ui/Nav";
import { Stage, Container, Text } from "@pixi/react";
import AreaPolygonsView from "./ui/PixiView/AreaPolygonsView";
import Project from "./data/Project";
import Vector2d from "./data/Vector2d";
import WorldTrackView from "./ui/PixiView/WorldTrackView";
import StormTracks from "./data/StormTracks";
import { XMLParser } from "fast-xml-parser";
import DEBUG_VALUES from "./debug_value.json";
import AreaPolygon from "./data/AreaPolygon";
import DebugView from "./ui/DebugView";
import { Button } from "@blueprintjs/core";
import InfoView from "./ui/InfoView";
import { TextStyle } from "pixi.js";
import EditStage from "./ui/PixiView/EditStage";

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

function projectReducer(project: Project, action: any) {
  if (action.type == 'move_vertex') {
    const m = new Map([...project.vertexes]);
    m.set(action.target, new Vector2d(action.x, action.z));
    return Object.assign(project, {
      vertexes: m
    }) as Project;
  } else if (action.type == 'reload') {
    return Project.createTestData();
  } else if (action.type == 'change_left_vertex') {
    //
  }
  return project;
}

function App() {
  const [width, height] = useWindowSize();

  const [project, projectDispatch] = useReducer(projectReducer, Project.createTestData());
  const [tracks, setTracks] = useState<StormTracks[]>([]);
  const [nearestVertex, setNearestVertex] = useState<string | undefined>(undefined);
  const [selectedPolygon, setSelectedPolygon] = useState<string | undefined>(undefined);

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

  return (
    <>
      <Nav></Nav>
      <DebugView>
        <Button onClick={reload}>Reload</Button>
      </DebugView>
      <InfoView vertexes={project.vertexes} areas={project.areas} selectedArea={selectedPolygon}></InfoView>
      <EditStage width={width} height={height} tracks={tracks} areas={project.areas}
        nearestVertex={nearestVertex} projectDispatch={projectDispatch} selectedPolygon={selectedPolygon} vertexes={project.vertexes}
        setNearestVertex={setNearestVertex} setSelectedPolygon={setSelectedPolygon}/>
    </>
  );
}

export default App;
