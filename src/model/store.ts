import { action, makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { hasOffscreenCanvas } from "../helpers/offscreenCanvas";
import { BoardObjects } from "./boardObjects";
import { InteractionHandler } from "./interaction";
import { Viewport } from "./viewport";

export class Store {
  ctx: OffscreenContext;

  screenSize = { width: 0, height: 0 };
  viewport: Viewport;
  interaction: InteractionHandler;
  objects: BoardObjects;

  useOffscreenCanvas = hasOffscreenCanvas;
  animateVpt = false

  constructor(ctx: OffscreenContext) {
    this.ctx = ctx;
    this.viewport = new Viewport(ctx);
    this.interaction = new InteractionHandler(ctx);
    this.objects = new BoardObjects(ctx);
    this.objects.init();

    makeObservable(this, {
      screenSize: observable.shallow,
      useOffscreenCanvas: observable,
      animateVpt: observable,
      setScreenSize: action,
      setUseOffscreenCanvas: action,
    });
  }

  setScreenSize(width: number, height: number) {
    this.screenSize = {
      width,
      height,
    };
  }

  setUseOffscreenCanvas(useOffscreenCanvas: boolean) {
    this.useOffscreenCanvas = useOffscreenCanvas;
  }

  setAnimateVpt(animateVpt: boolean) {
    this.animateVpt = animateVpt;
  }
}
