import { makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { ObjectType } from "../typings";
import { BaseObject, BaseData } from "./baseObject";

export class Rectangle extends BaseObject {
  objectType: ObjectType.rectangle = ObjectType.rectangle

  rwidth: number;
  rheight: number;

  color: string;

  constructor(
    {
      width,
      height,
      color,
      objectType,
      ...data
    }: Omit<BaseData, "strokeWidth"> & { width: number; height: number; color: string },
    ctx: OffscreenContext
  ) {
    super({ ...data, strokeWidth: 2 }, ctx);
    this.rwidth = width;
    this.rheight = height;
    this.color = color

    makeObservable(this, {
      rwidth: observable,
      rheight: observable,
      color: observable,
    });
  }

  get width() {
    return this.rwidth;
  }

  get height() {
    return this.rheight;
  }

  transferableData() {
    return {
      ...super.transferableData(),
      width: this.width,
      height: this.height,
      color: this.color,
    }
  }
}
