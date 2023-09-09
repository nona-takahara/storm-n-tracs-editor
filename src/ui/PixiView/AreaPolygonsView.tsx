import React, { useCallback } from "react";
import { Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import AreaPolygon from "../../data/AreaPolygon";
import Vector2d from "../../data/Vector2d";
import NtracsTrack from "../../data/NtracsTrack";
import * as EditMode from "../../EditMode";

type AreaPolygonsViewProps = {
  editMode: EditMode.EditMode;
  vertexes: Map<string, Vector2d>;
  areas: Map<string, AreaPolygon>;
  tracks: Map<string, NtracsTrack>;
  nearestIndex: string | undefined;
  selectedArea: string | undefined;
  selectedTrack: string | undefined;
};

function AreaPolygonsView(props: AreaPolygonsViewProps) {
  const sl = (props.editMode === EditMode.EditTrack) && props.selectedTrack;
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
          if (sl && props.tracks.get(sl)?.areas?.find(v => v.areaName == key)) {
            g.beginFill(0xa0ffa0, 0.3);
          } else {
            g.beginFill(0x8080ff, 0.3);
          }
        } else {
          if (sl && props.tracks.get(sl)?.areas?.find(v => v.areaName == key
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

      if (sl) {
        const list = props.tracks.get(sl);
        if (list) {
          for (let i = 1; i < list.areas.length; i++) {
            const p1 = props.areas.get(list.areas[i - 1].areaName)?.vertexes.map(v => props.vertexes.get(v))?.
              reduce<{ x: number, z: number, cnt: number }>((p, c) => ({ x: (p?.x || 0) + (c?.x || 0), z: (p?.z || 0) + (c?.z || 0), cnt: (p?.cnt || 0) + 1 }), { x: 0, z: 0, cnt: 0 });
            const p2 = props.areas.get(list.areas[i].areaName)?.vertexes.map(v => props.vertexes.get(v))?.
              reduce<{ x: number, z: number, cnt: number }>((p, c) => ({ x: (p?.x || 0) + (c?.x || 0), z: (p?.z || 0) + (c?.z || 0), cnt: (p?.cnt || 0) + 1 }), { x: 0, z: 0, cnt: 0 });

            if (p1 && p2) {
              const p1p2 = {x: (p2.x / p2.cnt) - (p1.x / p1.cnt), z: (p2.z / p2.cnt) - (p1.z / p1.cnt)};
              const p1p2l = Math.sqrt(p1p2.x * p1p2.x + p1p2.z * p1p2.z) / 4;
              const p1p2n = {x: p1p2.x / p1p2l, z: p1p2.z / p1p2l}
              const pp = new PIXI.Polygon(
                [new PIXI.Point(p1.x / p1.cnt - p1p2n.z, - p1.z / p1.cnt - p1p2n.x), new PIXI.Point(p2.x / p2.cnt, -p2.z / p2.cnt), new PIXI.Point(p1.x / p1.cnt + p1p2n.z,- p1.z / p1.cnt + p1p2n.x)]
              )
              g.beginFill(0x00a0ff, 0.6);
              g.drawPolygon(pp);
              g.endFill();
            }
          }
        }
      }
    },
    [props]
  );

  return <Graphics draw={draw} />;
}

export default AreaPolygonsView;
