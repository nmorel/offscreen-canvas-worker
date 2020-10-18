import { OffscreenContext } from "../context";
import {
  getCenterPointBetweenTwoPoints,
  getDistanceBetweenTwoPoints,
} from "../helpers/math";
import {
  ActionType,
  NormalizedEvent,
  ParamsAction,
  PinchAction,
  RegisteredEvent,
} from "../typings";
import { zoom } from "./zoom";

export const pinch = ({ ctx, action }: ParamsAction<PinchAction>) => {
  const [first, sec] = Array.from(ctx.store.interaction.pointers.values());
  const newDistance = getDistanceBetweenTwoPoints(
    first.lastEvent.clientX,
    first.lastEvent.clientY,
    sec.lastEvent.clientX,
    sec.lastEvent.clientY
  );
  const { initialDistance, initialScale, centerPoint } = action;
  const scale = newDistance / initialDistance;
  zoom(ctx, centerPoint, Math.round(scale * initialScale * 100));
};

export const initPinchAction = (
  evt: NormalizedEvent,
  otherPointer: RegisteredEvent,
  { store }: OffscreenContext
): PinchAction => {
  // Pinch with 2 fingers
  return {
    type: ActionType.pinch,
    initialDistance: getDistanceBetweenTwoPoints(
      otherPointer.lastEvent.clientX,
      otherPointer.lastEvent.clientY,
      evt.clientX,
      evt.clientY
    ),
    initialScale: store.viewport.scale,
    centerPoint: getCenterPointBetweenTwoPoints(
      otherPointer.lastEvent.clientX,
      otherPointer.lastEvent.clientY,
      evt.clientX,
      evt.clientY
    ),
  };
};
