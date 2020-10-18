import {
  KeyboardEvent as RKeyboardEvent,
  MouseEvent as RMouseEvent,
} from "react";
import { OffscreenContext } from "../helpers/context";

import { modifierKey } from "../helpers/keys";
import { NormalizedEvent, Position } from "../typings/events";

const MIN_ZOOM = 1;
const MAX_ZOOM = 1000;

export const limitZoom = (zoom: number) =>
  Math.min(Math.max(MIN_ZOOM, zoom), MAX_ZOOM);

const calculateNewZoom = (
  { store: { viewport } }: OffscreenContext,
  event: { metaKey: boolean; ctrlKey: boolean },
  delta: number
) => {
  // @ts-ignore
  const modKeyPressed = !!event[`${modifierKey}Key`];
  let newZoom = viewport.zoom;
  if (delta > 0) {
    if (modKeyPressed || viewport.zoom <= 10) {
      newZoom -= 1;
    } else {
      newZoom = Math.round(newZoom / 10) * 10;
      newZoom -= 10;
    }
  } else if (modKeyPressed || viewport.zoom < 10) {
    newZoom += 1;
  } else {
    newZoom = Math.round(newZoom / 10) * 10;
    newZoom += 10;
  }
  return newZoom;
};

export const zoom = (
  { store: { viewport } }: OffscreenContext,
  position: Position,
  newZoom: number
) => {
  newZoom = limitZoom(newZoom);

  const positionCurrentZoom = {
    x: (position.x - viewport.tx) / viewport.zoom,
    y: (position.y - viewport.ty) / viewport.zoom,
  };
  const positionNewZoom = {
    x: positionCurrentZoom.x * newZoom,
    y: positionCurrentZoom.y * newZoom,
  };
  viewport.setTransform({
    tx: Math.round(position.x - positionNewZoom.x),
    ty: Math.round(position.y - positionNewZoom.y),
    zoom: newZoom,
  });
};

export const zoomToCenter = (
  evt: KeyboardEvent | RKeyboardEvent | MouseEvent | RMouseEvent,
  delta: number,
  ctx: OffscreenContext
) => {
  evt.preventDefault();
  zoom(
    ctx,
    { x: ctx.store.screenSize.width / 2, y: ctx.store.screenSize.height / 2 },
    calculateNewZoom(ctx, evt, delta)
  );
};

export const zoomToPoint = (
  evt: NormalizedEvent,
  delta: number,
  ctx: OffscreenContext
) => {
  if (!delta) return;
  const newZoom = calculateNewZoom(ctx, evt, delta);
  zoom(ctx, { x: evt.pointerX, y: evt.pointerY }, newZoom);
};
