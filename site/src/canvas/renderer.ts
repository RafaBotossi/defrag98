import type { Simulation } from "./simulation";
export const colors = ["#42afb4", "#368aab", "#708fcd", "#63bba0"];
export function createRenderer(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext("2d", { alpha: false });
  if (!ctx) throw new Error("Canvas 2D is unavailable");
  let width = 0,
    height = 0,
    dirty = true,
    previous: Simulation | undefined,
    previousCompleted = -1,
    previousReduced = false,
    previousPhase = "";
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
    draw(sim: Simulation, reduced: boolean) {
      if (
        !dirty &&
        previous === sim &&
        previousCompleted === sim.completed &&
        previousReduced === reduced &&
        previousPhase === sim.phase &&
        (sim.phase !== "running" || reduced)
      )
        return;
      dirty = false;
      previous = sim;
      previousCompleted = sim.completed;
      previousReduced = reduced;
      previousPhase = sim.phase;
      const columns = sim.disk.length === 1024 ? 32 : 64,
        rows = Math.ceil(sim.disk.length / columns);
      const cw = width / columns,
        ch = height / rows;
      ctx.fillStyle = "#101d29";
      ctx.fillRect(0, 0, width, height);
      for (let i = 0; i < sim.disk.length; i++) {
        const value = sim.disk[i],
          x = (i % columns) * cw,
          y = Math.floor(i / columns) * ch;
        ctx.fillStyle =
          value === -1
            ? "#aa91c5"
            : value === -2
              ? "#b3a77c"
              : value === 0
                ? "#203342"
                : colors[sim.groups[value]];
        ctx.fillRect(x + 1, y + 1, Math.max(1, cw - 2), Math.max(1, ch - 2));
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
        ctx.fillStyle = "#f8d779";
        ctx.fillRect(
          (m.to % columns) * cw,
          Math.floor(m.to / columns) * ch,
          cw,
          ch,
        );
        ctx.fillStyle = "#fff4d1";
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
        ctx.fillStyle = "#b7ebbc";
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
    if (previous) renderer.draw(previous, previousReduced);
  };
  return renderer;
}
