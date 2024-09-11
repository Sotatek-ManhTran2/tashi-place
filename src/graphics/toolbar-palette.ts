import { Graphics } from "pixi.js";

export class ToolbarPalette extends Graphics {
  constructor() {
    super();

    // leave room for current color

    this.rect(10, 10, 40, 40);

    this.rect(18 + 40 + 0, 10, 20, 20);

    this.fill({ color: 0xef5350 });
    this.stroke({ color: 0xffffff, width: 1 });

    this.rect(18 + 40 + 20 + 10, 10, 20, 20);

    this.fill({ color: 0xab47bc });
    this.stroke({ color: 0xffffff, width: 1 });
  }
}
