import { Container, Stage, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import React, { useState } from "react";
import { Updater } from "use-immer";
import AreaPolygon from "../../data/AreaPolygon";
import StormTracks from "../../data/StormTracks";
import Vector2d from "../../data/Vector2d";
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
  setSelectedPolygon: React.Dispatch<React.SetStateAction<string | undefined>>;
  selectedPolygon: string | undefined;
  tracks: StormTracks[];
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
      const selpolreal =
        props.selectedPolygon !== undefined
          ? props.areas.get(props.selectedPolygon)
          : undefined;
      if (
        props.nearestVertex !== undefined
          ? selpolreal?.vertexes.indexOf(props.nearestVertex) === -1
          : true
      ) {
        for (const key of props.areas.keys()) {
          const item = props.areas.get(key);
          if (item && item.isInArea(props.vertexes, m.x, m.z)) {
            props.setSelectedPolygon(key);
            return;
          }
        }
        if (props.nearestVertex === undefined) {
          props.setSelectedPolygon(undefined);
        }
      }
    }
  };

  const mouseUp = (e: React.MouseEvent) => {
    if (e.button == 0) {
      setMouseLeftButtonDown(false);
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
          selectedArea={props.selectedPolygon}
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
