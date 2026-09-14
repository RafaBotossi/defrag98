export class AudioEngine {
  private context?: AudioContext;
  private master?: GainNode;
  private volume = 0.18;
  private muted = false;
  private last = -1;
  private voices = new Set<OscillatorNode>();
  async unlock() {
    this.context ??= new AudioContext();
    if (!this.master) {
      this.master = this.context.createGain();
      this.master.gain.value = this.muted ? 0 : this.volume;
      this.master.connect(this.context.destination);
    }
    await this.context.resume();
  }
  setVolume(value: number) {
    this.volume = Math.max(0, Math.min(1, value));
    this.updateGain();
  }
  setMuted(value: boolean) {
    this.muted = value;
    this.updateGain();
  }
  private updateGain() {
    if (this.master && this.context)
      this.master.gain.setTargetAtTime(
        this.muted ? 0 : this.volume,
        this.context.currentTime,
        0.025,
      );
  }
  play(position: number, group: number) {
    const context = this.context;
    if (
      !context ||
      !this.master ||
      context.state !== "running" ||
      this.muted ||
      this.volume === 0 ||
      this.voices.size >= 4 ||
      context.currentTime - this.last < 0.075
    )
      return;
    const now = context.currentTime;
    this.last = now;
    const oscillator = context.createOscillator(),
      envelope = context.createGain(),
      filter = context.createBiquadFilter();
    const notes = [0, 2, 4, 7, 9];
    const note = Math.min(9, Math.floor(position * 10));
    oscillator.frequency.value =
      130.81 * 2 ** ((notes[note % 5] + Math.floor(note / 5) * 12) / 12);
    oscillator.type = group % 2 ? "sine" : "triangle";
    filter.type = "lowpass";
    filter.frequency.value = 1200;
    envelope.gain.setValueAtTime(0, now);
    envelope.gain.linearRampToValueAtTime(0.12, now + 0.008);
    envelope.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
    oscillator.connect(filter);
    filter.connect(envelope);
    envelope.connect(this.master);
    this.voices.add(oscillator);
    oscillator.onended = () => {
      this.voices.delete(oscillator);
      oscillator.disconnect();
      filter.disconnect();
      envelope.disconnect();
    };
    oscillator.start(now);
    oscillator.stop(now + 0.18);
  }
  dispose() {
    this.voices.forEach((voice) => voice.stop());
    this.voices.clear();
    void this.context?.close();
  }
}
