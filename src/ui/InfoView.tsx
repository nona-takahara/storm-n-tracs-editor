import { Card } from "@blueprintjs/core";
import { Updater } from "use-immer";
import AreaPolygon from "../data/AreaPolygon";
import Vector2d from "../data/Vector2d";
import EditArea from "./EditArea";

type InfoViewProps = {
  selectedArea: string | undefined;
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  updateVertexes: Updater<Map<string, Vector2d>>;
  setSelectedArea: React.Dispatch<React.SetStateAction<string | undefined>>;
};

function InfoView(props: InfoViewProps) {
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
      {props.selectedArea !== undefined ? (
        <EditArea {...props} selectedArea={props.selectedArea} />
      ) : undefined}
    </Card>
  );
}

export default InfoView;
