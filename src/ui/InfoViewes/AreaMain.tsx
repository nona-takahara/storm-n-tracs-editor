import { Button, ButtonGroup, Radio, RadioGroup } from "@blueprintjs/core";
import { Updater } from "use-immer";
import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";

type EditAreaProps = {
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  updateVertexes: Updater<Map<string, Vector2d>>;
  setSelectedArea: React.Dispatch<React.SetStateAction<string | undefined>>;
};

function AreaMain(props: EditAreaProps) {
  return (
    <ButtonGroup>
      <Button>Add Area</Button>
    </ButtonGroup>
  );
}

export default AreaMain;
