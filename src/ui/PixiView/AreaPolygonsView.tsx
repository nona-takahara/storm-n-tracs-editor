import React, { useCallback } from "react";
import { Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";
import NtracsTrack from "../../data/NtracsTrack";

type AreaPolygonsViewProps = {
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  tracks: Map<string, NtracsTrack>;
  nearestIndex: string | undefined;
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
};

function AreaPolygonsView(props: AreaPolygonsViewProps) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      g.lineStyle(0.2, 0x0000ff, 1);
      props.areas.forEach((area, key) => {
        if (key == props.selectedArea) {
          const p = props.vertexes.get(area.vertexes[area.leftVertexInnerId]);
          if (p) {
            g.lineStyle(1, 0x0000ff, 0.7);
            g.drawCircle(p.x, -p.z, 1.5);
          }
          if (props.selectedTrack && props.tracks.get(props.selectedTrack)?.areas?.find(v => v.areaName == key)) {
            g.beginFill(0xa0ffa0, 0.3);
          } else {
            g.beginFill(0x8080ff, 0.3);
          }
        } else {
          if (props.selectedTrack && props.tracks.get(props.selectedTrack)?.areas?.find(v => v.areaName == key
          )) {
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
    },
    [props]
  );

  return <Graphics draw={draw} />;
}

export default AreaPolygonsView;
