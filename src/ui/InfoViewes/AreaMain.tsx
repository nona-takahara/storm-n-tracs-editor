import { Button, ButtonGroup } from "@blueprintjs/core";
import { Updater } from "use-immer";
import AreaPolygon from "../../data/AreaPolygon";
import * as EditMode from "../../EditMode";

type EditAreaProps = {
  areas: Map<string, AreaPolygon>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  setSelectedArea: React.Dispatch<React.SetStateAction<string | undefined>>;
  setEditMode: React.Dispatch<EditMode.EditMode>;
};

function AreaMain(props: EditAreaProps) {
  return (
    <ButtonGroup>
      <Button
        onClick={() => {
          props.setEditMode(EditMode.AddArea);

          let i = props.areas.size;
          while (props.areas.has(`Area_${i}`)) i++;

          props.updateAreas((draft) => {
            draft.set(`Area_${i}`, new AreaPolygon([], 0));
          });
          props.setSelectedArea(`Area_${i}`);
        }}
      >
        Add Area
      </Button>
      <Button>Clean up Vertexes(WIP)</Button>
    </ButtonGroup>
  );
}

export default AreaMain;
