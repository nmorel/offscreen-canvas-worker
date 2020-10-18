import { action, makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { BoardObjects } from "./boardObjects";
import { InteractionHandler } from "./interaction";
import { Viewport } from "./viewport";

export class Store {
  ctx: OffscreenContext;

  screenSize = { width: 0, height: 0 };
  viewport: Viewport;
  interaction: InteractionHandler;
  objects: BoardObjects

  constructor(ctx: OffscreenContext) {
    this.ctx = ctx;
    this.viewport = new Viewport(ctx);
    this.interaction = new InteractionHandler(ctx);
    this.objects = new BoardObjects(ctx);
    this.objects.init()

    makeObservable(this, {
      screenSize: observable.shallow,
      setScreenSize: action,
    });
  }

  setScreenSize(width: number, height: number) {
    this.screenSize = {
      width,
      height,
    };
  }
}
