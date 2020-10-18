function doesBrowserSupportOffscreenCanvas(): boolean {
  try {
    const canvas = new OffscreenCanvas(0, 0);
    const context = canvas.getContext("2d", { alpha: true });
    return !!context;
  } catch {
    return false;
  }
}

export const hasOffscreenCanvas = doesBrowserSupportOffscreenCanvas()
