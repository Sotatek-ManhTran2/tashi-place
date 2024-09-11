import { Entity, type Engine } from "tick-knock";
import { Color } from "../components/color.ts";

export const PALETTE_CURRENT_COLOR = "PALETTE_CURRENT_COLOR";

export function createCurrentColor(
  engine: Engine,
  options: {
    initialColor: number;
  },
) {
  const entity = new Entity()
    .addComponent(new Color(options.initialColor))
    .addTag(PALETTE_CURRENT_COLOR);

  engine.addEntity(entity);

  return entity.id;
}
