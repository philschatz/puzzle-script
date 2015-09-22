const canvas = document.getElementById('gameCanvas');

const globals = {
  // Used elsewhere
  canvas: canvas,

  // Local to graphics

  cellwidth: null,
  cellheight: null,
  magnification: null,
  xoffset: null,
  yoffset: null,

  ctx: canvas.getContext('2d'),
  x: 0,
  y: 0,

  canvasdict: {},
  lastDownTarget: null
}

export {globals}
