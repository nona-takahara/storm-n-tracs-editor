import { useLayoutEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Nav from "./ui/Nav";
import Vector2d from "./data/Vector2d";
import StormTracks from "./data/StormTracks";
import InfoView from "./ui/InfoView";
import EditStage from "./ui/PixiView/EditStage";
import { useImmer } from "use-immer";
import AreaPolygon from "./data/AreaPolygon";
import * as EditMode from "./EditMode";
import { CreateObject, CreateSaveObject } from "./data/ProjectUtils";
import AddonVehicle from "./data/AddonVehicle";
import { TabId } from "@blueprintjs/core";
import NtracsTrack from "./data/NtracsTrack";

const useWindowSize = (): number[] => {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    const updateSize = (): void => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => { window.removeEventListener("resize", updateSize); };
  }, []);
  return size;
};

function open_file_command() {
  return invoke("open_file_command", {});
}

function save_file_command(data: string) {
  return invoke("save_file_command", { saveValue: data });
}

function App() {
  const [width, height] = useWindowSize();
  const [vertexes, updateVertexes] = useImmer(new Map<string, Vector2d>());
  const [areas, updateAreas] = useImmer(new Map<string, AreaPolygon>());
  const [tileAssign, updateTileAssign] = useImmer(new Map<string, Vector2d>());
  const [addonList, setAddonList] = useState<string[]>([]);
  const [vehicles, setVehicles] = useState<AddonVehicle[]>([]);
  const [swtracks, setSwTracks] = useState<StormTracks[]>([]);
  const [nttracks, updateNtTracks] = useImmer(new Map<string, NtracsTrack>());
  const [nearestVertex, setNearestVertex] = useState<string | undefined>(
    undefined
  );
  const [selectedArea, setSelectedArea] = useState<string | undefined>(
    undefined
  );
  const [selectedTrack, setSelectedTrack] = useState<string | undefined>(
    undefined
  );
  const [editMode, setEditMode] = useState<EditMode.EditMode>(
    EditMode.EditArea
  );

  const loadFile = () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    open_file_command().then((v) => {
      CreateObject(JSON.parse(v as string), updateVertexes, updateAreas, updateTileAssign, setAddonList, setVehicles, setSwTracks, updateNtTracks);
    });
  };

  const saveFile = () => {
    const saveValue = JSON.stringify(CreateSaveObject(vertexes, areas, addonList, tileAssign, nttracks));
    save_file_command(saveValue || "").catch((e: unknown) => { console.error(e); });
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
  const handleChangeEditMode = (e: TabId) => {

  }

  return (
    <>
      <Nav onLoadButtonClick={loadFile} onSaveButtonClick={saveFile} setEditMode={setEditMode} />
      <InfoView
        vertexes={vertexes}
        updateVertexes={updateVertexes}
        areas={areas}
        selectedArea={selectedArea}
        updateAreas={updateAreas}
        setSelectedArea={setSelectedArea}
        tracks={nttracks}
        selectedTrack={selectedTrack}
        updateTracks={updateNtTracks}
        setSelectedTrack={setSelectedTrack}
        editMode={editMode}
        setEditMode={setEditMode}
      ></InfoView>
      <EditStage
        width={width}
        height={height}
        tracks={swtracks}
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
        vehicles={vehicles}
        nttracks={nttracks}
        selectedTrack={selectedTrack}
      />
    </>
  );
}

export default App;
