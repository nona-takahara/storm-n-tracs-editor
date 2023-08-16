import { Container, Stage, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import React, { useState } from "react";
import { Updater } from "use-immer";
import AreaPolygon from "../../data/AreaPolygon";
import StormTracks from "../../data/StormTracks";
import Vector2d from "../../data/Vector2d";
import * as EditMode from "../../EditMode";
import AreaPolygonsView from "./AreaPolygonsView";
import WorldTrackView from "./WorldTrackView";

function mousePos(
  e: React.MouseEvent,
  innerWidth: number,
  innerHeight: number,
  leftPos: number,
  topPos: number,
  scale: number
): Vector2d {
  return new Vector2d(
    -((innerWidth / 2 - e.clientX) / scale + leftPos),
    (innerHeight / 2 - e.clientY) / scale + topPos
  );
}

function len(x1: number, y1: number, x2: number, y2: number) {
  return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

type EditStageProps = {
  width: number;
  height: number;
  vertexes: Map<string, Vector2d>;
  updateVertexes: Updater<Map<string, Vector2d>>;
  areas: Map<string, AreaPolygon>;
  updateAreas: Updater<Map<string, AreaPolygon>>;
  setNearestVertex: React.Dispatch<React.SetStateAction<string | undefined>>;
  nearestVertex: string | undefined;
  setSelectedArea: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedArea: string | undefined;
  tracks: StormTracks[];
  editMode: EditMode.EditMode;
  setEditMode: React.Dispatch<EditMode.EditMode>;
};

function EditStage(props: EditStageProps) {
  const [leftPos, setLeftPos] = useState(-1500);
  const [topPos, setTopPos] = useState(-4000);
  const [scale, setScale] = useState(1);

  const [mouseLeftButtonDown, setMouseLeftButtonDown] = useState(false);
  //const [mouseX, setMouseX] = useState(-100000);
  //const [mouseZ, setMouseZ] = useState(-100000);

  const wheelEvent = (e: React.WheelEvent<HTMLCanvasElement>) => {
    if (e.ctrlKey) {
      if (e.deltaY > 0) {
        setScale(Math.max(0.25, scale - 0.25));
      } else {
        setScale(Math.min(10, scale + 0.25));
      }
    } else if (e.shiftKey) {
      setLeftPos(leftPos - Math.floor(e.deltaY / scale));
    } else {
      setTopPos(topPos - Math.floor(e.deltaY / scale));
      setLeftPos(leftPos - Math.floor(e.deltaX / scale));
    }
    const m = mousePos(e, props.width, props.height, leftPos, topPos, scale);
    //setMouseX(m.x);
    //setMouseZ(m.z);
  };

  const mouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const m = mousePos(e, props.width, props.height, leftPos, topPos, scale);
    //setMouseX(m.x);
    //setMouseZ(m.z);

    if (!mouseLeftButtonDown) {
      if (props.vertexes) {
        let rets: string | undefined = undefined;
        let length = 1;
        for (const [k, v] of props.vertexes.entries()) {
          const len_to_vx = len(m.x, m.z, v.x, v.z);
          if (len_to_vx < length) {
            length = len_to_vx;
            rets = k;
          }
        }
        props.setNearestVertex(rets);
      } else {
        props.setNearestVertex(undefined);
      }
    } else {
      const p = props.nearestVertex;
      if (p !== undefined) {
        props.updateVertexes((draft) => {
          draft.set(
            p,
            new Vector2d(Math.floor(m.x * 10) / 10, Math.floor(m.z * 10) / 10)
          );
        });
      }
    }
  };

  const mouseDown = (e: React.MouseEvent) => {
    const m = mousePos(e, props.width, props.height, leftPos, topPos, scale);
    if (e.button == 0) {
      setMouseLeftButtonDown(true);
      if (props.editMode == EditMode.AddArea) {
        if (props.nearestVertex === undefined || e.shiftKey) {
          props.updateAreas((draft) => {
            const sl =
              props.selectedArea !== undefined && draft.get(props.selectedArea);
            if (sl && props.selectedArea) {
              let i = props.vertexes.size;
              props.updateVertexes((draft) => {
                while (props.vertexes.has(`v${i}`)) i++;

                draft.set(`v${i}`, new Vector2d(m.x, m.z));
              });
              draft.set(
                props.selectedArea,
                new AreaPolygon(
                  sl.vertexes.concat(`v${i}`),
                  sl.leftVertexInnerId
                )
              );
            }
          });
        } else if (props.nearestVertex !== undefined) {
          const nv = props.nearestVertex;
          props.updateAreas((draft) => {
            const sl =
              props.selectedArea !== undefined && draft.get(props.selectedArea);
            if (sl && props.selectedArea) {
              if (nv === sl.vertexes?.[0]) {
                return;
              }
              draft.set(
                props.selectedArea,
                new AreaPolygon(sl.vertexes.concat(nv), sl.leftVertexInnerId)
              );
            }
          });
        }
      } else if (props.editMode == EditMode.EditArea) {
        const selpolreal =
          props.selectedArea !== undefined
            ? props.areas.get(props.selectedArea)
            : undefined;
        if (
          props.nearestVertex !== undefined
            ? selpolreal?.vertexes.indexOf(props.nearestVertex) === -1
            : true
        ) {
          for (const key of props.areas.keys()) {
            const item = props.areas.get(key);
            if (item && item.isInArea(props.vertexes, m.x, m.z)) {
              props.setSelectedArea(key);
              return;
            }
          }
          if (props.nearestVertex === undefined) {
            props.setSelectedArea(undefined);
          }
        }
      }
    } else if (e.button == 2) {
      if (props.editMode == EditMode.AddArea) {
        props.setEditMode(EditMode.EditArea);
      }
    }
  };

  const mouseUp = (e: React.MouseEvent) => {
    if (e.button == 0) {
      setMouseLeftButtonDown(false);
    }

    const nearVk = props.nearestVertex;
    const nearV = nearVk !== undefined ? props.vertexes.get(nearVk) : undefined;
    if (e.ctrlKey && nearVk && nearV) {
      let nnearVk: string = nearVk;
      let merge = false;
      if (props.vertexes) {
        let length = 1;
        for (const [k, v] of props.vertexes.entries()) {
          const len_to_vx = len(nearV.x, nearV.z, v.x, v.z);
          if (len_to_vx !== 0 && len_to_vx < length) {
            length = len_to_vx;
            nnearVk = k;
          }
        }
        if (length < 1) {
          merge = true;
        }
        if (merge) props.setNearestVertex(nnearVk);
      }

      if (!merge) return;
      props.updateAreas((draft) => {
        draft.forEach((v, k) => {
          if (v.vertexes.indexOf(nearVk)) {
            const vs = v.vertexes.map((vv) => {
              if (vv !== nearVk) {
                return vv;
              } else {
                return nnearVk;
              }
            });
            draft.set(k, new AreaPolygon(vs, v.leftVertexInnerId));
          }
        });
      });

      props.updateVertexes((draft) => {
        draft.delete(nearVk);
      });
    }
  };

  const mouseLeave = (e: React.MouseEvent) => {
    setMouseLeftButtonDown(false);
  };

  const nv = props.nearestVertex && props.vertexes.get(props.nearestVertex);

  return (
    <Stage
      width={props.width}
      height={props.height}
      options={{
        antialias: true,
        background: 0xe0e0e0,
      }}
      style={{ margin: 0 }}
      onWheel={wheelEvent}
      onMouseDown={mouseDown}
      onMouseUp={mouseUp}
      onMouseLeave={mouseLeave}
      onMouseMove={mouseMove}
    >
      <Container
        position={[
          leftPos * scale + props.width / 2,
          topPos * scale + props.height / 2,
        ]}
        scale={scale}
      >
        <WorldTrackView tracks={props.tracks} />
        <AreaPolygonsView
          vertexes={props.vertexes}
          areas={props.areas}
          nearestIndex={props.nearestVertex}
          selectedArea={props.selectedArea}
        />
        {nv && (
          <Text
            text={props.nearestVertex}
            anchor={0.5}
            x={nv.x}
            y={-nv.z - 20 / scale}
            scale={{ x: 0.8 / scale, y: 0.8 / scale }}
            style={
              new TextStyle({
                fontFamily: "Consolas, monospace",
                fontSize: 20 * devicePixelRatio,
              })
            }
          />
        )}
      </Container>
    </Stage>
  );
}

export default EditStage;
