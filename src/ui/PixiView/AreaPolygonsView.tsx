import React, { useCallback, useEffect, useState } from "react";
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
  previewAreaId: string | undefined;
}

interface AreaCenterPoint {
  x: number;
  z: number;
}

interface ArrowStyle {
  color: number;
  alpha: number;
  width: number;
  offset?: number;
  headLength?: number;
}

function areaCenter(
  area: AreaPolygon | undefined,
  vertexes: Map<string, Vector2d>
): AreaCenterPoint | undefined {
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

function drawDirectionalArrow(
  g: PIXI.Graphics,
  from: AreaCenterPoint,
  to: AreaCenterPoint,
  style: ArrowStyle
): void {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const length = Math.sqrt(dx * dx + dz * dz);
  if (length < 0.01) {
    return;
  }

  const nx = dx / length;
  const nz = dz / length;
  const px = -nz;
  const pz = nx;
  const offset = style.offset ?? 0;
  const start = {
    x: from.x + px * offset,
    z: from.z + pz * offset,
  };
  const end = {
    x: to.x + px * offset,
    z: to.z + pz * offset,
  };

  const headLength = Math.max(0.4, Math.min(style.headLength ?? 2, length * 0.45));
  const headWidth = headLength * 0.6;
  const shaftEnd = {
    x: end.x - nx * headLength,
    z: end.z - nz * headLength,
  };

  g.lineStyle(style.width, style.color, style.alpha);
  g.moveTo(start.x, -start.z);
  g.lineTo(shaftEnd.x, -shaftEnd.z);

  g.beginFill(style.color, style.alpha);
  g.drawPolygon(
    new PIXI.Polygon([
      new PIXI.Point(end.x, -end.z),
      new PIXI.Point(shaftEnd.x + px * headWidth, -shaftEnd.z - pz * headWidth),
      new PIXI.Point(shaftEnd.x - px * headWidth, -shaftEnd.z + pz * headWidth),
    ])
  );
  g.endFill();
}

function AreaPolygonsView(props: AreaPolygonsViewProps) {
  const selectedTrackInEditMode =
    props.editMode === EditMode.EditTrack ? props.selectedTrack : undefined;
  const shouldBlinkPreview = props.previewAreaId !== undefined;
  const [previewBlinkOn, setPreviewBlinkOn] = useState(true);

  useEffect(() => {
    if (!shouldBlinkPreview) {
      setPreviewBlinkOn(true);
      return;
    }

    const timerId = window.setInterval(() => {
      setPreviewBlinkOn((value) => !value);
    }, 400);

    return () => {
      window.clearInterval(timerId);
    };
  }, [shouldBlinkPreview, props.previewAreaId]);

  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();

      const areaCenters = new Map<string, AreaCenterPoint>();
      props.areas.forEach((area, key) => {
        const center = areaCenter(area, props.vertexes);
        if (center) {
          areaCenters.set(key, center);
        }
      });

      g.lineStyle(0.2, 0x0000ff, 1);
      props.areas.forEach((area, key) => {
        const isPreviewArea = key === props.previewAreaId;
        const inSelectedTrack =
          selectedTrackInEditMode !== undefined &&
          props.tracks
            .get(selectedTrackInEditMode)
            ?.areas.some((entry) => entry.areaName === key);

        if (isPreviewArea && previewBlinkOn) {
          g.beginFill(0x400000, 0.2);
        } else if (key === props.selectedArea) {
          const p = props.vertexes.get(area.vertexes[area.leftVertexInnerId]);
          if (p) {
            g.lineStyle(1, 0x0000ff, 0.7);
            g.drawCircle(p.x, -p.z, 1.5);
          }
          if (inSelectedTrack) {
            g.beginFill(0xa0ffa0, 0.2);
          } else {
            g.beginFill(0x8080ff, 0.2);
          }
        } else if (inSelectedTrack) {
          g.beginFill(0x00c000, 0.3);
        } else {
          g.beginFill(0x0000ff, 0.3);
        }

        g.lineStyle(0.2, 0x0000ff, 1);
        const polygon = new PIXI.Polygon(
          area.vertexes
            .map((vertexId) => {
              const vertex = props.vertexes.get(vertexId);
              if (vertex) {
                return new PIXI.Point(vertex.x, -vertex.z);
              }
            })
            .filter((vertex): vertex is Exclude<typeof vertex, undefined> => vertex !== undefined)
        );
        g.drawPolygon(polygon);
        g.endFill();
      });

      if (props.editMode !== EditMode.EditTrack) {
        // UpArea links are visible in area edit modes and rendered from uparea -> target area.
        props.areas.forEach((targetArea, targetAreaId) => {
          const targetCenter = areaCenters.get(targetAreaId);
          if (!targetCenter) {
            return;
          }

          targetArea.uparea.forEach((sourceAreaId) => {
            const sourceCenter = areaCenters.get(sourceAreaId);
            if (!sourceCenter) {
              return;
            }

            const reciprocal =
              props.areas.get(sourceAreaId)?.uparea.includes(targetAreaId) === true;
            const offset = reciprocal ? (sourceAreaId < targetAreaId ? 0.8 : -0.8) : 0;
            drawDirectionalArrow(g, sourceCenter, targetCenter, {
              color: 0x008c00,
              alpha: 0.7,
              width: 1,
              offset,
              headLength: 1.8,
            });
          });
        });
      }

      // Track chain arrows are rendered only for the selected track in track-edit mode.
      if (selectedTrackInEditMode) {
        const selectedTrack = props.tracks.get(selectedTrackInEditMode);
        if (selectedTrack) {
          for (let i = 1; i < selectedTrack.areas.length; i++) {
            const fromAreaId = selectedTrack.areas[i - 1].areaName;
            const toAreaId = selectedTrack.areas[i].areaName;
            const fromCenter = areaCenters.get(fromAreaId);
            const toCenter = areaCenters.get(toAreaId);
            if (!fromCenter || !toCenter) {
              continue;
            }

            drawDirectionalArrow(g, fromCenter, toCenter, {
              color: 0x00a0ff,
              alpha: 0.85,
              width: 0.45,
              headLength: 2.2,
            });
          }
        }
      }

      g.lineStyle(0);
      props.vertexes.forEach((vertex, key) => {
        if (key === props.nearestIndex) {
          g.beginFill(0xff0000, 1);
          g.drawCircle(vertex.x, -vertex.z, 1);
        }
        g.beginFill(0x0000ff, 1);
        g.drawCircle(vertex.x, -vertex.z, 0.4);
        g.endFill();
      });
    },
    [
      props.areas,
      props.editMode,
      props.nearestIndex,
      props.previewAreaId,
      props.selectedArea,
      props.tracks,
      props.vertexes,
      previewBlinkOn,
      selectedTrackInEditMode,
    ]
  );

  return <Graphics draw={draw} />;
}

export default React.memo(AreaPolygonsView);
