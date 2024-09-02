import Konva from "konva";
import { useEffect, useRef } from "react";
import { Layer } from "react-konva";

const SCENE_WIDTH = 1_500;
const SCENE_HEIGHT = 1_500;
const GRID_STEP_SIZE = 8;

export default function Grid() {
  const layer = useRef<Konva.Layer>(null);

  useEffect(() => {
    drawLines(layer.current!);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [layer]);

  return <Layer ref={layer} x={0} y={0} draggable={false} />;
}

function drawLines(layer: Konva.Layer) {
  const stage = layer.getStage();

  layer.clear();
  layer.destroyChildren();

  const stageRect = {
    x1: 0,
    y1: 0,
    x2: stage.width(),
    y2: stage.height(),
    offset: {
      x: stage.position().x / stage.scaleX(),
      y: stage.position().y / stage.scaleX(),
    },
  };

  const viewRect = {
    x1: -stageRect.offset.x,
    y1: -stageRect.offset.y,
    x2: SCENE_WIDTH / stage.scaleX() - stageRect.offset.x,
    y2: SCENE_HEIGHT / stage.scaleX() - stageRect.offset.y,
  };

  // and find the largest rectangle that bounds both the stage and view rect.
  // This is the rect we will draw on.
  const fullRect = {
    x1: Math.min(stageRect.x1, viewRect.x1),
    y1: Math.min(stageRect.y1, viewRect.y1),
    x2: Math.max(stageRect.x2, viewRect.x2),
    y2: Math.max(stageRect.y2, viewRect.y2),
  };

  const x = fullRect.x2 - fullRect.x1;
  const y = fullRect.y2 - fullRect.y1;

  // const x = layer.getStage().width();
  // const y = layer.getStage().height();
  const xSteps = Math.ceil(x / GRID_STEP_SIZE);
  const ySteps = Math.ceil(y / GRID_STEP_SIZE);

  // draw vertical lines

  const vertical = new Konva.Line({
    points: [0, 0, 0, y],
    stroke: "rgb(233, 233, 233)",
    strokeWidth: 1,
  });

  vertical.cache();

  for (let i = 0; i < xSteps; i++) {
    layer.add(
      vertical.clone({
        x: i * GRID_STEP_SIZE,
      }),
    );
  }

  // draw horizontal lines

  const horizontal = new Konva.Line({
    points: [0, 0, x, 0],
    stroke: "rgb(233, 233, 233)",
    strokeWidth: 1,
  });

  horizontal.cache();

  for (let i = 0; i <= ySteps; i++) {
    layer.add(
      horizontal.clone({
        y: i * GRID_STEP_SIZE,
      }),
    );
  }

  layer.batchDraw();
}
