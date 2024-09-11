import "./index.css";
import { Application, Container } from "pixi.js";
import { Viewport } from "pixi-viewport";
import { GridLines } from "./graphics/grid-lines.ts";
import { Engine, Entity } from "tick-knock";
import { createDot } from "./entities/dot.ts";
import { DotRenderSystem } from "./systems/dot-render.ts";
import { ToolbarBackground } from "./graphics/toolbar-background.ts";
import { createCurrentColor } from "./entities/current-color.ts";
import { currentColorQuery, PaletteSystem } from "./systems/palette.ts";
import { Color } from "./components/color.ts";
import { TashiNetworkSystem } from "./systems/tashi-network.ts";

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

// size of toolbar
const TOOLBAR_HEIGHT = 60;

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

// create the container for the viewport
// this is to allow us to have room for the toolbar
const viewportContainer = app.stage.addChild(
  new Container({
    x: 0,
    y: TOOLBAR_HEIGHT,
    height: app$.clientHeight - TOOLBAR_HEIGHT,
  }),
);

// create a 2D viewport
const viewport = new Viewport({
  screenWidth: app$.clientWidth,
  screenHeight: app$.clientHeight - TOOLBAR_HEIGHT,
  worldWidth: WORLD_WIDTH,
  worldHeight: WORLD_HEIGHT,
  events: app.renderer.events,
  disableOnContextMenu: true,
});

// start with a 3x zoom (for extra oomph when the user zooms out)
viewport.scale = 3;

// add the viewport to the PIXI stage
viewportContainer.addChild(viewport);

// viewport: allow dragging the viewport to move (both with finger on phone and mouse)
viewport.drag({
  // free the left mouse button to place dots
  mouseButtons: "middle-right",
  clampWheel: true,
});

// viewport: enable zoom with pinch or mouse wheel
viewport.pinch().wheel();

// viewport: enable a deceleration after a movement
viewport.decelerate();

// viewport: clamp world boundaries and min/max zoom
viewport.clampZoom({ minScale: 0.4, maxScale: 7 });
viewport.clamp({
  left: -20,
  top: -20,
  right: WORLD_WIDTH + 20,
  bottom: WORLD_HEIGHT + 20,
  underflow: "center",
});

// add grid lines to help communicate where dots will be placed
viewport.addChild(
  new GridLines({
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    dotSize: DOT_SIZE,
    strokeColor: 0xe0e0e0,
  }),
);

// add toolbars to top and bottom
// the toolbar is only for palette for now
app.stage.addChild(
  new ToolbarBackground({
    toolbarHeight: TOOLBAR_HEIGHT,
    toolbarWidth: app$.clientWidth,
  }),
);

// start up the entity component system to handle
// the data and rendering and network systems
const engine = new Engine();

engine.addQuery(currentColorQuery);
engine.addSystem(new TashiNetworkSystem());
engine.addSystem(new PaletteSystem(app.stage));
engine.addSystem(
  new DotRenderSystem(viewport, {
    dotSize: DOT_SIZE,
  }),
);

// set the initial current color
createCurrentColor(engine, { initialColor: 0xef5350 });

// listen to tap events on the viewport
// on tap, find the cell and then create a dot entity
viewport.onclick = (event) => {
  const x = (event.clientX - viewport.x) / viewport.scale.x;
  const y = (event.clientY - viewport.y - TOOLBAR_HEIGHT) / viewport.scale.y;

  const dotX = Math.floor(x / DOT_SIZE);
  const dotY = Math.floor(y / DOT_SIZE);
  const { color } = currentColorQuery.first!.get(Color)!;

  createDot(engine, { x: dotX, y: dotY, color });
};
