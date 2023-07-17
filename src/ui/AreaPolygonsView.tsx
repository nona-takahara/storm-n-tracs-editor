import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import Project from '../data/Project';
import AreaPolygon from '../data/AreaPolygon';

type AreaPolygonsViewProps = {
  project: Project | undefined;
  nearestIndex: string | undefined;
  selectedArea: AreaPolygon | undefined;
};

function AreaPolygonsView(props: AreaPolygonsViewProps) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      if (props.project) {
        const pprj = props.project;
        g.clear();

        g.lineStyle(0.2, 0x0000ff, 1);
        pprj.areas.forEach(area => {
          if (area == props.selectedArea) {
            const p = pprj.vertexes.get(area.vertexes[area.leftVertexInnerId]);
            if (p) {
              g.lineStyle(1, 0x0000ff, 0.7);
              g.drawCircle(p.x, -p.z, 1.5);
            }
            g.beginFill(0x8080ff, 0.3);
          } else {
            g.beginFill(0x0000ff, 0.3);
          }

          g.lineStyle(0.2, 0x0000ff, 1);
          const p = new PIXI.Polygon(
            area.vertexes.map((v) => {
              const p = pprj.vertexes.get(v);
              if (p) {
                return new PIXI.Point(p.x, -p.z);
              }
            }).filter((v): v is Exclude<typeof v, undefined> => v !== undefined)
          );
          g.drawPolygon(p);
          g.endFill();
        });

        g.lineStyle(0);
        pprj.vertexes.forEach((v, k) => {
          if (k === props.nearestIndex) {
            g.beginFill(0xff0000, 1);
            g.drawCircle(v.x, -v.z, 1);
          }
          g.beginFill(0x0000ff, 1);
          g.drawCircle(v.x, -v.z, 0.4);

          g.endFill();
        });
      }
    },
    [props],
  );

  return <Graphics draw={draw} />;
}

export default AreaPolygonsView;