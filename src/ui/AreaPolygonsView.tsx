import React, { useCallback } from 'react';
import { Graphics } from '@pixi/react';
import { Graphics as PIXIGraphics } from 'pixi.js';

function AreaPolygonsView(props: any) {
  const draw = useCallback(
    (g: PIXIGraphics) => {
      g.clear();
      g.beginFill(0xff0000, 1);
      g.drawRect(-10, -10, 20, 20);
      g.endFill();
    },
    [props],
  );

  return <Graphics draw={draw} />;
}

export default AreaPolygonsView;