// WATCHOUT: prototype ¡additions!
//  to allow supercollider-like syntax

Number.prototype.postln = function() {
  console.log(this)
}
String.prototype.postln = function() {
  console.log(this)
}
// number.do
// sc   = 5.do { |i| i.postln }
// js   = (5).do(i => console.log(i))
Number.prototype.do = function(f) {
  var i = -1;
  while (++i < Math.floor(this)) {
    f(i);
  }
  return +this;
}

// single point random definition
// so that later we can override all together
const rand = () => Math.random()
Number.prototype.rand = function() {
  return rand() * this
}
const rrand = (min, max) => min + rand() * (max - min)
Number.prototype.rrand = function(max) {
  return rrand(this, max)
}
// bipolar
Number.prototype.rand2 = function() {
  return rrand(-this, this)
}
const exprand = (min, max) => Math.pow(max/min, rand()) * min
Number.prototype.exprand = function(max) {
  return exprand(this, max)
}
const choose = array => array[Math.floor(rand() * array.length)]
Array.prototype.choose = function() {
  return choose(this)
}
const windex = array => {
  const r = rand()
  let sum = 0;
  for (const [index, weight] of array.entries()) {
    sum += weight
    if (sum >= r) return index
  }
}
export const wchoose = (array, weights) => array[windex(weights)];
Array.prototype.wchoose = function(that) {
  return wchoose(this, that)
}
Array.prototype.last = function() {
  return this.slice(-1)[0]
}
const d2k = (degree, mode) => {
  const size = mode.length;
  const deg = round(degree);
  return (12 * div(deg, size)) + mode[mod(deg, size)];
}
Number.prototype.d2k = function(mode) {
  return d2k(this, mode)
}
// very fast int round
const round = a => (a + (a > 0 ? 0.5 : -0.5)) << 0;
Number.prototype.round = function() {
  return round(this)
}
// fast int division
const div = (a, b) => a / b >> 0;
// neg mod is different in sc
const mod = (n,m) => ((n % m) + m) % m;
const fold = (x, lo, hi) => {
  x -= lo;
  const r = hi - lo;
  const w = mod(x, r);
  return (mod(x / r, 2) > 1) ? (hi - w) : (lo + w);
};
Number.prototype.fold = function(lo,hi) {
  return fold(this,lo,hi)
}
const fold2 = a => fold(a, -1, 1);
Number.prototype.fold2 = function() {
  return fold2(this)
}
const midiratio = midi => Math.pow(2.0, midi * 0.083333333333);
Number.prototype.midiratio = function() {
  return midiratio(this)
}
const midicps = midi => 440. * Math.pow(2.0, (midi - 69.0) * 0.083333333333);
Number.prototype.midicps = function() {
  return midicps(this)
}
const cpsmidi = cps => Math.log2(cps * 0.002272727272727272727272727) * 12. + 69.;
Number.prototype.cpsmidi = function() {
  return cpsmidi(this)
}
const dbamp = db => Math.pow(10, db * 0.05);
Number.prototype.dbamp = function() {
  return dbamp(this)
}
const ampdb = amp => Math.log10(amp) * 20.;
Number.prototype.ampdb = function() {
  return ampdb(this)
}
const linlin = (x, a, b, c, d) => {
  if (x <= a) {
    return c;
  }
  if (x >= b) {
    return d;
  }
  return (x - a) / (b - a) * (d - c) + c;
};
Number.prototype.linlin = function(a,b,c,d) {
  return linlin(this, a,b,c,d)
}
const linexp = (x, a, b, c, d) => {
  if (x <= a) {
    return c;
  }
  if (x >= b) {
    return d;
  }
  return Math.pow(d / c, (x - a) / (b - a)) * c;
};
Number.prototype.linexp = function(a,b,c,d) {
  return linexp(this, a,b,c,d)
}
const explin = (x, a, b, c, d) => {
    if (x <= a)
        return c;
    if (x >= b)
        return d;
    return (Math.log(x / a)) / (Math.log(b / a)) * (d - c) + c;
}
Number.prototype.explin = function(a,b,c,d) {
  return explin(this, a,b,c,d)
}
const expexp = (x, a, b, c, d) => {
    if (x <= a)
        return c;
    if (x >= b)
        return d;
    return Math.pow(d / c, Math.log(x / a) / Math.log(b / a)) * c;
}
Number.prototype.expexp = function(a,b,c,d) {
  return expexp(this, a,b,c,d)
}

// syntactic sugar
Number.prototype.abs = function() { return Math.abs(this) }
Number.prototype.max = function(that) { return Math.max(this, that) }
Number.prototype.min = function(that) { return Math.min(this, that) }
Number.prototype.sin = function(that) { return Math.sin(that) }
Number.prototype.cos = function(that) { return Math.cos(that) }