import GUI from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import { Brown, Scale, Trig, TD, Changed, } from './model.js';
import nova from './nova.js';
import './sc.js';

const lil = {
  volume: 0.8,
  reverb: 0.3,
  speed: 0.5,
  x: 1.0,
  y: 1.0,
}
const init_gui = () => {
  const gui = new GUI()
  gui.add(lil, 'volume', 0, 1).onChange(v => nova.set_volume(v))
  gui.add(lil, 'reverb', 0, 1)
  gui.add(lil, 'speed', 0, 1)
  gui.add(lil, 'x', 0, 1)
  gui.add(lil, 'y', 0, 1)
  gui.close()
}

const button = document.getElementById('play')
button.onclick = () => {
  (async () => {
    await nova.boot();
    nova.set_volume(0.8);
    button.remove();
    init_gui();
    loop();
  })()
}

const model = new Brown(45);
const root = (21).rrand(31);
const t0 = Trig();
const t1 = Trig();
const c0 = Changed();
const c1 = Changed();
const td = TD();
let scale = Scale.ionian;

const loop = () => {
  const v = model.next(
    lil.x.linlin(0, 1, 0.05, 1.0),
    lil.y.linlin(0, 1, 0.1, 1.1)
  );
  if (td(v[0], 20)) {
    const name = [
      'melodicminor', 'locrian', 'phrygian', 'aeolian',
      'dorian', 'ionian', 'mixolydian', 'lydian',
    ][v[1].linlin(-1, 1, 0, 7).round()];
    scale = Scale[name];
    console.log(name);
  }
  if (t0(v[10])) {
    const note = v[11].linlin(-1, 1, 15, 35).d2k(scale) + root;
    if (c0(note)) {
      nova.sine({
        note: note,
        amp: v[12].linlin(-1, 1, -24, -9).dbamp(),
        rev: lil.reverb,
        r: 1.5,
      })
    }
  }
  if (t1(v[20])) {
    const note = v[21].linlin(-1, 1, 20, 40).d2k(scale) + root;
    if (c1(note)) {
      nova.sine({
        note: note,
        amp: v[22].linlin(-1, 1, -24, -9).dbamp(),
        rev: lil.reverb,
        r: 1.5,
      })
    }
  }
  setTimeout(loop, lil.speed.linexp(0, 1, 800, 80))
}