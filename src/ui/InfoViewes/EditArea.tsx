import { Button, ButtonGroup, Divider, Intent, Radio, RadioGroup } from "@blueprintjs/core";
import { Updater } from "use-immer";
import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";
import * as EditMode from "../../EditMode";
import { Code, Trash } from "@blueprintjs/icons";
import { C } from "@tauri-apps/api/event-41a9edf5";
import { useState } from "react";
import EditLua from "./EditLua";

type EditAreaProps = {
  selectedArea: string;
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  updateVertexes: Updater<Map<string, Vector2d>>;
  setSelectedArea: React.Dispatch<React.SetStateAction<string | undefined>>;
  editMode: EditMode.EditMode;
};

function EditArea(props: EditAreaProps) {
  const [luadiag, setLuaDiag] = useState(false);

  const ssarea = props.areas.get(props.selectedArea) || {
    name: "",
    vertexes: [],
    leftVertexInnerId: 0,
    axleMode: "none",
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
        const ssarea = draft.get(props.selectedArea) || {
          name: "",
          vertexes: [],
          leftVertexInnerId: 0,
          axleMode: "none",
          callback: ""
        };
        const carray = [...ssarea.vertexes];
        carray.splice(index + 1, 0, `v${i}`);
        draft.set(
          props.selectedArea,
          new AreaPolygon(carray, ssarea.leftVertexInnerId, ssarea.axleMode, ssarea.callback)
        );
      });
    };

  const delButton = (index: number) => () => {
    props.updateAreas((draft) => {
      const ssarea = draft.get(props.selectedArea) || {
        name: "",
        vertexes: [],
        leftVertexInnerId: 0,
        axleMode: "none",
        callback: ""
      };
      draft.set(
        props.selectedArea,
        new AreaPolygon(
          ssarea.vertexes.filter((v, i) => i !== index),
          ssarea.leftVertexInnerId,
          ssarea.axleMode,
          ssarea.callback
        )
      );
    });
  };

  const delAreaButton = () => {
    props.updateAreas((draft) => {
      draft.delete(props.selectedArea);
    });
    props.setSelectedArea(undefined);
  };

  const openEditLuaButton = () => {
    setLuaDiag(true);
  };

  return (
    <>
      {luadiag && <EditLua close={() => setLuaDiag(false)} />}
      <ButtonGroup>
        <b>{props.selectedArea}</b>
        <Divider />
        {props.editMode == EditMode.EditArea && (
          <>
            <Button onClick={openEditLuaButton} icon={<Code />}>Lua</Button>
            <Button onClick={delAreaButton} icon={<Trash />} intent={Intent.DANGER}>DEL</Button>
          </>
        )}
        {props.editMode == EditMode.AddArea && "Add Area Mode"}
      </ButtonGroup>
      <Divider />
      <RadioGroup
        inline={true}
        selectedValue={ssarea.axleMode}
        onChange={(evt) => {
          props.updateAreas((draft) => {
            const area = props.areas.get(props.selectedArea);
            const value = evt.currentTarget?.value;
            if (
              area &&
              (value === "upbound" || value === "downbound" || value === "none")
            ) {
              draft.set(
                props.selectedArea,
                new AreaPolygon(area.vertexes, area.leftVertexInnerId, value, area.callback)
              );
            }
          });
        }}
      >
        <Radio label="指定なし" value="none" />
        <Radio label="上" value="upbound" />
        <Radio label="下" value="downbound" />
      </RadioGroup>
      <Divider />
      <RadioGroup
        selectedValue={ssarea.vertexes[ssarea.leftVertexInnerId]}
        onChange={(evt) => {
          props.updateAreas((draft) => {
            const area = props.areas.get(props.selectedArea);
            const value = evt.currentTarget?.value;
            if (value && area && area.vertexes.indexOf(value)) {
              draft.set(
                props.selectedArea,
                new AreaPolygon(
                  area.vertexes,
                  area.vertexes.indexOf(value),
                  area.axleMode,
                  area.callback
                )
              );
            }
          });
        }}
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
