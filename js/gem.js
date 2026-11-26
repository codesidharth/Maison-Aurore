/* ==========================================================================
   Maison Aurore: real-time 3D gem and ring renderer
   Plain WebGL 1 with one fragment shader that ray-marches the scene.
   No libraries, so it works offline and from file:// as well as Live Server.

   - The gem is a convex facet solid (crown, table, pavilion, girdle facets).
   - Light entering the gem is refracted, bounces inside (total internal
     reflection) and leaves through another facet. At the exit the three colour
     channels bend by slightly different amounts, which gives the rainbow "fire".
   - Coloured stones absorb light along the path it travels inside the stone.
   - The ring band, head and prongs are polished metal reflecting a procedural
     studio environment.
   ========================================================================== */
(function (global) {
  'use strict';

  var VERT = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';

  var FRAG = [
    'precision highp float;',
    'uniform vec2 uRes; uniform float uTime; uniform mat3 uR;',
    'uniform float uMode;      // 0 = single gem, 1 = ring with gem',
    'uniform vec3 uMetal; uniform vec3 uAbs;',
    'uniform float uFold; uniform float uIor; uniform float uDisp; uniform float uGem;',
    'uniform vec3 uGemPos; uniform vec3 uCam; uniform float uFov; uniform vec2 uOff;',
    '',
    'vec3 env(vec3 d, float rough){',
    '  float t = uTime*0.06; float ct=cos(t), st=sin(t);',
    '  d = vec3(ct*d.x - st*d.z, d.y, st*d.x + ct*d.z);',
    '  float w = rough*0.22;',
    '  vec3 c = mix(vec3(0.05,0.052,0.07), vec3(0.20,0.215,0.29), smoothstep(-0.7,0.9,d.y));',
    '  c += vec3(0.55,0.60,0.75)*0.9*smoothstep(0.2-w,0.95, dot(d,normalize(vec3(-0.3,0.5,0.8))));',
    '  c += vec3(0.75,0.62,0.5)*0.7*smoothstep(0.1-w,0.9, dot(d,normalize(vec3(0.6,-0.2,-0.7))));',
    '  c += vec3(1.00,0.96,0.90)*5.5*smoothstep(0.93-w,0.975, dot(d,normalize(vec3(0.5,0.8,0.6))));',
    '  c += vec3(0.80,0.90,1.00)*4.5*smoothstep(0.90-w,0.95, dot(d,normalize(vec3(-0.8,0.4,0.3))));',
    '  c += vec3(1.00,0.72,0.45)*3.5*smoothstep(0.92-w,0.96, dot(d,normalize(vec3(0.1,-0.3,0.95))));',
    '  c += vec3(0.95,0.85,1.00)*3.0*smoothstep(0.94-w,0.975, dot(d,normalize(vec3(0.9,-0.1,-0.4))));',
    '  c += vec3(1.0)*2.6*smoothstep(0.05+w,0.0, abs(d.y-0.22))*smoothstep(0.1,0.8, d.x*0.5+0.5);',
    '  c += vec3(0.9,0.95,1.0)*3.2*smoothstep(0.96-w,0.99, d.y);',
    '  c += vec3(1.0,0.8,0.55)*1.4*smoothstep(0.05+w,0.0, abs(d.z+0.55))*smoothstep(0.0,0.6,-d.y+0.3);',
    '  return c;',
    '}',
    '',
    'float sdGem(vec3 p){',
    '  float sec = 6.2831853/uFold;',
    '  float a = atan(p.z,p.x);',
    '  float k = floor(a/sec+0.5);',
    '  float qx = cos(k*sec)*p.x + sin(k*sec)*p.z;',
    '  float a2 = (floor(a/sec)+0.5)*sec;',
    '  float qx2 = cos(a2)*p.x + sin(a2)*p.z;',
    '  float dCrown = (qx-1.0)*0.5664 + (p.y-0.03)*0.8241;',
    '  float dTable = p.y-0.33;',
    '  float dPav   = (qx-1.0)*0.6528 - (p.y+0.03)*0.7575;',
    '  float dUgc   = (qx2-1.045)*0.6561 + p.y*0.7547;',
    '  float dUgp   = (qx2-1.045)*0.6820 - p.y*0.7314;',
    '  float dGird  = qx-1.0;',
    '  return max(max(max(dCrown,dTable),max(dPav,dUgc)),max(dUgp,dGird));',
    '}',
    'float gemLocal(vec3 p){ return sdGem((p-uGemPos)/uGem)*uGem; }',
    '',
    'float sdCap(vec3 p, vec3 a, vec3 b, float r){',
    '  vec3 pa=p-a, ba=b-a; float h=clamp(dot(pa,ba)/dot(ba,ba),0.,1.);',
    '  return length(pa-ba*h)-r;',
    '}',
    'float smin(float a,float b,float k){ float h=clamp(0.5+0.5*(b-a)/k,0.,1.); return mix(b,a,h)-k*h*(1.-h); }',
    'float sdMetal(vec3 p){',
    '  float band = length(vec2(length(p.xy)-1.0, p.z*1.15)) - 0.125;',
    '  float gy = uGemPos.y;',
    '  float head = sdCap(p, vec3(0.,gy-0.82*uGem,0.), vec3(0.,gy-0.42*uGem,0.), 0.46*uGem);',
    '  vec3 g = p-vec3(0.,gy,0.); g.xz = abs(g.xz);',
    '  float prong = sdCap(g, vec3(0.70,-0.45,0.70)*uGem, vec3(0.77,0.09,0.77)*uGem, 0.052*uGem);',
    '  return min(smin(band, head, 0.10), prong);',
    '}',
    '',
    'vec2 map(vec3 p){',
    '  if(uMode<0.5){ return vec2(gemLocal(p), 2.0); }',
    '  float dm = sdMetal(p); float dg = gemLocal(p);',
    '  return dm<dg ? vec2(dm,1.0) : vec2(dg,2.0);',
    '}',
    'vec3 calcNormal(vec3 p){',
    '  vec2 e=vec2(0.0012,-0.0012);',
    '  return normalize(e.xyy*map(p+e.xyy).x + e.yyx*map(p+e.yyx).x + e.yxy*map(p+e.yxy).x + e.xxx*map(p+e.xxx).x);',
    '}',
    'vec3 gemNormal(vec3 p){',
    '  vec2 e=vec2(0.0012,-0.0012);',
    '  return normalize(e.xyy*gemLocal(p+e.xyy) + e.yyx*gemLocal(p+e.yyx) + e.yxy*gemLocal(p+e.yxy) + e.xxx*gemLocal(p+e.xxx));',
    '}',
    '',
    'vec3 shadeGem(vec3 rd, vec3 p, vec3 n){',
    '  float f0 = pow((uIor-1.0)/(uIor+1.0),2.0);',
    '  float F = f0 + (1.0-f0)*pow(1.0-max(dot(-rd,n),0.0),5.0);',
    '  vec3 refl = env(uR*reflect(rd,n), 0.0);',
    '  vec3 dir = refract(rd,n,1.0/uIor);',
    '  vec3 pos = p - n*0.004;',
    '  float len = 0.0; vec3 res = vec3(0.0); bool done = false;',
    '  for(int b=0;b<6;b++){',
    '    float t = 0.01;',
    '    for(int i=0;i<28;i++){ float h = -gemLocal(pos+dir*t); if(h<0.0025) break; t += h; }',
    '    pos += dir*t; len += t;',
    '    vec3 nn = gemNormal(pos);',
    '    vec3 oG = refract(dir,-nn,uIor);',
    '    if(dot(oG,oG)>0.001){',
    '      vec3 oR = refract(dir,-nn,uIor*(1.0-uDisp));',
    '      vec3 oB = refract(dir,-nn,uIor*(1.0+uDisp));',
    '      if(dot(oR,oR)<0.001) oR=oG; if(dot(oB,oB)<0.001) oB=oG;',
    '      res = vec3(env(uR*oR,0.0).r, env(uR*oG,0.0).g, env(uR*oB,0.0).b);',
    '      done = true; break;',
    '    }',
    '    dir = reflect(dir,nn); pos -= nn*0.004;',
    '  }',
    '  if(!done) res = env(uR*dir,0.0)*0.3;',
    '  res *= exp(-uAbs*len/uGem);',
    '  return res*(1.0-F)*1.45 + refl*F;',
    '}',
    '',
    'vec3 shadeMetal(vec3 p, vec3 rd, vec3 n){',
    '  vec3 r = reflect(rd,n);',
    '  float ao = clamp(map(p+n*0.12).x/0.12,0.0,1.0); ao = 0.35+0.65*ao;',
    '  vec3 e = env(uR*r, 0.35);',
    '  float fr = pow(1.0-max(dot(-rd,n),0.0),4.0);',
    '  vec3 col = uMetal*e*ao*0.95;',
    '  col += uMetal*0.05*(0.5+0.5*(uR*n).y);',
    '  col = mix(col, e*0.8, fr*0.22);',
    '  return col;',
    '}',
    '',
    'void main(){',
    '  vec2 uv = (gl_FragCoord.xy-0.5*uRes)/uRes.y - uOff;',
    '  vec3 ro = uCam; vec3 f = normalize(-uCam);',
    '  vec3 rt = normalize(cross(f,vec3(0.,1.,0.))); vec3 up = cross(rt,f);',
    '  vec3 rd = normalize(f + (uv.x*rt + uv.y*up)*uFov);',
    '  vec3 roO = ro*uR; vec3 rdO = rd*uR;',
    '  float R = uMode<0.5 ? uGem*1.45 : 2.4;',
    '  float b = dot(roO,rdO); float c = dot(roO,roO)-R*R; float disc = b*b-c;',
    '  if(disc<0.0){ gl_FragColor = vec4(0.0); return; }',
    '  float t = max(-b-sqrt(disc),0.0); float tEnd = -b+sqrt(disc);',
    '  float id = 0.0; bool hit = false;',
    '  for(int i=0;i<140;i++){',
    '    vec2 h = map(roO+rdO*t);',
    '    if(h.x<0.0007+0.0005*t){ hit = true; id = h.y; break; }',
    '    t += h.x*0.9; if(t>tEnd) break;',
    '  }',
    '  if(!hit){ gl_FragColor = vec4(0.0); return; }',
    '  vec3 p = roO+rdO*t; vec3 n = calcNormal(p);',
    '  vec3 col = id>1.5 ? shadeGem(rdO,p,n) : shadeMetal(p,rdO,n);',
    '  col = 1.0-exp(-col*1.15); col = pow(col, vec3(0.88));',
    '  gl_FragColor = vec4(col,1.0);',
    '}'
  ].join('\n');

  function mat3(yaw, pitch) {
    var cy = Math.cos(yaw), sy = Math.sin(yaw), cx = Math.cos(pitch), sx = Math.sin(pitch);
    /* R = Ry * Rx, returned column-major for uniformMatrix3fv */
    var r00 = cy, r01 = sy * sx, r02 = sy * cx;
    var r10 = 0, r11 = cx, r12 = -sx;
    var r20 = -sy, r21 = cy * sx, r22 = cy * cx;
    return new Float32Array([r00, r10, r20, r01, r11, r21, r02, r12, r22]);
  }
  function lerp(a, b, t) { return a + (b - a) * t; }

  function GemRenderer(canvas, opts) {
    opts = opts || {};
    this.canvas = canvas;
    this.mode = opts.mode || 0;
    this.maxScale = opts.maxScale || 1.6;
    this.scale = opts.startScale || 1;
    this.minScale = 0.4;
    this.cam = opts.cam || [0, 0.55, 5.2];
    this.fov = opts.fov || 0.3;
    this.off = opts.off || [0, 0];
    this.yaw = 0; this.pitch = 0.3;
    this.cur = { metal: [1, 0.78, 0.36], abs: [0, 0, 0], ior: 2.42, disp: 0.018, gem: opts.gem || 1.2, popGem: 1 };
    this.tgt = { metal: [1, 0.78, 0.36], abs: [0, 0, 0], ior: 2.42, disp: 0.018, gem: opts.gem || 1.2 };
    this.fold = opts.fold || 8;
    this.pendingFold = null;
    this.visible = true; this.running = false; this.ok = false;
    this.ema = 16; this.fastFrames = 0; this.last = 0;
    this.fixedScale = !!opts.fixedScale;
    this.onFrame = null;
    this.init();
  }

  GemRenderer.prototype.init = function () {
    var gl = this.canvas.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, powerPreference: 'high-performance' }) ||
             this.canvas.getContext('experimental-webgl');
    if (!gl) { this.fail('no webgl'); return; }
    this.gl = gl;
    var vs = this.compile(gl.VERTEX_SHADER, VERT), fs = this.compile(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { this.fail('shader'); return; }
    var pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { this.fail(gl.getProgramInfoLog(pr)); return; }
    this.prog = pr; gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var names = ['uRes', 'uTime', 'uR', 'uMode', 'uMetal', 'uAbs', 'uFold', 'uIor', 'uDisp', 'uGem', 'uGemPos', 'uCam', 'uFov', 'uOff'];
    this.u = {}; for (var i = 0; i < names.length; i++) this.u[names[i]] = gl.getUniformLocation(pr, names[i]);
    gl.clearColor(0, 0, 0, 0);
    this.ok = true;
    var self = this;
    this.canvas.addEventListener('webglcontextlost', function (e) { e.preventDefault(); self.ok = false; self.fail('lost'); });
    if ('ResizeObserver' in window) { new ResizeObserver(function () { self.resize(); }).observe(this.canvas); }
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { self.visible = en[0].isIntersecting; }, { threshold: 0 }).observe(this.canvas);
    }
    this.resize();
  };
  GemRenderer.prototype.compile = function (type, src) {
    var gl = this.gl, s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
    return s;
  };
  GemRenderer.prototype.fail = function (why) {
    this.ok = false;
    this.canvas.setAttribute('data-gl', 'failed');
    if (this.onFail) this.onFail(why);
  };
  GemRenderer.prototype.resize = function () {
    var dpr = Math.min(window.devicePixelRatio || 1, 2) * this.scale;
    var w = Math.max(2, Math.round(this.canvas.clientWidth * dpr)), h = Math.max(2, Math.round(this.canvas.clientHeight * dpr));
    if (this.canvas.width !== w || this.canvas.height !== h) { this.canvas.width = w; this.canvas.height = h; }
  };
  /* set target look: opts = {metal:[r,g,b], abs:[r,g,b], ior, disp, gem, fold} */
  GemRenderer.prototype.set = function (o, instant) {
    for (var k in o) { if (k === 'fold') continue; this.tgt[k] = o[k]; if (instant) this.cur[k] = Array.isArray(o[k]) ? o[k].slice() : o[k]; }
    if (o.fold !== undefined && o.fold !== this.fold) {
      if (instant) this.fold = o.fold; else this.pendingFold = o.fold;
    }
  };
  GemRenderer.prototype.step = function (now) {
    var c = this.cur, t = this.tgt, k = 0.12, i;
    for (i = 0; i < 3; i++) { c.metal[i] = lerp(c.metal[i], t.metal[i], k); c.abs[i] = lerp(c.abs[i], t.abs[i], k); }
    c.ior = lerp(c.ior, t.ior, k); c.disp = lerp(c.disp, t.disp, k); c.gem = lerp(c.gem, t.gem, 0.14);
    /* pop animation when the stone type (and so the facet count) changes */
    if (this.pendingFold !== null) {
      c.popGem = lerp(c.popGem, 0, 0.3);
      if (c.popGem < 0.06) { this.fold = this.pendingFold; this.pendingFold = null; }
    } else { c.popGem = lerp(c.popGem, 1, 0.12); }
  };
  GemRenderer.prototype.draw = function (now) {
    var gl = this.gl, u = this.u, c = this.cur;
    var g = Math.max(c.gem * c.popGem, 0.001);
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(u.uRes, this.canvas.width, this.canvas.height);
    gl.uniform1f(u.uTime, now / 1000);
    gl.uniformMatrix3fv(u.uR, false, mat3(this.yaw, this.pitch));
    gl.uniform1f(u.uMode, this.mode);
    gl.uniform3fv(u.uMetal, c.metal); gl.uniform3fv(u.uAbs, c.abs);
    gl.uniform1f(u.uFold, this.fold); gl.uniform1f(u.uIor, c.ior); gl.uniform1f(u.uDisp, c.disp);
    gl.uniform1f(u.uGem, g);
    /* in ring mode the culet of the stone sits in the top of the band */
    var gy = this.mode > 0.5 ? 1.02 + 0.862 * g : 0;
    gl.uniform3f(u.uGemPos, 0, gy, 0);
    gl.uniform3fv(u.uCam, this.cam); gl.uniform1f(u.uFov, this.fov);
    gl.uniform2fv(u.uOff, this.off);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };
  GemRenderer.prototype.start = function () {
    if (this.running) return; this.running = true;
    var self = this;
    function loop(now) {
      if (!self.running) return;
      requestAnimationFrame(loop);
      if (!self.ok || !self.visible || document.hidden) { self.last = now; return; }
      var dt = now - (self.last || now); self.last = now;
      if (self.onFrame) self.onFrame(now, dt);
      self.step(now);
      var t0 = performance.now();
      self.draw(now);
      /* adaptive resolution: keep the animation smooth on weaker GPUs */
      if (!self.fixedScale && dt > 0 && dt < 250) {
        self.ema = self.ema * 0.9 + dt * 0.1;
        if (self.ema > 34 && self.scale > self.minScale) { self.scale = Math.max(self.minScale, self.scale * 0.88); self.ema = 20; self.resize(); }
        else if (self.ema < 19) { self.fastFrames++; if (self.fastFrames > 120 && self.scale < self.maxScale) { self.scale = Math.min(self.maxScale, self.scale * 1.08); self.fastFrames = 0; self.resize(); } }
        else self.fastFrames = 0;
      }
    }
    requestAnimationFrame(loop);
  };
  GemRenderer.prototype.stop = function () { this.running = false; };
  GemRenderer.prototype.drawOnce = function () { if (this.ok) { this.resize(); this.step(0); this.draw(performance.now()); } };

  global.GemRenderer = GemRenderer;
})(window);
