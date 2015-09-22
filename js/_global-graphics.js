const globals = {
  // Used elsewhere
  canvas: null,

  // Local to graphics

  cellwidth: null,
  cellheight: null,
  magnification: null,
  xoffset: null, // TODO: Maybe these Should be 0?
  yoffset: null,

  x: 0,
  y: 0,

  canvasdict: {},
  lastDownTarget: null,
  forceRegenImages: false

}

export function setCanvas(canvas) {
  globals.canvas = canvas;
}

export function getCtx() {
  return globals.canvas.getContext('2d');
}

export {globals}
