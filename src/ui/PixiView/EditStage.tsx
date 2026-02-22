import { Container, Stage, Text } from "@pixi/react";
import { TextStyle } from "pixi.js";
import React, { useLayoutEffect, useState } from "react";
import { toWorldPosition } from "../../domain/editor/geometry";
import { useEditorCommands, useEditorSelector } from "../../store/EditorStore";
import AddonsView from "./AddonsView";
import AreaPolygonsView from "./AreaPolygonsView";
import WorldTrackView from "./WorldTrackView";

function useWindowSize(): [number, number] {
  const [size, setSize] = useState<[number, number]>([0, 0]);

  useLayoutEffect(() => {
    const updateSize = () => {
      setSize([window.innerWidth, window.innerHeight]);
    };

    window.addEventListener("resize", updateSize);
    updateSize();
    return () => {
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return size;
}

function EditStage() {
  const commands = useEditorCommands();
  const worldTracks = useEditorSelector((state) => state.swtracks);
  const areas = useEditorSelector((state) => state.areas);
  const vertexes = useEditorSelector((state) => state.vertexes);
  const vehicles = useEditorSelector((state) => state.vehicles);
  const editMode = useEditorSelector((state) => state.editMode);
  const nttracks = useEditorSelector((state) => state.nttracks);
  const nearestVertex = useEditorSelector((state) => state.nearestVertex);
  const selectedArea = useEditorSelector((state) => state.selectedArea);
  const selectedTrack = useEditorSelector((state) => state.selectedTrack);

  const [width, height] = useWindowSize();
  const [leftPos, setLeftPos] = useState(-1500);
  const [topPos, setTopPos] = useState(-4000);
  const [scale, setScale] = useState(1);
  const [mouseLeftButtonDown, setMouseLeftButtonDown] = useState(false);

  const wheelEvent = (event: React.WheelEvent<HTMLCanvasElement>) => {
    if (event.ctrlKey) {
      if (event.deltaY > 0) {
        setScale((value) => Math.max(0.25, value - 0.25));
      } else {
        setScale((value) => Math.min(10, value + 0.25));
      }
      return;
    }

    if (event.shiftKey) {
      setLeftPos((value) => value - Math.floor(event.deltaY / scale));
      return;
    }

    setTopPos((value) => value - Math.floor(event.deltaY / scale));
    setLeftPos((value) => value - Math.floor(event.deltaX / scale));
  };

  const mouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const point = toWorldPosition(event.clientX, event.clientY, {
      width,
      height,
      leftPos,
      topPos,
      scale,
    });
    commands.stagePointerMove(point, mouseLeftButtonDown);
  };

  const mouseDown = (event: React.MouseEvent) => {
    const point = toWorldPosition(event.clientX, event.clientY, {
      width,
      height,
      leftPos,
      topPos,
      scale,
    });

    if (event.button === 0) {
      setMouseLeftButtonDown(true);
      commands.stagePrimaryDown(point, event.shiftKey);
      return;
    }

    if (event.button === 2) {
      commands.stageSecondaryDown();
    }
  };

  const mouseUp = (event: React.MouseEvent) => {
    if (event.button === 0) {
      setMouseLeftButtonDown(false);
      commands.stagePrimaryUp(event.ctrlKey);
    }
  };

  const mouseLeave = () => {
    setMouseLeftButtonDown(false);
  };

  const nearestVertexPosition =
    nearestVertex !== undefined ? vertexes.get(nearestVertex) : undefined;

  return (
    <Stage
      width={width}
      height={height}
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
      onContextMenu={(event) => {
        event.preventDefault();
      }}
    >
      <Container
        position={[leftPos * scale + width / 2, topPos * scale + height / 2]}
        scale={scale}
      >
        <WorldTrackView tracks={worldTracks} />
        <AddonsView vehicles={vehicles} scale={scale} />
        <AreaPolygonsView
          editMode={editMode}
          vertexes={vertexes}
          areas={areas}
          tracks={nttracks}
          nearestIndex={nearestVertex}
          selectedArea={selectedArea}
          selectedTrack={selectedTrack}
        />
        {nearestVertexPosition && (
          <Text
            text={nearestVertex}
            anchor={0.5}
            x={nearestVertexPosition.x}
            y={-nearestVertexPosition.z - 20 / scale}
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
