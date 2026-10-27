const FRAME_SIZE = 256;
const COLUMNS = 5;
const FRAME_COUNT = 15;
const FRAMES_PER_SECOND = 10;
let cycle: Promise<HTMLImageElement | null> | null = null;

function loadCycle() {
  if (!cycle) {
    const image = new Image();
    image.decoding = "async";
    image.src = "/ai/thinking-cycle.webp";
    cycle = image.decode().then(() => image, () => { cycle = null; return null; });
  }
  return cycle;
}

/** Owner-supplied reference slices, tightly cropped and blended at display rate. */
export function createThinkingSphere(canvas: HTMLCanvasElement) {
  const context = canvas.getContext("2d");
  if (!context) return null;
  const ctx = context;
  let atlas: HTMLImageElement | null = null;
  let mask: CanvasGradient;
  const ready = loadCycle().then(image => { atlas = image; return image !== null; });

  function resize() {
    const size = Math.min(512, Math.max(96, Math.ceil(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 2))));
    if (canvas.width === size && canvas.height === size && mask) return;
    canvas.width = canvas.height = size;
    // Feather away the screenshot background outside the orb; no page chrome,
    // cursor, selection handles or rectangular frame enters the button.
    mask = ctx.createRadialGradient(size / 2, size / 2, size * .43, size / 2, size / 2, size * .5);
    mask.addColorStop(0, "#fff");
    mask.addColorStop(.65, "#fff");
    mask.addColorStop(1, "#fff0");
  }

  function clear() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function draw(time: number, blend: number) {
    clear();
    if (!atlas) return;
    const position = time * FRAMES_PER_SECOND;
    const current = Math.floor(position) % FRAME_COUNT;
    const next = (current + 1) % FRAME_COUNT;
    const fraction = position - Math.floor(position);
    const size = canvas.width;
    const growth = .84 + blend * .16;
    const inset = (1 - growth) * size / 2;

    function frame(index: number) {
      ctx.drawImage(atlas!, index % COLUMNS * FRAME_SIZE, Math.floor(index / COLUMNS) * FRAME_SIZE,
        FRAME_SIZE, FRAME_SIZE, inset, inset, size * growth, size * growth);
    }

    ctx.save();
    ctx.imageSmoothingQuality = "high";
    frame(current);
    // Interpolation also bridges the final / first frame. Timing is continuous
    // while hovered and never depends on further pointermove events.
    ctx.globalAlpha = fraction;
    frame(next);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = mask;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  resize();
  return { resize, clear, draw, ready };
}
