import { describe, expect, it } from "vitest";
import { createSimulation } from "./simulation";
describe("virtual disk integrity", () => {
  it("reproduces a seed and changes another seed", () => {
    expect(createSimulation({ seed: 8 }).disk).toEqual(
      createSimulation({ seed: 8 }).disk,
    );
    expect(createSimulation({ seed: 8 }).moves).toEqual(
      createSimulation({ seed: 8 }).moves,
    );
    expect(createSimulation({ seed: 9 }).disk).not.toEqual(
      createSimulation({ seed: 8 }).disk,
    );
  });
  it.each([0, 1, 2, 98, 1234, 4294967295])(
    "conserves all clusters and fixed blocks for seed %i",
    (seed) => {
      const sim = createSimulation({ seed, size: 1024 });
      const expected = Array.from(sim.disk).sort((a, b) => a - b);
      const planned = sim.disk.slice();
      for (const move of sim.moves) {
        expect(planned[move.from]).toBe(move.cluster);
        expect(planned[move.to]).toBe(0);
        planned[move.to] = move.cluster;
        planned[move.from] = 0;
      }
      expect(planned).toEqual(sim.target);
      sim.start();
      sim.setSpeed(16);
      let prior = 0;
      for (let i = 0; i < 1000 && sim.phase !== "complete"; i++) {
        sim.advance(64);
        expect(sim.getProgress()).toBeGreaterThanOrEqual(prior);
        prior = sim.getProgress();
        for (let j = 0; j < sim.disk.length; j++)
          if (sim.target[j] < 0) expect(sim.disk[j]).toBe(sim.target[j]);
      }
      expect(sim.phase).toBe("complete");
      expect(sim.getProgress()).toBe(100);
      expect(sim.disk).toEqual(sim.target);
      expect(Array.from(sim.disk).sort((a, b) => a - b)).toEqual(expected);
      for (const file of sim.files) {
        const start = sim.target.indexOf(file.clusterIds[0]);
        expect(Array.from(sim.target.slice(start, start + file.size))).toEqual(
          file.clusterIds,
        );
      }
    },
  );
  it("pauses, resumes, resets and unsubscribes", () => {
    const sim = createSimulation(),
      initial = sim.disk.slice();
    let notifications = 0;
    const off = sim.subscribeToMove(() => notifications++);
    sim.advance(64);
    expect(sim.completed).toBe(0);
    sim.start();
    sim.advance(64);
    expect(notifications).toBe(2);
    sim.pause();
    const frozen = sim.disk.slice();
    sim.advance(1000);
    expect(sim.disk).toEqual(frozen);
    off();
    sim.start();
    sim.advance(64);
    expect(notifications).toBe(2);
    sim.reset();
    expect(sim.phase).toBe("ready");
    expect(sim.completed).toBe(0);
    expect(sim.disk).toEqual(initial);
  });
  it("limits background deltas and validates input", () => {
    const sim = createSimulation();
    sim.start();
    sim.advance(Infinity);
    sim.advance(-1);
    expect(sim.completed).toBe(0);
    sim.advance(60000);
    expect(sim.completed).toBe(2);
    expect(() => createSimulation({ size: 0 })).toThrow();
  });
});
