import { useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Nav from "./ui/Nav";
import Project from "./data/Project";
import Vector2d from "./data/Vector2d";
import StormTracks from "./data/StormTracks";
import { XMLParser } from "fast-xml-parser";
import DEBUG_VALUES from "./debug_value.json";
import DebugView from "./ui/DebugView";
import { Button } from "@blueprintjs/core";
import InfoView from "./ui/InfoView";
import EditStage from "./ui/PixiView/EditStage";
import { useImmer } from "use-immer";
import AreaPolygon from "./data/AreaPolygon";
import * as EditMode from "./EditMode";

const useWindowSize = (): number[] => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return size;
};

function read_file_command(filepath: string) {
  return invoke("read_file_command", { path: filepath }) as Promise<string>;
}

function App() {
  const [width, height] = useWindowSize();

  const [vertexes, updateVertexes] = useImmer(new Map<string, Vector2d>());
  const [areas, updateAreas] = useImmer(new Map<string, AreaPolygon>());

  const [tracks, setTracks] = useState<StormTracks[]>([]);
  const [nearestVertex, setNearestVertex] = useState<string | undefined>(
    undefined
  );
  const [selectedArea, setSelectedArea] = useState<string | undefined>(
    undefined
  );

  const [editMode, setEditMode] = useState<EditMode.EditMode>(
    EditMode.EditArea
  );

  function reload() {
    console.clear();
    const test = Project.createTestData();
    updateVertexes(test.vertexes);
    updateAreas(test.areas);
    setTracks([]);
    for (let x = 0; x <= 16; x++) {
      for (let y = 0; y <= 9; y++) {
        read_file_command(DEBUG_VALUES.tile_dir + `mega_island_${x}_${y}.xml`)
          .then((str) => {
            const xmlParser = new XMLParser({
              ignoreAttributes: false,
              ignoreDeclaration: true,
            });
            setTracks((old) => {
              const list = old.slice();
              list[x * 10 + y] = StormTracks.loadFromXML(
                (x - 8) * 1000,
                y * 1000 - 12000,
                xmlParser.parse(str)
              );
              return list;
            });
          })
          .catch(() => console.log(x, y));
      }
    }
  }

  return (
    <>
      <Nav></Nav>
      <DebugView>
        <Button onClick={reload}>Reload</Button>
      </DebugView>
      <InfoView
        vertexes={vertexes}
        updateVertexes={updateVertexes}
        areas={areas}
        selectedArea={selectedArea}
        updateAreas={updateAreas}
        setSelectedArea={setSelectedArea}
        editMode={editMode}
        setEditMode={setEditMode}
      ></InfoView>
      <EditStage
        width={width}
        height={height}
        tracks={tracks}
        areas={areas}
        updateAreas={updateAreas}
        nearestVertex={nearestVertex}
        selectedArea={selectedArea}
        vertexes={vertexes}
        updateVertexes={updateVertexes}
        setNearestVertex={setNearestVertex}
        setSelectedArea={setSelectedArea}
        editMode={editMode}
        setEditMode={setEditMode}
      />
    </>
  );
}

export default App;
