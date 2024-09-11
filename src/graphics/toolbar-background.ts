import { type ColorSource, Graphics } from "pixi.js";

export class ToolbarBackground extends Graphics {
  constructor(options: { toolbarHeight: number; toolbarWidth: number }) {
    super();

    this.rect(0, 0, options.toolbarWidth, options.toolbarHeight);
    this.fill({ color: 0x212121 });
  }
}
