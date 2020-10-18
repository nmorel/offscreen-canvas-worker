import { AnimateMode, PanAction, ParamsAction } from "../typings";

export const pan = ({
  ctx: {
    store: { viewport },
  },
  prevEvent,
  lastEvent,
}: ParamsAction<PanAction>) => {
  viewport.setTransform(
    {
      tx: viewport.tx + (lastEvent.clientX - prevEvent.clientX),
      ty: viewport.ty + (lastEvent.clientY - prevEvent.clientY),
      zoom: viewport.zoom,
    },
    lastEvent.pointerType === "touch"
      ? AnimateMode.TOUCH_PAN
      : AnimateMode.MOUSE_PAN
  );
};
