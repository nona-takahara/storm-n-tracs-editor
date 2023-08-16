import { Button, ButtonGroup, Radio, RadioGroup } from "@blueprintjs/core";
import { Updater } from "use-immer";
import AreaPolygon from "../data/AreaPolygon";
import Vector2d from "../data/Vector2d";

type EditAreaProps = {
  selectedArea: string;
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  updateVertexes: Updater<Map<string, Vector2d>>;
};

function EditArea(props: EditAreaProps) {
  const ssarea = props.areas.get(props.selectedArea) || {
    name: "",
    vertexes: [],
    leftVertexInnerId: 0,
  };

  const canDeleteVertex = ssarea.vertexes.length > 3;

  const addButton =
    (index: number) => (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      let i = props.vertexes.size;
      while (props.vertexes.has(`v${i}`)) i++;

      props.updateVertexes((draft) => {
        const v1 = props.vertexes.get(ssarea.vertexes[index]);
        const v2 = props.vertexes.get(
          ssarea.vertexes[(index + 1) % ssarea.vertexes.length]
        );
        if (v1 && v2) {
          draft.set(
            `v${i}`,
            new Vector2d((v1.x + v2.x) / 2, (v1.z + v2.z) / 2)
          );
        }
      });
      props.updateAreas((draft) => {
        draft.set(
          props.selectedArea,
          new AreaPolygon(
            ssarea.vertexes
              .slice(0, index + 1)
              .concat(`v${i}`, ssarea.vertexes.slice(index + 1)),
            ssarea.leftVertexInnerId
          )
        );
      });
    };

  const delButton = (index: number) => () => {
    props.updateAreas((draft) => {
      draft.set(
        props.selectedArea,
        new AreaPolygon(
          ssarea.vertexes
            .slice(0, index)
            .concat(ssarea.vertexes.slice(index + 1)),
          ssarea.leftVertexInnerId
        )
      );
    });
  };

  const delAreaButton = () => {
    props.updateAreas((draft) => {
      draft.delete(props.selectedArea);
    });
  };

  return (
    <>
      <div>
        <b>{props.selectedArea}</b>
        <Button onClick={delAreaButton}>DEL</Button>
      </div>
      <RadioGroup
        onChange={(evt) => {
          props.updateAreas((draft) => {
            const area = props.areas.get(props.selectedArea);
            const value = evt.currentTarget?.value;
            if (value && area && area.vertexes.indexOf(value)) {
              draft.set(
                props.selectedArea,
                new AreaPolygon(area.vertexes, area.vertexes.indexOf(value))
              );
            }
          });
        }}
        selectedValue={ssarea.vertexes[ssarea.leftVertexInnerId]}
      >
        {ssarea.vertexes.map((v, i) => {
          const vx = props.vertexes.get(v);
          const v1 = ssarea.vertexes[(i + 1) % ssarea.vertexes.length];
          const vx1 = props.vertexes.get(v1);
          const l =
            vx &&
            vx1 &&
            Math.sqrt(
              (vx.x - vx1.x) * (vx.x - vx1.x) + (vx.z - vx1.z) * (vx.z - vx1.z)
            );
          if (vx) {
            return (
              <Radio
                label={`${v}: ${vx.x.toFixed(1)}, ${vx.z.toFixed(1)}`}
                value={v}
                key={v}
              >
                <ButtonGroup>
                  <Button onClick={addButton(i)} small={true}>
                    +
                  </Button>
                  <Button
                    onClick={canDeleteVertex ? delButton(i) : undefined}
                    small={true}
                    disabled={!canDeleteVertex}
                  >
                    -
                  </Button>
                </ButtonGroup>
                {l?.toFixed(2)}
              </Radio>
            );
          } else {
            return undefined;
          }
        })}
      </RadioGroup>
    </>
  );
}

export default EditArea;
