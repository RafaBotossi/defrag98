import type { Simulation } from "./simulation";
import { palettes, type Theme } from '../themes';
export function createRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  let width = 0,
    height = 0,
    dirty = true,
    previous: Simulation | undefined,
    previousCompleted = -1,
    previousReduced = false,
    previousPhase = "",
    previousTheme: Theme = 'original';
  const resize = () => {
    const r = canvas.getBoundingClientRect(),
      dpr = Math.min(devicePixelRatio || 1, 2);
    width = r.width;
    height = r.height;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  let redraw = () => {};
  const observer = new ResizeObserver(() => {
    resize();
    dirty = true;
    redraw();
  });
  observer.observe(canvas);
  resize();
  const renderer = {
    get columns() { return Math.max(16, Math.round(Math.sqrt((previous?.disk.length ?? 4096) * width / Math.max(height, 1)))); },
    draw(sim: Simulation, reduced: boolean, theme: Theme = 'original') {
      if (
        !dirty &&
        previous === sim &&
        previousCompleted === sim.completed &&
        previousReduced === reduced &&
        previousPhase === sim.phase &&
        previousTheme === theme &&
        (sim.phase !== "running" || reduced)
      )
        return;
      dirty = false;
      previous = sim;
      previousCompleted = sim.completed;
      previousReduced = reduced;
      previousPhase = sim.phase;
      previousTheme = theme;
      const palette = palettes[theme];
      const columns = Math.max(16, Math.round(Math.sqrt(sim.disk.length * width / Math.max(height, 1)))),
        rows = Math.ceil(sim.disk.length / columns);
      const cw = width / columns,
        ch = height / rows;
      ctx.fillStyle = palette.background;
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < sim.disk.length; i++) {
        const value = sim.disk[i],
          x = (i % columns) * cw,
          y = Math.floor(i / columns) * ch;
        ctx.fillStyle =
          value === -1
            ? palette.system
            : value === -2
              ? palette.locked
              : value === 0
                ? palette.free
                : palette.used[theme === 'rainbow' ? value % palette.used.length : sim.groups[value]];
        if (theme === 'win98' && value !== 0) {
          ctx.fillStyle = '#000000'; ctx.fillRect(x + 1, y + 1, Math.max(1, cw - 2), Math.max(1, ch - 2));
          ctx.fillStyle = value === -1 ? palette.system : value === -2 ? palette.locked : palette.used[0];
          ctx.fillRect(x + 2, y + 2, Math.max(1, cw - 4), Math.max(1, ch - 4));
          if (value === -1) {
            ctx.fillStyle = '#00ffff';
            for (let sy = 3; sy < ch - 2; sy += 3) for (let sx = 3; sx < cw - 2; sx += 3) ctx.fillRect(x + sx, y + sy, 1, 1);
          }
          continue;
        }
        ctx.fillRect(x + 1, y + 1, Math.max(1, cw - 2), Math.max(1, ch - 2));
        if (theme === 'future' && value > 0) { ctx.fillStyle = '#b0faff'; ctx.fillRect(x + 2, y + 1, Math.max(1, cw - 4), 1); }
        if (value < 0) {
          ctx.fillStyle = "#17202d";
          ctx.fillRect(x + cw / 2, y + 2, 1, Math.max(1, ch - 4));
        }
      }
      if (
        !reduced &&
        (sim.phase === "running" || sim.phase === "paused") &&
        sim.activeMove
      ) {
        const m = sim.activeMove;
        ctx.fillStyle = palette.target;
        ctx.fillRect(
          (m.to % columns) * cw,
          Math.floor(m.to / columns) * ch,
          cw,
          ch,
        );
        ctx.fillStyle = palette.moving;
        ctx.fillRect(
          (m.from % columns) * cw,
          Math.floor(m.from / columns) * ch,
          cw,
          ch,
        );
        const x =
          ((m.from % columns) +
            ((m.to % columns) - (m.from % columns)) * sim.fraction) *
          cw;
        const y =
          (Math.floor(m.from / columns) +
            (Math.floor(m.to / columns) - Math.floor(m.from / columns)) *
              sim.fraction) *
          ch;
        ctx.fillRect(x, y, cw, ch);
      }
      if (!reduced && sim.completed > 0) {
        const m = sim.moves[sim.completed - 1];
        ctx.fillStyle = palette.recent;
        ctx.fillRect(
          (m.to % columns) * cw + 1,
          Math.floor(m.to / columns) * ch + 1,
          cw - 2,
          ch - 2,
        );
      }
    },
    dispose() {
      observer.disconnect();
    },
  };
  redraw = () => {
    if (previous) renderer.draw(previous, previousReduced, previousTheme);
  };
  return renderer;
}
