import { computed, makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { calcDisplayedMatrix } from "../helpers/math";
import {
  Coords,
  ObjectGeometry,
  ObjectType,
  OriginX,
  OriginY,
  Scale,
  Skew,
} from "../typings";

export type BaseData = { id: string } & Partial<
  Pick<
    BaseObject,
    | "objectType"
    | "originX"
    | "originY"
    | "coords"
    | "scale"
    | "skew"
    | "angle"
    | "strokeWidth"
    | "zIndex"
  >
>;

export abstract class BaseObject implements ObjectGeometry {
  ctx: OffscreenContext;

  id: string;
  abstract objectType: ObjectType

  originX: OriginX;
  originY: OriginY;

  coords: Coords;
  scale: Scale;
  skew: Skew;
  angle: number;

  strokeWidth: number;

  zIndex: number;

  constructor(data: BaseData, ctx: OffscreenContext) {
    this.ctx = ctx;

    this.id = data.id;

    this.originX = data.originX || OriginX.left;
    this.originY = data.originY || OriginY.top;

    this.coords = data.coords || { left: 0, top: 0 };
    this.scale = data.scale || { scaleX: 1, scaleY: 1 };
    this.skew = data.skew || { skewX: 0, skewY: 0 };
    this.angle = data.angle || 0;

    this.strokeWidth = data.strokeWidth || 0;

    this.zIndex = data.zIndex || 0;

    makeObservable(this, {
      originX: observable,
      originY: observable,
      coords: observable.shallow,
      scale: observable.shallow,
      skew: observable.shallow,
      angle: observable,
      strokeWidth: observable,
      zIndex: observable,

      width: computed,
      height: computed,
      matrix: computed,
    });
  }

  abstract get width(): number
  abstract get height(): number

  get matrix() {
    return calcDisplayedMatrix(this);
  }

  transferableData() {
    return {
      id: this.id,
      objectType: this.objectType,
      matrix: this.matrix,
    }
  }
}
