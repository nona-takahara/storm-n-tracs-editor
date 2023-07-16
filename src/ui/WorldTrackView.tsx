import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import * as PIXI from 'pixi.js';
import Project from '../data/Project';
import { invoke } from "@tauri-apps/api/tauri";

type WorldTrackViewProps = {
  project: Project | undefined
};

function WorldTrackView(props: WorldTrackViewProps) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      for (let ix = -1000; ix <= 10 * 1000; ix += 1000) {
        for (let iy = 0 + (ix % 2000); iy <= 10000; iy += 2000) {
          g.beginFill(0xf0f0f0);
          g.drawRect(ix - 500, iy + 500, 1000, 1000);
          g.endFill();
        }
      }
    
      //const res = readAndParseXML(DEBUG_VALUE.tile_dir + "mega_island_10_8.xml");
      //res.then((v) => console.log(JSON.stringify(v)));
      /*
      g.lineStyle(4, 0xffd000, 1);
      for (const key in prj.tracks) {
        if (Object.prototype.hasOwnProperty.call(prj.tracks, key)) {
          const i = prj.tracks[key];
          for (const j of i.links) {
            if (prj.tracks[j]?.x && prj.tracks[j]?.z) {
              g.moveTo(i.x, i.z);
              g.lineTo(prj.tracks[j].x, prj.tracks[j].z);
            }
          }
        }
      }
      g.lineStyle(1, 0xff8000, 1);
      for (const key in prj.tracks) {
        if (Object.prototype.hasOwnProperty.call(prj.tracks, key)) {
          const i = prj.tracks[key];
          for (const j of i.links) {
            if (prj.tracks[j]?.x && prj.tracks[j]?.z) {
              g.moveTo(i.x, i.z);
              g.lineTo(prj.tracks[j].x, prj.tracks[j].z);
            }
          }
          if (i.links.length > 2) {
            g.drawCircle(i.x, i.z, 1);
          }
        }
      }
      */
    },
    [props],
  );

  return <Graphics draw={draw} />;
}

export default WorldTrackView;