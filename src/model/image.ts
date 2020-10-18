import { makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { ObjectType } from "../typings";
import { BaseObject, BaseData } from "./baseObject";

type ImageData = {
  src: string;
  width: number;
  height: number;
  kind?: 'jpg' | 'svg'
};

export class Image extends BaseObject {
  objectType: ObjectType.image = ObjectType.image;

  image: ImageData;

  constructor(
    { image, objectType, ...data }: BaseData & { image: ImageData },
    ctx: OffscreenContext
  ) {
    super({ ...data, strokeWidth: 2 }, ctx);
    this.image = image;

    makeObservable(this, {
      image: observable.shallow,
    });
  }

  get width() {
    return this.image.width;
  }

  get height() {
    return this.image.height;
  }

  transferableData() {
    return {
      ...super.transferableData(),
      ...this.image,
    };
  }
}
