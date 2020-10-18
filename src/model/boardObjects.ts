import { action, computed, makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { BoardObject, createBoardObject } from "./boardObject";
import _ from "lodash";
import { ObjectType } from "../typings";
import { getRandomColor } from "../helpers/utils";
import imageUrl from "url:../../public/image.jpg";

export class BoardObjects {
  ctx: OffscreenContext;

  byId = observable.map<string, BoardObject>({}, { deep: false });

  constructor(ctx: OffscreenContext) {
    this.ctx = ctx;
    makeObservable(this, {
      items: computed,
      init: action,
    });
  }

  get items() {
    return _.orderBy(Array.from(this.byId.values()), ["zIndex"], ["asc"]);
  }

  init() {
    let nbItems = 0;
    const objects: Record<string, BoardObject> = {};

    // Image jpg
    const idJpg = `id-${_.padStart(`${nbItems}`, 6, "0")}`;
    objects[idJpg] = createBoardObject(
      {
        id: idJpg,
        objectType: ObjectType.image,
        coords: {
          left: -7630,
          top: -5050,
        },
        scale: {
          scaleX: 8,
          scaleY: 8,
        },
        image: {
          src: imageUrl,
          width: 1920,
          height: 1080,
          kind: 'jpg'
        },
        zIndex: nbItems,
      },
      this.ctx
    );
    nbItems++;

    for (let i = 0; i < 10000; i++ && nbItems++) {
      const id = `id-${_.padStart(`${nbItems}`, 6, "0")}`;
      objects[id] = createBoardObject(
        {
          id,
          objectType: ObjectType.rectangle,
          coords: {
            left: _.random(-7500, 7500),
            top: _.random(-5000, 5000),
          },
          width: _.random(20, 100),
          height: _.random(20, 100),
          color: getRandomColor(),
          zIndex: nbItems,
        },
        this.ctx
      );
    }

    this.byId.replace(objects);
  }
}
