/** Low V8-ish idle that rises with speed. Starts only after a click (Enter / sit). */
export type EngineHum = { setSpeed: (mps: number) => void; stop: () => void };

export function startEngineHum(): EngineHum | null {
  const AC = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.0001;
  master.connect(ctx.destination);

  const make = (type: OscillatorType, freq: number, gain: number) => {
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    const f = ctx.createBiquadFilter();
    o.type = type;
    o.frequency.value = freq;
    f.type = "lowpass";
    f.frequency.value = 280;
    g.gain.value = gain;
    o.connect(f);
    f.connect(g);
    g.connect(master);
    o.start();
    return { o, g, f };
  };

  const a = make("sawtooth", 46, 0.045);
  const b = make("square", 23, 0.02);
  master.gain.linearRampToValueAtTime(1, ctx.currentTime + 0.25);

  return {
    setSpeed(mps: number) {
      const s = Math.abs(mps);
      a.o.frequency.setTargetAtTime(46 + s * 3.4, ctx.currentTime, 0.08);
      b.o.frequency.setTargetAtTime(23 + s * 1.7, ctx.currentTime, 0.08);
      a.f.frequency.setTargetAtTime(260 + s * 18, ctx.currentTime, 0.1);
      master.gain.setTargetAtTime(0.7 + Math.min(0.5, s / 20), ctx.currentTime, 0.1);
    },
    stop() {
      master.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.2);
      window.setTimeout(() => ctx.close().catch(() => {}), 280);
    },
  };
}
