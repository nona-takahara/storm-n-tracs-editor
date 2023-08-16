import {
  Button,
  ButtonGroup,
  Card,
  Radio,
  RadioGroup,
} from "@blueprintjs/core";
import { Updater } from "use-immer";
import AreaPolygon from "../data/AreaPolygon";
import Project from "../data/Project";
import Vector2d from "../data/Vector2d";

type InfoViewProps = {
  selectedArea: string | undefined;
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  updateVertexes: Updater<Map<string, Vector2d>>;
};

function InfoView(props: InfoViewProps) {
  const ssarea = (props.selectedArea &&
    props.areas.get(props.selectedArea)) || {
    name: "",
    vertexes: [],
    leftVertexInnerId: 0,
  };

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
        if (props.selectedArea) {
          draft.set(
            props.selectedArea,
            new AreaPolygon(
              ssarea.vertexes
                .slice(0, index + 1)
                .concat(`v${i}`, ssarea.vertexes.slice(index + 1)),
              ssarea.leftVertexInnerId
            )
          );
        }
      });
    };

  const delButton =
    (index: number) => (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      props.updateAreas((draft) => {
        if (props.selectedArea) {
          draft.set(
            props.selectedArea,
            new AreaPolygon(
              ssarea.vertexes
                .slice(0, index)
                .concat(ssarea.vertexes.slice(index + 1)),
              ssarea.leftVertexInnerId
            )
          );
        }
      });
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
      <b>{props.selectedArea}</b>
      <RadioGroup
        onChange={(evt) => {
          props.updateAreas((draft) => {
            const area =
              props.selectedArea && props.areas.get(props.selectedArea);
            const value = evt.currentTarget?.value;
            if (
              value &&
              props.selectedArea &&
              area &&
              area.vertexes.indexOf(value)
            ) {
              draft.set(
                props.selectedArea,
                new AreaPolygon(area.vertexes, area.vertexes.indexOf(value))
              );
            }
          });
        }}
        selectedValue={ssarea?.vertexes[ssarea?.leftVertexInnerId]}
      >
        {ssarea?.vertexes.map((v, i) => {
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
                    onClick={
                      ssarea.vertexes.length <= 3 ? () => {} : delButton(i)
                    }
                    small={true}
                    disabled={ssarea.vertexes.length <= 3}
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
    </Card>
  );
}

export default InfoView;
