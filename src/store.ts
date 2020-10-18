import { action, computed, makeObservable, observable } from "mobx";
import { AnimateMode } from "./typings/events";

class Viewport {
  zoom: number = 100;
  tx: number = 0;
  ty: number = 0;

  constructor() {
    makeObservable(this, {
      zoom: observable,
      tx: observable,
      ty: observable,
      scale: computed,
      setTransform: action,
    });
  }

  get scale() {
    return this.zoom / 100
  }

  setTransform({ zoom, tx, ty }: Pick<Viewport, 'tx' | 'ty' | 'zoom'>, animateMode = AnimateMode.NONE) {
    this.zoom = zoom;
    this.tx = tx;
    this.ty = ty;
  }
}

export class Store {
  screenSize = { width: 0, height: 0 };
  viewport: Viewport = new Viewport();

  constructor() {
    makeObservable(this, {
      screenSize: observable,
      setScreenSize: action,
    });
  }

  setScreenSize(width: number, height: number) {
    this.screenSize.width = width;
    this.screenSize.height = height;
  }
}
