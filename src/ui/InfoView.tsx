import { Card } from "@blueprintjs/core";
import * as EditMode from "../EditMode";
import { useEditorSelector } from "../store/EditorStore";
import AreaMain from "./InfoViews/AreaMain";
import EditArea from "./InfoViews/EditArea";
import EditTrack from "./InfoViews/EditTrack";

function InfoView() {
  const editMode = useEditorSelector((state) => state.editMode);
  const selectedArea = useEditorSelector((state) => state.selectedArea);

  const select = () => {
    if (editMode === EditMode.AddArea || editMode === EditMode.EditArea) {
      if (selectedArea !== undefined) {
        return <EditArea />;
      } else {
        return <AreaMain />;
      }
    } else if (editMode === EditMode.EditTrack) {
      return <EditTrack />;
    }
    return undefined;
  };

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
