import { action, computed, makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { AnimateMode } from "../typings";

export class Viewport {
  ctx: OffscreenContext;

  zoom: number = 100;
  tx: number = 0;
  ty: number = 0;

  constructor(ctx: OffscreenContext) {
    this.ctx = ctx;

    makeObservable(this, {
      zoom: observable,
      tx: observable,
      ty: observable,
      scale: computed,
      setTransform: action,
    });
  }

  get scale() {
    return this.zoom / 100;
  }

  setTransform(
    { zoom, tx, ty }: Pick<Viewport, "tx" | "ty" | "zoom">,
    animateMode = AnimateMode.NONE
  ) {
    this.zoom = zoom;
    this.tx = tx;
    this.ty = ty;
  }
}
