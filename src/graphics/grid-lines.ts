import { type ColorSource, Graphics } from "pixi.js";

export class GridLines extends Graphics {
  constructor(options: {
    strokeColor: ColorSource;
    dotSize: number;
    worldWidth: number;
    worldHeight: number;
  }) {
    super();

    this.setStrokeStyle({ color: options.strokeColor, width: 1 });

    for (let x = 0; x < options.worldWidth / options.dotSize; x++) {
      this.moveTo(x * options.dotSize, 0);
      this.lineTo(x * options.dotSize, options.worldHeight);
    }

    this.stroke();

    for (let y = 0; y < options.worldHeight / options.dotSize; y++) {
      this.moveTo(0, y * options.dotSize);
      this.lineTo(options.worldWidth, y * options.dotSize);
    }

    this.stroke();
  }
}
