import { Entity, EntitySnapshot, QueryBuilder, System } from "tick-knock";
import { Color } from "../components/color.ts";
import { PALETTE_CURRENT_COLOR } from "../entities/current-color.ts";
import { Container, Graphics, Sprite, Texture } from "pixi.js";
import * as colors from "material-colors";

const paletteColors: number[] = [0xffffff, 0x000000];

for (const colorName of [
  "grey",
  "blueGrey",
  "red",
  "pink",
  "purple",
  "deepPurple",
  "indigo",
  "blue",
  "lightBlue",
  "cyan",
  "teal",
  "green",
  "lightGreen",
  "lime",
  "yellow",
  "amber",
  "orange",
  "deepOrange",
  "brown",
] as (keyof typeof colors)[]) {
  paletteColors.push(
    parseInt((colors[colorName]["300"] as string).slice(1), 16)
  );

  paletteColors.push(
    parseInt((colors[colorName]["800"] as string).slice(1), 16)
  );
}

export const currentColorQuery = new QueryBuilder()
  .contains(Color)
  .contains(PALETTE_CURRENT_COLOR)
  .build();

export class PaletteSystem extends System {
  constructor(private readonly container: Container) {
    super();

    this.addPaletteOnViewport();
  }

  public override onAddedToEngine(): void {
    currentColorQuery.onEntityAdded.connect(this.onEntityAdded);
  }

  private onEntityAdded = ({ current }: EntitySnapshot) => {
    this.addOrUpdateCurrentColorDisplayOnViewport(current);
  };

  private addOrUpdateCurrentColorDisplayOnViewport(entity: Entity) {
    const label = `palette:current-color`;
    let current = this.container.getChildByLabel(label) as Graphics | null;

    if (current == null) {
      current = this.container.addChild(new Graphics());
      current.label = label;
    }

    current.clear();
    current.roundRect(10, 10, 40, 40, 4);
    current.fill(entity.get(Color)!.color);
    current.stroke({ color: 0xfafafa, width: 1.5 });
  }

  private addPaletteOnViewport() {
    let x = 60;
    let y = 10;

    for (const color of paletteColors) {
      const label = `palette:${color}`;

      let palette = this.container.getChildByLabel(label) as Graphics | null;

      if (palette == null) {
        palette = this.container.addChild(new Graphics());
        palette.label = label;
        palette.onclick = this.onPaletteClick.bind(this, color);
        palette.eventMode = "static";
      }

      palette.clear();

      palette.roundRect(x, y, 18, 18, 2);
      palette.fill(color);
      palette.stroke({ color: 0xfafafa, width: 1 });

      if (y == 10) {
        y += 18 + 4;
      } else {
        x += 18 + 4;
        y = 10;
      }
    }
  }

  private onPaletteClick(color: number) {
    currentColorQuery.first?.addComponent(new Color(color));
  }
}
