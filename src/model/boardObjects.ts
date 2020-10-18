import { action, computed, makeObservable, observable } from "mobx";
import { OffscreenContext } from "../context";
import { BoardObject, createBoardObject } from "./boardObject";
import _ from "lodash";
import { ObjectType } from "../typings";
import { getRandomColor, getRandomInt } from "../helpers/utils";

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
    const objects: Record<string, BoardObject> = {}
    for (let i = 0; i < 10000; i++) {
      const id = `id-${_.padStart(`${i}`, 6, '0')}`
      objects[id] = createBoardObject({
        id,
        objectType: ObjectType.rectangle,
        coords: {
          left: _.random(-5000, 5000),
          top: _.random(-5000, 5000)
        },
        width: _.random(20, 100),
        height: _.random(20, 100),
        color: getRandomColor(),
        zIndex: i,
      }, this.ctx)
    }
    this.byId.replace(objects)
  }
}
