"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import Konva from "konva";
import GridLines from "../components/GridLines.tsx";
import { connectFoxMQ } from "../services/foxmq.ts";
import type { MqttClient } from "mqtt";

const SCENE_WIDTH = 1_500;
const SCENE_HEIGHT = 1_500;
const GRID_STEP_SIZE = 8;

const colors = [
  "F44336",
  "E91E63",
  "9C27B0",
  "673AB7",
  "3F51B5",
  "2196F3",
  "2196F3",
  "03A9F4",
  "00BCD4",
  "009688",
  "4CAF50",
  "8BC34A",
  "CDDC39",
  "FFEB3B",
  "FFC107",
  "FF9800",
  "FF5722",
];

const colorIndex = Math.floor(Math.random() * (colors.length - 1) + 1) - 1;
const randomColor = colors[colorIndex];
console.log(">>", randomColor, colorIndex);

interface Dot {
  position: [number, number];
  color: string;
}

export default function Page() {
  const stage = useRef<Konva.Stage>(null);
  const layer = useRef<Konva.Layer>(null);

  const [dots, setDots] = useState(new Map<string, string>());

  // TODO: clean up foxMQ usage and extract to more helpers

  const [foxmq, setFoxmq] = useState<MqttClient>();

  const onMessage = useCallback((topic: string, message: Buffer) => {
    switch (topic) {
      case "dot": {
        const dot = JSON.parse(message.toString()) as Dot;

        // add this to the map
        setDots((dots) => new Map(dots).set(dot.position.join(","), dot.color));
      }
    }
  }, []);

  // on page mount, connect to Fox MQ
  useEffect(() => {
    connectFoxMQ({
      endpoint: {
        hostname: process.env.NEXT_PUBLIC_FOXMQ_HOSTNAME,
        username: process.env.NEXT_PUBLIC_FOXMQ_USERNAME,
        password: process.env.NEXT_PUBLIC_FOXMQ_PASSWORD,
      },
    }).then(async (client) => {
      await client.subscribeAsync("dot");

      setFoxmq(client);

      client.on("message", onMessage);
    });
  }, []);

  function handleClick(e: Konva.KonvaEventObject<MouseEvent>) {
    const stage = e.target.getStage()!;
    const pointer = stage.getPointerPosition();
    if (pointer == null) return;

    const x = Math.floor(pointer.x / stage.scaleX() / GRID_STEP_SIZE);
    const y = Math.floor(pointer.y / stage.scaleY() / GRID_STEP_SIZE);

    const dot = { position: [x, y], color: randomColor };
    void foxmq?.publishAsync("dot", JSON.stringify(dot));
  }

  useEffect(() => {
    drawDots(dots, layer.current!);
  }, [layer, dots]);

  return (
    <div className="w-full overflow-clip flex flex-col h-dvh">
      <Stage
        ref={stage}
        width={SCENE_WIDTH}
        height={SCENE_HEIGHT}
        scaleX={1.5}
        scaleY={1.5}
        onClick={handleClick}
      >
        <GridLines />
        <Layer ref={layer} x={0} y={0} draggable={false} />
      </Stage>
    </div>
  );
}

function drawDots(dots: Map<string, string>, layer: Konva.Layer) {
  layer.clear();
  layer.destroyChildren();

  for (const [position, color] of dots.entries()) {
    const [x, y] = position.split(",").map(Number);

    layer.add(
      new Konva.Rect({
        x: x * GRID_STEP_SIZE,
        y: y * GRID_STEP_SIZE,
        width: GRID_STEP_SIZE,
        height: GRID_STEP_SIZE,
        fill: "#" + color,
      }),
    );
  }

  layer.batchDraw();
}
