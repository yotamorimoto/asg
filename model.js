
class Model {
  constructor(n) {
    this.n = n;
    this.fill(n);
  }
}

class Model1 extends Model {
  fill(n) {
    this.xn = Float32Array.from({ length:n }, () => 1.0.rand2());
  }
  next(r,g) {
    const halfG = g * 0.5;
    // slice fastest?
    // http://jsben.ch/lO6C5
    const prev = this.xn.slice();
    const rx = this.rmap(r);
    for (let i=0; i<this.n; i++) {
      this.xn[i] =
        (
          (1.0 - g) * this.f(rx, prev[i])
          +
          halfG * (
            this.f(rx, prev[(i === 0) ? this.n-1 : i-1]) +
            this.f(rx, prev[(i === this.n-1) ? 0 : i+1])
          )
        ).fold2();
    }
    return this.xn;
  }
}
class Brown extends Model1 {
  f(r,x) { return x + 1.0.rand2() * r }
  rmap(r) { return r.linexp(0,1, 0.3,1) }
}
class Logis extends Model1 {
  f(r,x) { return 1.0 - (r * (x ** 2)) }
  rmap(r) { return r.linlin(0,1, 1.5,2) }
}

class Model2 extends Model {
  fill(n) {
    this.xn = Float32Array.from({ length:n }, () => 1.0.rand2());
    this.yn = Float32Array.from({ length:n }, () => 2 * Math.PI * 1.0.rand());
  }
  next(r,g) {
    const halfG = g * 0.5;
    const prex = this.xn.slice();
    const prey = this.yn.slice();
    const rx = this.rmapx(r);
    const ry = this.rmapy(r);
    for (let i=0; i<this.n; i++) {
      this.xn[i] =
        (
          (1.0 - g) * this.fx(rx, prex[i], prey[i])
          +
          halfG * (
            this.fx(rx, prex[(i === 0) ? this.n-1 : i-1], prey[(i === 0) ? this.n-1 : i-1])
            +
            this.fx(rx, prex[(i === this.n-1) ? 0 : i+1], prey[(i === this.n-1) ? 0 : i+1])
          )
        ).fold2();
      this.yn[i] = this.fy(ry, prex[i], prey[i]);
    }
    return this.xn;
  }
}
class Fbsin extends Model2 {
  rmapx(r) { return r.linexp(0,1, 1,3) }
  rmapy(r) { return r.linexp(0,1, 1.1,1.5) }
  fx(r,x,y) { return (y + r * x).sin() } // fb
  fy(r,x,y) { return r * y % (2 * Math.PI) }
}
/*
// original sc ugen implementation
x(n+1) = sin(im * y(n) + fb * x(n))
y(n+1) = (a * y(n) + c) % 2pi
s.scope(1);
// simplified by removing im & c
(
{ FBSineC.ar(
    3000,
    1, // im
    MouseX.kr(1,3), // fb
    MouseY.kr(1.1,1.5).poll, // a
    0, // c
) * 0.2 }.play(s);
)
*/

const Scale = {
  lydian: [0, 2, 4, 6, 7, 9, 11],
  ionian: [0, 2, 4, 5, 7, 9, 11],
  mixolydian:	[0, 2, 4, 5, 7, 9, 10],
  dorian: [0, 2, 3, 5, 7, 9, 10],
  aeolian: [0, 2, 3, 5, 7, 8, 10],
  phrygian:	[0, 1, 3, 5, 7, 8, 10],
  locrian:	[0, 1, 3, 5, 6, 8, 10],
  melodicminor:	[0, 2, 3, 5, 7, 9, 11],
  pentatonic:	[0, 2, 4, 7, 9],
  ryukyu:	[0, 4, 5, 7, 11],
  et5: [0.0, 2.4, 4.8, 7.2, 9.6], // Array.series(5, 0, 12/5)
  et7: [0.0, 1.7142857142857, 3.4285714285714, 5.1428571428571, 6.8571428571429, 8.5714285714286, 10.285714285714],
  et8: [0.0, 1.5, 3.0, 4.5, 6.0, 7.5, 9.0, 10.5],
  just: [0, 2.04, 3.86, 4.98, 7.02, 8.84, 10.88],
}

const Trig = () => {
  let prev;
  return v => {
    const t = prev < 0 && v >= 0;
    prev = v;
    return t;
  }
};

const Changed = () => {
  let prev;
  return v => {
    const t = prev !== v;
    prev = v;
    return t;
  };
};

const Divide = () => {
  let prev = 0;
  let t = false;
  return (v, div) => {
    if (v) prev++;
    if (prev === div) {
      t = true;
      prev = 0;
    } else { t = false }
    return t;
  };
};

const Latch = () => {
  let held;
  return (v, trig) => {
    if (!!trig) {
      held = v;
    }
    return held;
  };
};

// Trigger + Pulse Divide
const TD = () => {
  const trig = Trig()
  const div = Divide()
  return (v, d) => {
    return div(trig(v), d)
  }
};

export { 
  Brown, Logis, Fbsin, 
  Scale, 
  Trig, Changed, Divide, Latch, TD 
}
