#ifdef GL_ES
precision lowp float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

// cosine based palette, 4 vec3 params
vec3 palette(in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d) {
  return a + b*cos(6.28318*(c*t+d));
}

void main() {
  float time = u_time * 0.03;
  vec2 uv = gl_FragCoord.xy / u_resolution.xy;

  vec2 c1 = vec2(sin(time)*0.5, cos(time*3.)*0.7);
  vec2 c2 = vec2(sin(time)*0.9, cos(time)*0.6);

  float d1 = length(uv.xy - c1);
  vec3 col1 = palette(d1+time, vec3(sin(time+0.3),0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.0,0.10,0.20));

  //Determine length to point 2 & calculate color.
  float d2 = length(uv.yx - c2);
  vec3 col2 = palette(d2+time, vec3(0.5,0.5,0.5), vec3(0.5,0.5,0.5), vec3(1.0,1.0,1.0), vec3(0.0,0.10,0.20));

  gl_FragColor = vec4((col1+col2)/2.0 ,1.0);
}