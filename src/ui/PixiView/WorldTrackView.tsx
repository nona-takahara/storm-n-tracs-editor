import React, { useCallback } from "react";
import { Graphics } from "@pixi/react";
import * as PIXI from "pixi.js";
import Project from "../../data/Project";
import { invoke } from "@tauri-apps/api/tauri";
import StormTracks from "../../data/StormTracks";

type WorldTrackViewProps = {
  tracks: StormTracks[];
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

      for (const tile of props.tracks) {
        if (!tile) continue;
        g.lineStyle(4, 0xffd000, 1);
        for (const key in tile.tracks) {
          if (Object.prototype.hasOwnProperty.call(tile.tracks, key)) {
            const i = tile.tracks[key];
            for (const j of i.links) {
              const rx = tile.tracks[j]?.x,
                rz = tile.tracks[j]?.z;
              if (rx && rz) {
                g.moveTo(i.x + tile.offsetX, -i.z - tile.offsetZ);
                g.lineTo(rx + tile.offsetX, -rz - tile.offsetZ);
              }
            }
          }
        }
        g.lineStyle(1, 0xff8000, 1);
        for (const key in tile.tracks) {
          if (Object.prototype.hasOwnProperty.call(tile.tracks, key)) {
            const i = tile.tracks[key];
            for (const j of i.links) {
              const rx = tile.tracks[j]?.x,
                rz = tile.tracks[j]?.z;
              if (rx && rz) {
                g.moveTo(i.x + tile.offsetX, -i.z - tile.offsetZ);
                g.lineTo(rx + tile.offsetX, -rz - tile.offsetZ);
              }
            }
            if (i.links.length > 2) {
              g.drawCircle(i.x + tile.offsetX, -i.z - tile.offsetZ, 0.6);
            }
          }
        }
      }
    },
    [props]
  );

  return <Graphics draw={draw} />;
}

export default WorldTrackView;
