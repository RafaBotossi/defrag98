export interface VirtualFile {
  id: number;
  size: number;
  clusterIds: number[];
  colorGroup: number;
}
export interface Move {
  from: number;
  to: number;
  cluster: number;
}
export type Phase = "ready" | "running" | "paused" | "complete";
export function createSimulation(
  config: { seed?: number; size?: number } = {},
) {
  const size = config.size ?? 4096;
  if (!Number.isInteger(size) || size < 128 || size > 16384)
    throw new RangeError("Invalid disk size");
  let seed = (config.seed ?? 98) >>> 0;
  const random = () => {
    seed += 0x6d2b79f5;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const target = new Int32Array(size);
  const files: VirtualFile[] = [];
  const groups = new Uint8Array(size + 1);
  let cluster = 0;
  for (let p = 0; p < size;) {
    if (p % 512 < 10) {
      target[p++] = -1;
      continue;
    }
    if (p % 512 >= 504) {
      target[p++] = -2;
      continue;
    }
    if (p > size * 0.77) {
      p++;
      continue;
    }
    const length = Math.min(
      4 + Math.floor(random() * 45),
      504 - (p % 512),
      Math.floor(size * 0.77) - p + 1,
    );
    const file: VirtualFile = {
      id: files.length + 1,
      size: length,
      clusterIds: [],
      colorGroup: files.length % 4,
    };
    for (let j = 0; j < length; j++) {
      target[p++] = ++cluster;
      groups[cluster] = file.colorGroup;
      file.clusterIds.push(cluster);
    }
    files.push(file);
  }
  const disk = target.slice();
  const movable: number[] = [];
  for (let i = 0; i < size; i++) if (disk[i] >= 0) movable.push(i);
  for (let i = movable.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    const a = movable[i],
      b = movable[j];
    [disk[a], disk[b]] = [disk[b], disk[a]];
  }
  const initial = disk.slice(),
    plan = disk.slice(),
    positions = new Int32Array(cluster + 1);
  const free = new Set<number>();
  for (let i = 0; i < size; i++) {
    if (plan[i] > 0) positions[plan[i]] = i;
    else if (!plan[i]) free.add(i);
  }
  const moves: Move[] = [];
  const transfer = (from: number, to: number) => {
    const id = plan[from];
    moves.push({ from, to, cluster: id });
    plan[to] = id;
    plan[from] = 0;
    positions[id] = to;
    free.delete(to);
    free.add(from);
  };
  for (let to = 0; to < size; to++) {
    const wanted = target[to];
    if (wanted <= 0 || plan[to] === wanted) continue;
    if (plan[to] > 0) transfer(to, free.values().next().value!);
    transfer(positions[wanted], to);
  }
  let phase: Phase = "ready",
    completed = 0,
    elapsed = 0,
    speed = 1;
  const listeners = new Set<(move: Move) => void>();
  return {
    disk,
    target,
    files,
    groups,
    moves,
    get phase() {
      return phase;
    },
    get completed() {
      return completed;
    },
    get activeMove() {
      return phase === "complete" ? undefined : moves[completed];
    },
    get fraction() {
      return elapsed / (32 / speed);
    },
    getProgress: () => (moves.length ? (completed / moves.length) * 100 : 100),
    start() {
      if (phase !== "complete") phase = moves.length ? "running" : "complete";
    },
    pause() {
      if (phase === "running") phase = "paused";
    },
    reset() {
      disk.set(initial);
      completed = elapsed = 0;
      phase = "ready";
    },
    setSpeed(value: number) {
      if (!Number.isFinite(value)) return;
      speed = Math.max(0.25, Math.min(16, value));
    },
    subscribeToMove(callback: (move: Move) => void) {
      listeners.add(callback);
      return () => {
        listeners.delete(callback);
      };
    },
    advance(delta: number) {
      if (phase !== "running" || !Number.isFinite(delta) || delta <= 0) return;
      elapsed += Math.min(delta, 64);
      const duration = 32 / speed;
      while (elapsed >= duration && completed < moves.length) {
        elapsed -= duration;
        const move = moves[completed++];
        disk[move.to] = move.cluster;
        disk[move.from] = 0;
        listeners.forEach((callback) => callback(move));
      }
      if (completed === moves.length) {
        phase = "complete";
        elapsed = 0;
      }
    },
  };
}
export type Simulation = ReturnType<typeof createSimulation>;
