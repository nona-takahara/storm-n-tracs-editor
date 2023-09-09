import { Card } from "@blueprintjs/core";
import { Updater } from "use-immer";
import AreaPolygon from "../data/AreaPolygon";
import Vector2d from "../data/Vector2d";
import AreaMain from "./InfoViewes/AreaMain";
import EditArea from "./InfoViewes/EditArea";
import EditTrack from "./InfoViewes/EditTrack";
import * as EditMode from "../EditMode";
import NtracsTrack from "../data/NtracsTrack";

type InfoViewProps = {
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  tracks: Map<string, NtracsTrack>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  updateVertexes: Updater<Map<string, Vector2d>>;
  updateTracks: Updater<Map<string, NtracsTrack>>;
  setSelectedArea: React.Dispatch<React.SetStateAction<string | undefined>>;
  setSelectedTrack: React.Dispatch<React.SetStateAction<string | undefined>>;
  editMode: EditMode.EditMode;
  setEditMode: React.Dispatch<EditMode.EditMode>;
};

function InfoView(props: InfoViewProps) {
  const select = () => {
    if (props.editMode == EditMode.AddArea || props.editMode == EditMode.EditArea) {
      if (props.selectedArea !== undefined) {
        return <EditArea {...props} selectedArea={props.selectedArea} />;
      } else {
        return <AreaMain {...props} />;
      }
    } else if (props.editMode == EditMode.EditTrack) {
      return <EditTrack {...props} />
    }
  }

  return (
    <Card
      elevation={1}
      style={{
        position: "absolute",
        width: "300px",
        top: "60px",
        right: "10px",
        background: "rgba(250,250,250,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      {select()}
    </Card>
  );
}

export default InfoView;
