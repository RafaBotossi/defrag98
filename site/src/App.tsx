/* oxlint-disable jsx-a11y/prefer-tag-over-role -- Canvas map and segmented progress use valid ARIA roles to preserve custom rendering. */
import { useEffect, useRef, useState } from "react";
import { createSimulation, type Simulation } from "./canvas/simulation";
import { createRenderer } from "./canvas/renderer";
import { AudioEngine } from "./audio/audioEngine";
import { registerSimulationTools } from "./webmcp";

export default function App() {
  const canvas = useRef<HTMLCanvasElement>(null),
    shell = useRef<HTMLElement>(null);
  const simulation = useRef<Simulation | null>(null),
    audio = useRef<AudioEngine | null>(null);
  const settings = useRef({
    loop: true,
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    speed: 1,
  });
  const seed = useRef(98),
    completeSince = useRef(0);
  const [status, setStatus] = useState("ready"),
    [progress, setProgress] = useState(0),
    [moves, setMoves] = useState(0);
  const [count] = useState(() => (innerWidth < 600 ? 1024 : 4096)),
    [speed, setSpeed] = useState(1),
    [volume, setVolume] = useState(18);
  const [muted, setMuted] = useState(false),
    [loop, setLoop] = useState(true),
    [relax, setRelax] = useState(false);
  const [crt, setCrt] = useState(true),
    [reduced, setReduced] = useState(
      () => matchMedia("(prefers-reduced-motion: reduce)").matches,
    ),
    [fullscreen, setFullscreen] = useState(false),
    [notice, setNotice] = useState("");
  const connect = (sim: Simulation) =>
    sim.subscribeToMove((move) =>
      audio.current?.play(
        (move.to % (sim.disk.length === 1024 ? 32 : 64)) /
          (sim.disk.length === 1024 ? 32 : 64),
        sim.groups[move.cluster],
      ),
    );
  const restart = () => {
    const previous = simulation.current;
    const sim = createSimulation({
      seed: ++seed.current,
      size: previous?.disk.length ?? 4096,
    });
    sim.setSpeed(settings.current.speed);
    simulation.current = sim;
    connect(sim);
    completeSince.current = 0;
    if (previous?.phase === "running" || previous?.phase === "complete")
      sim.start();
    setProgress(0);
    setMoves(0);
    setStatus(sim.phase);
  };
  const start = () => {
    if (simulation.current?.phase === "complete") restart();
    simulation.current?.start();
    setStatus(simulation.current?.phase ?? "ready");
    void audio.current
      ?.unlock()
      .catch(() =>
        setNotice("Audio unavailable. You can still enjoy the simulation."),
      );
  };
  const pause = () => {
    simulation.current?.pause();
    setStatus(simulation.current?.phase ?? "paused");
  };
  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shell.current?.requestFullscreen();
    } catch {
      setNotice("Fullscreen is unavailable in this browser.");
    }
  };
  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      settings.current.reduced = media.matches;
      setReduced(media.matches);
    };
    media.addEventListener("change", onMotion);
    const size = count;
    const sim = createSimulation({ seed: seed.current, size });
    simulation.current = sim;
    audio.current = new AudioEngine();
    connect(sim);
    const renderer = createRenderer(canvas.current!);
    let frame = 0,
      last = 0,
      lastUi = 0,
      lastDraw = 0;
    const draw = (now: number) => {
      const current = simulation.current!;
      if (!document.hidden) current.advance(last ? now - last : 0);
      last = now;
      if (now - lastDraw >= (settings.current.reduced ? 125 : 0)) {
        renderer.draw(current, settings.current.reduced);
        lastDraw = now;
      }
      if (now - lastUi > 100) {
        setProgress(current.getProgress());
        setMoves(current.completed);
        setStatus(current.phase);
        lastUi = now;
      }
      if (current.phase === "complete") {
        if (!completeSince.current) completeSince.current = now;
        if (
          settings.current.loop &&
          !document.hidden &&
          now - completeSince.current > 4000
        )
          restart();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);
    const unregister = registerSimulationTools(
      () => ({
        phase: simulation.current?.phase,
        progress: simulation.current?.getProgress(),
        moves: simulation.current?.completed,
      }),
      pause,
    );
    const onFullscreen = () =>
      setFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreen);
    return () => {
      unregister();
      cancelAnimationFrame(frame);
      renderer.dispose();
      audio.current?.dispose();
      media.removeEventListener("change", onMotion);
      document.removeEventListener("fullscreenchange", onFullscreen);
    };
  }, [count]);
  const message =
    status === "complete"
      ? "Optimization complete"
      : status === "running"
        ? "Finding a place for everything…"
        : status === "paused"
          ? "Taking a little breather."
          : "A little order, a little peace.";
  return (
    <main ref={shell} className={`desktop ${relax ? "relax" : ""}`}>
      <div className="desktop-heading">
        <span className="brand-mark">▦</span>
        <div>
          <strong>DEFRAG98</strong>
          <span>A quiet corner of the internet.</span>
        </div>
        <span className="edition">EST. 1998 / REIMAGINED</span>
      </div>
      <section className="window" aria-label="Defrag98 virtual disk optimizer">
        <header className="titlebar">
          <span>▦ &nbsp; Defrag98 — Virtual Disk Optimizer</span>
          <div>
            <button
              onClick={() => setRelax(!relax)}
              aria-label={relax ? "Exit Relax Mode" : "Enter Relax Mode"}
            >
              {relax ? "↩" : "−"}
            </button>
            <button
              onClick={() => void toggleFullscreen()}
              aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              □
            </button>
          </div>
        </header>
        <nav className="menubar" aria-label="View settings">
          <span>
            Disk <b>01</b>
          </span>
          <div>
            <button aria-pressed={crt} onClick={() => setCrt(!crt)}>
              CRT {crt ? "on" : "off"}
            </button>
            <button aria-pressed={relax} onClick={() => setRelax(!relax)}>
              {relax ? "Exit Relax Mode" : "Relax Mode"}
            </button>
            <button onClick={() => void toggleFullscreen()}>
              {fullscreen ? "Exit fullscreen" : "Fullscreen"} ↗
            </button>
          </div>
        </nav>
        <div className="window-body">
          <div className="disk-heading">
            <div className="drive-icon" aria-hidden="true">
              ▤
            </div>
            <div>
              <h1>Giving your bits some breathing room.</h1>
              <p>
                Virtual disk (C:) <span>•</span> {count.toLocaleString("en-US")}{" "}
                clusters <span>•</span> Purely a simulation
              </p>
            </div>
            <span
              className={`activity ${status === "running" ? "active" : ""}`}
            >
              <i />
              {status === "running"
                ? "WORKING"
                : status === "complete"
                  ? "COMPLETE"
                  : "STANDBY"}
            </span>
          </div>
          <div className={`monitor ${crt && !reduced ? "crt" : ""}`}>
            <div className="monitor-label">
              <span>CLUSTER MAP</span>
              <span>{count === 1024 ? "32 × 32" : "64 × 64"} / LIVE VIEW</span>
            </div>
            <canvas
              ref={canvas}
              role="img"
              aria-label="Virtual disk map. Colored clusters reorganize as optimization progresses."
            />
            <div className="monitor-foot">
              <span>
                ▸{" "}
                {status === "running"
                  ? "Reorganizing virtual files"
                  : status === "complete"
                    ? "All files are home"
                    : "Ready when you are"}
              </span>
              <span>NO REAL DISKS ACCESSED</span>
            </div>
          </div>
          <div className="legend" aria-label="Cluster legend">
            {[
              ["used", "Used"],
              ["free", "Free"],
              ["system", "System"],
              ["locked", "Locked"],
              ["moving", "Moving"],
              ["target", "Target"],
              ["recent", "Organized"],
            ].map(([key, label]) => (
              <span key={key}>
                <i className={key} />
                {label}
              </span>
            ))}
          </div>
          <div className="progress-heading">
            <span role="status">{message}</span>
            <strong>
              {Math.floor(progress)}
              <small>%</small>
            </strong>
          </div>
          <div
            className="progress-track"
            role="progressbar"
            aria-label="Optimization progress"
            aria-valuenow={Math.floor(progress)}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div style={{ width: `${progress}%` }} />
          </div>
          <div className="progress-meta">
            <span>{moves.toLocaleString("en-US")} clusters moved</span>
            <span>
              {status === "complete" && loop
                ? "A fresh disk in a few seconds…"
                : "Small moves. Satisfying progress."}
            </span>
          </div>
          <div className="controls">
            <div className="transport">
              <button
                className="primary"
                onClick={start}
                disabled={status === "running"}
              >
                ▶ &nbsp;{status === "paused" ? "Resume" : "Start Defrag"}
              </button>
              <button onClick={pause} disabled={status !== "running"}>
                Ⅱ &nbsp;Pause
              </button>
              <button onClick={restart}>↻ &nbsp;Restart</button>
            </div>
            <label className="speed">
              Speed{" "}
              <input
                aria-label="Speed"
                type="range"
                min="0.25"
                max="16"
                step="0.25"
                value={speed}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setSpeed(value);
                  settings.current.speed = value;
                  simulation.current?.setSpeed(value);
                }}
              />
              <output>{speed}×</output>
            </label>
          </div>
          <div className="preferences">
            <div className="audio-controls">
              <button
                aria-pressed={muted}
                onClick={() => {
                  setMuted(!muted);
                  audio.current?.setMuted(!muted);
                  if (muted)
                    void audio.current
                      ?.unlock()
                      .catch(() => setNotice("Audio unavailable."));
                }}
              >
                {muted ? "Unmute" : "Mute"}
              </button>
              <label>
                Volume{" "}
                <input
                  aria-label="Volume"
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => {
                    const value = Number(e.target.value);
                    setVolume(value);
                    audio.current?.setVolume(value / 100);
                  }}
                />
              </label>
              <span>{volume}%</span>
            </div>
            <div className="options">
              <label>
                <input
                  type="checkbox"
                  checked={loop}
                  onChange={(e) => {
                    setLoop(e.target.checked);
                    settings.current.loop = e.target.checked;
                  }}
                />{" "}
                Auto loop
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={reduced}
                  onChange={(e) => {
                    setReduced(e.target.checked);
                    settings.current.reduced = e.target.checked;
                  }}
                />{" "}
                Less motion
              </label>
            </div>
          </div>
          {notice && (
            <p className="notice" role="alert">
              {notice}
            </p>
          )}
        </div>
        <footer className="statusbar">
          <span>
            <i className="status-dot" />{" "}
            {status === "running"
              ? "Optimizing"
              : status === "paused"
                ? "Paused"
                : status === "complete"
                  ? "Complete"
                  : "Ready"}
          </span>
          <span>All the nostalgia. None of the disk access.</span>
          <span>
            v1.0 <b>◢</b>
          </span>
        </footer>
      </section>
      <footer className="desktop-footer">
        <span>Put things in order. Let your mind wander.</span>
        <span>100% virtual. 100% unhurried.</span>
      </footer>
    </main>
  );
}
