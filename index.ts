import "./index.css";
import { Application, Sprite, Texture } from "pixi.js";
import { Viewport } from "pixi-viewport";

// world: 2,500 x 2,500 tiles
const WORLD_WIDTH = 2_500;
const WORLD_HEIGHT = 2_500;

// create a new Pixi application
const app = new Application();
const app$ = document.getElementById("app")!;

// initialize the application
await app.init({
  background: "#F5F5F5",
  resizeTo: app$,
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
});

// add the viewport to the PIXI stage
app.stage.addChild(viewport);

// activate default plugins: drag, pinch, wheel
viewport.drag().pinch().wheel().decelerate();

// example: add a red box
const sprite = viewport.addChild(new Sprite(Texture.WHITE));
sprite.tint = 0xff0000;
sprite.width = sprite.height = 100;
sprite.position.set(100, 100);
