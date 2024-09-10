import "./index.css";
import { Application, Graphics, Sprite, Texture } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { GridLines } from "./graphics/grid-lines.ts";

// size of a single dot in the world
const DOT_SIZE = 10;

// number of dots in the world across both axis
const DOTS_X = 1000;
const DOTS_Y = 1000;

// size of the world
const WORLD_WIDTH = DOT_SIZE * DOTS_X;
const WORLD_HEIGHT = DOT_SIZE * DOTS_Y;

// create a new Pixi application
const app = new Application();
const app$ = document.getElementById("app")!;

// initialize the application
await app.init({
  background: 0xf5f5f5,
  resizeTo: app$,
  antialias: true,
  autoDensity: true,
  resolution: window.devicePixelRatio,
});

// append the application's canvas to the DOM
app$.appendChild(app.canvas);

// create a 2D viewport
const viewport = new Viewport({
  screenWidth: app$.clientWidth,
  screenHeight: app$.clientHeight,
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  events: app.renderer.events,
  disableOnContextMenu: true,
});

// start with a 3x zoom (for extra oomph when the user zooms out)
viewport.scale = 3;

// add the viewport to the PIXI stage
app.stage.addChild(viewport);

// viewport: allow dragging the viewport to move (both with finger on phone and mouse)
viewport.drag();

// viewport: enable zoom with pinch or mouse wheel
viewport.pinch().wheel();

// viewport: enable a deceleration after a movement
viewport.decelerate();

// viewport: clamp world boundaries and min/max zoom
viewport.clamp({ direction: "all" });
viewport.clampZoom({ minScale: 0.2, maxScale: 5 });

// add grid lines to help communicate where dots will be placed
viewport.addChild(
  new GridLines({
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    dotSize: DOT_SIZE,
    strokeColor: 0xe0e0e0,
  }),
);

// example: add a red box
const sprite = viewport.addChild(new Sprite(Texture.WHITE));
sprite.tint = 0xff0000;
sprite.width = sprite.height = 10;
sprite.position.set(100, 100);

// example: add a red box
const sprite2 = viewport.addChild(new Sprite(Texture.WHITE));
sprite2.tint = 0xff0000;
sprite2.width = sprite2.height = 10;
sprite2.position.set(2300, 2300);
