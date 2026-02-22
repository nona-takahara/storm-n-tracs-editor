import React, { useCallback } from "react";
import { Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";
import NtracsTrack from "../../data/NtracsTrack";
import * as EditMode from "../../EditMode";

interface AreaPolygonsViewProps {
  editMode: EditMode.EditMode;
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  tracks: Map<string, NtracsTrack>;
  nearestIndex: string | undefined;
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
}

function areaCenter(
  area: AreaPolygon | undefined,
  vertexes: Map<string, Vector2d>
): { x: number; z: number } | undefined {
  if (!area || area.vertexes.length === 0) {
    return undefined;
  }

  const sum = area.vertexes
    .map((vertexId) => vertexes.get(vertexId))
    .reduce<{ x: number; z: number; count: number }>(
      (acc, vertex) => ({
        x: acc.x + (vertex?.x || 0),
        z: acc.z + (vertex?.z || 0),
        count: acc.count + (vertex ? 1 : 0),
      }),
      { x: 0, z: 0, count: 0 }
    );

  if (sum.count === 0) {
    return undefined;
  }

  return {
    x: sum.x / sum.count,
    z: sum.z / sum.count,
  };
}

function AreaPolygonsView(props: AreaPolygonsViewProps) {
  const selectedTrackInEditMode =
    props.editMode === EditMode.EditTrack ? props.selectedTrack : undefined;
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      g.lineStyle(0.2, 0x0000ff, 1);
      props.areas.forEach((area, key) => {
        if (key === props.selectedArea) {
          const p = props.vertexes.get(area.vertexes[area.leftVertexInnerId]);
          if (p) {
            g.lineStyle(1, 0x0000ff, 0.7);
            g.drawCircle(p.x, -p.z, 1.5);
          }
          if (
            selectedTrackInEditMode &&
            props.tracks
              .get(selectedTrackInEditMode)
              ?.areas.find((v) => v.areaName === key)
          ) {
            g.beginFill(0xa0ffa0, 0.3);
          } else {
            g.beginFill(0x8080ff, 0.3);
          }
        } else {
          if (
            selectedTrackInEditMode &&
            props.tracks
              .get(selectedTrackInEditMode)
              ?.areas.find((v) => v.areaName === key)
          ) {
            g.beginFill(0x00c000, 0.3);
          } else {
            g.beginFill(0x0000ff, 0.3);
          }
        }

        g.lineStyle(0.2, 0x0000ff, 1);
        const p = new PIXI.Polygon(
          area.vertexes
            .map((v) => {
              const p = props.vertexes.get(v);
              if (p) {
                return new PIXI.Point(p.x, -p.z);
              }
            })
            .filter((v): v is Exclude<typeof v, undefined> => v !== undefined)
        );
        g.drawPolygon(p);
        g.endFill();
      });

      g.lineStyle(0);
      props.vertexes.forEach((v, k) => {
        if (k === props.nearestIndex) {
          g.beginFill(0xff0000, 1);
          g.drawCircle(v.x, -v.z, 1);
        }
        g.beginFill(0x0000ff, 1);
        g.drawCircle(v.x, -v.z, 0.4);

        g.endFill();
      });

      if (selectedTrackInEditMode) {
        const list = props.tracks.get(selectedTrackInEditMode);
        if (list) {
          for (let i = 1; i < list.areas.length; i++) {
            const p1 = areaCenter(props.areas.get(list.areas[i - 1].areaName), props.vertexes);
            const p2 = areaCenter(props.areas.get(list.areas[i].areaName), props.vertexes);
            if (p1 && p2) {
              const p1p2 = { x: p2.x - p1.x, z: p2.z - p1.z };
              const p1p2Length = Math.sqrt(p1p2.x * p1p2.x + p1p2.z * p1p2.z) / 4;
              if (p1p2Length === 0) {
                continue;
              }
              const p1p2Normal = { x: p1p2.x / p1p2Length, z: p1p2.z / p1p2Length };
              const pp = new PIXI.Polygon([
                new PIXI.Point(p1.x - p1p2Normal.z, -p1.z - p1p2Normal.x),
                new PIXI.Point(p2.x, -p2.z),
                new PIXI.Point(p1.x + p1p2Normal.z, -p1.z + p1p2Normal.x),
              ]);
              g.beginFill(0x00a0ff, 0.6);
              g.drawPolygon(pp);
              g.endFill();
            }
          }
        }
      }
    },
    [
      props.areas,
      props.editMode,
      props.nearestIndex,
      props.selectedArea,
      props.selectedTrack,
      props.tracks,
      props.vertexes,
      selectedTrackInEditMode,
    ]
  );

  return <Graphics draw={draw} />;
}

export default React.memo(AreaPolygonsView);
