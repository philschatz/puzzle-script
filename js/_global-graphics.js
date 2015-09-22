const canvas = document.getElementById('gameCanvas');

const globals = {
  // Used elsewhere
  canvas: canvas,

  // Local to graphics

  cellwidth: null,
  cellheight: null,
  magnification: null,
  xoffset: null, // TODO: Maybe these Should be 0?
  yoffset: null,

  ctx: canvas.getContext('2d'),
  x: 0,
  y: 0,

  canvasdict: {},
  lastDownTarget: null,
  forceRegenImages: false

}

export {globals}
