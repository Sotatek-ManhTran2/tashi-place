import {
  Entity,
  EntitySnapshot,
  IterativeSystem,
  ReadonlyEntity,
} from "tick-knock";
import { Position } from "../components/position.ts";
import { Color } from "../components/color.ts";
import type { Viewport } from "pixi-viewport";
import { Sprite, Texture } from "pixi.js";
import { DOT, FINALIZED } from "../entities/dot.ts";

export class DotRenderSystem extends IterativeSystem {
  constructor(
    private readonly viewport: Viewport,
    private readonly options: {
      dotSize: number;
    },
  ) {
    super((entity) => {
      // we render dot-tagged entities that have both a position and color and are tagged as finalized
      return entity.hasAll(Position, Color, DOT, FINALIZED);
    });
  }

  protected updateEntity(entity: Entity) {
    this.addOrUpdateEntityOnViewport(entity);
  }

  protected override entityAdded = ({ current }: EntitySnapshot) => {
    this.addOrUpdateEntityOnViewport(current);
  };

  protected override entityRemoved = (snapshot: EntitySnapshot) => {
    this.removeEntityOnViewport(snapshot.current.id);
  };

  private addOrUpdateEntityOnViewport(entity: Entity) {
    const position = entity.get(Position)!;

    let dot = this.viewport.getChildByLabel(
      `dot-${position.x}-${position.y}`,
    ) as Sprite | null;

    if (dot == null) {
      dot = this.viewport.addChild(new Sprite(Texture.WHITE));
      dot.label = `dot-${position.x}-${position.y}`;
      dot.width = dot.height = this.options.dotSize;
      dot.x = position.x * this.options.dotSize;
      dot.y = position.y * this.options.dotSize;
    }

    this.updateEntityOnViewport(dot, entity);
  }

  private updateEntityOnViewport(dot: Sprite, entity: Entity) {
    const { color } = entity.get(Color)!;

    dot.tint = color;
  }

  private removeEntityOnViewport(entityId: number) {
    const dot = this.viewport.getChildByLabel(`dot-${entityId}`);

    if (dot != null) {
      this.viewport.removeChild(dot);
    }
  }
}
