import { Entity, type Engine } from "tick-knock";
import { Position } from "../components/position.ts";
import { Color } from "../components/color.ts";
import { Timestamp } from "../components/timestamp.ts";

export const DOT = "DOT";

// a dot is finalized once it is received back from the network
export const FINALIZED = "FINALIZED";

export function createDot(
  engine: Engine,
  options: {
    x: number;
    y: number;
    color: number;
    finalized?: boolean;
  },
) {
  const entity = new Entity()
    .addComponent(new Position(options.x, options.y))
    .addComponent(new Color(options.color))
    .addComponent(new Timestamp())
    .addTag(DOT);

  if (options.finalized) {
    entity.addTag(FINALIZED);
  }

  engine.addEntity(entity);
}
