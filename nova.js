const HALF_PI = 0.5 * Math.PI
const TWO_PI =  2.0 * Math.PI
let context, main, analyser, reverb, compressor, noise, u8audio;

const loadbuf = async url => {
  let res = await fetch(url);
  let buf = await res.arrayBuffer();
  return context.decodeAudioData(buf);
}

const _init_main = () => {
  context = new AudioContext({ latencyHint: 'playback' })
  const node = context.createGain()
  return node
}
const _init_reverb = async () => {
  let node = context.createConvolver();
  let res = await fetch('vdsp-darkspace.wav');
  let buf = await res.arrayBuffer();
  context.decodeAudioData(buf, b => node.buffer = b, e => reject(e));
  return node
}
const _init_compressor = () => {
  const node = context.createDynamicsCompressor();
  node.ratio.value = 12; // 12
  node.release.value = 0.5;// 0.25
  node.threshold.value = -26;// -24
  return node
}
const _init_noise = () => {
  const buf = context.createBuffer(1, context.sampleRate * 2, context.sampleRate)
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return buf
}

const _init_analyser = () => {
  const node = context.createAnalyser();
  node.fftSize = 1024;
  u8audio = new Uint8Array(node.frequencyBinCount);
  return node
}

const _ar_out_chain = (sig, amp, pan, rev, a, r) => {
  const vca = context.createGain();
  const out = context.createGain();
  const bus = context.createGain();
  const panner = context.createStereoPanner();
  vca.gain.value = 0;
  panner.pan.value = pan;
  // xfade reverb
  out.gain.value = Math.cos(HALF_PI * rev);
  bus.gain.value = Math.cos(HALF_PI * (1.0 - rev));
  sig.connect(vca);
  vca.connect(panner);
  panner.connect(out);
  out.connect(main);
  panner.connect(bus);
  bus.connect(reverb);
  // env
  const now = context.currentTime;
  const attack = now + a;
  const release = attack + r;
  vca.gain.setValueAtTime(vca.gain.value, now);
  vca.gain.linearRampToValueAtTime(amp, attack);
  vca.gain.exponentialRampToValueAtTime(0.001, release);
  // gc
  if (sig.stop) sig.stop(release + 0.1);
  setTimeout(() => sig.disconnect(), 1000 * (release + 0.2));
}


let visual;
const _init_visual = () => {
  const scope = document.getElementById('scope')
  const gfx = scope.getContext('2d')
  gfx.lineWidth = 3;
  gfx.strokeStyle = '#999';
}
const draw_clear = () => gfx.clearRect(0, 0, 512, 512);

const draw_spectra = () => {
  analyser.getByteFrequencyData(u8audio)
  gfx.clearRect(0, 0, 512, 512)
  gfx.save()
  gfx.beginPath()
  for (let i=0; i<512; i++) gfx.lineTo(i*2, 512 - u8audio[i]);
  gfx.stroke()
  visual = requestAnimationFrame(draw_spectra)
}

const draw_circle = () => {
  analyser.getByteTimeDomainData(u8audio);
  gfx.clearRect(0, 0, 512, 512);
  gfx.save();
  gfx.translate(255, 255);
  gfx.beginPath();
  for (let i=0; i<512; i++) {
    const x = Math.sin(TWO_PI * i / 512)
    const y = Math.cos(TWO_PI * i / 512)
    gfx.lineTo(x*u8audio[i], y*u8audio[i]);
  }
  gfx.stroke();
  gfx.restore();
  visual = requestAnimationFrame(draw_circle);
}

const boot = async () => {
  main = _init_main();
  compressor = _init_compressor();
  // noise = _init_noise();
  // analyser = _init_analyser();
  // main.connect(analyser);
  main.connect(compressor);
  compressor.connect(context.destination);
  reverb = await _init_reverb();
  reverb.connect(main);
  // buffers.push(await loadbuf('confetti/wah_79.mp3'))
}

const set_volume = v => {
  let amp = v.linlin(0, 1, -41, 9).dbamp();
  amp = (amp > 0.01) ? amp : 0;
  main.gain.setValueAtTime(amp, context.currentTime + 0.1);
}

const set_visual = v => {
  if (visual) cancelAnimationFrame(visual)
  switch (v) {
    case 1: draw_circle(); break;
    case 2: draw_spectra(); break;
    default: draw_clear()
  }
}

const sine = ({ amp=1,rev=0,note=64,a=0.01,r=0.3,pan=0 } = {}) => {
  const sig = context.createOscillator();
  sig.frequency.value = note.midicps();
  sig.start();
  _ar_out_chain(sig, amp, pan, rev, a, r);
}

export default {
  boot, set_volume, set_visual,
  sine,
}