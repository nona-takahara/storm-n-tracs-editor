import { useCallback } from "react";
import { Graphics, Text } from "@pixi/react";
import * as PIXI from "pixi.js";
import AddonVehicle from "../../data/AddonVehicle";

function rotate(c: AddonVehicle, x: number, z: number) {
  return {
    x: x * c.m00 + z * c.m10,
    z: x * c.m01 + z * c.m11,
  };
}

type AddonsViewProps = {
  vehicles: AddonVehicle[];
};

function AddonsView(props: AddonsViewProps) {
  const draw = useCallback(
    (g: PIXI.Graphics) => {
      g.clear();
      g.lineStyle(0.1, 0xff3000, 1);
      for (const c of props.vehicles) {
        const m = [
          rotate(c, -c.size_x / 2, c.size_z / 2),
          rotate(c, -c.size_x / 2, -c.size_z / 2),
          rotate(c, c.size_x / 2, -c.size_z / 2),
          rotate(c, c.size_x / 2, c.size_z / 2),
        ];
        g.beginFill(0xff3000, 0.4);
        g.moveTo(c.x + m[0].x, c.z + m[0].z);
        g.lineTo(c.x + m[1].x, c.z + m[1].z);
        g.lineTo(c.x + m[2].x, c.z + m[2].z);
        g.lineTo(c.x + m[3].x, c.z + m[3].z);
        g.closePath();
        g.drawCircle(c.x, c.z, 0.5);
        g.endFill();
      }
    },
    [props]
  );

  const texts = props.vehicles.map(v => {
    return <Text text={v.tag || ""} x={v.x + 0.8} y={v.z + 0.8} />
  })

  return (
    <>
      {texts}
      <Graphics draw={draw} />
    </>
  );
}

export default AddonsView;
