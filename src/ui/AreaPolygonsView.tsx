import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import Project from '../data/Project';

type AreaPolygonsViewProps = {
  project: Project | undefined
};

function AreaPolygonsView(props: AreaPolygonsViewProps) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      if (props.project) {
        const pprj = props.project;
        g.clear();

        g.lineStyle(1.5, 0xff00ff, 0.7);
        g.lineStyle(0.2, 0x0000ff, 1);
        pprj.areas.forEach(area => {
          //if (key == selectedPolygon) {
          //  g.beginFill(0x8080ff, 0.3);
          //} else {
          g.beginFill(0x0000ff, 0.3);
          //}
          const p = new PIXI.Polygon(area.vertexes.map((v) => ({ x: v.x, y: -v.z } as PIXI.IPointData)));
          g.drawPolygon(p);
          g.endFill();
        });

        g.lineStyle(0);
        pprj.vertexes.forEach((v) => {
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