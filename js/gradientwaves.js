import { Renderer, Program, Mesh, Triangle } from "ogl";

(function () {
    if (window.innerWidth <= 700) return; /* 手机端禁用 WebGL 背景（raymarch 开销大），CSS 渐变兜底 */
    var container = document.createElement("div");
    container.className = "gradient-waves-container";
    document.body.appendChild(container);

    var vertex = `#version 300 es
in vec2 position;
void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

    var fragment = `#version 300 es
precision highp float;
uniform vec2 iResolution;
uniform float iTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uWaveScale;
uniform float uWaveRatio;
uniform float uSwell;
uniform float uTurbulence;
uniform float uTilt;
uniform float uZoom;
uniform float uHeight;
uniform float uFogDepth;
uniform float uSteps;
uniform float uBrightness;
uniform float uOpacity;
uniform float uGrain;
uniform float uGrainIntensity;
uniform vec2 uMouse;
uniform float uParallax;
uniform bool uEnableMouse;
uniform vec3 uHorizonColor;
uniform vec3 uWaveColor;
uniform vec3 uCrestColor;
out vec4 fragColor;

const float MAX_DIST = 20000.0;

float hash21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float plasma(vec3 r, vec2 freq, vec4 tc) {
  float mx = r.x + tc.x;
  mx += uSwell * sin((r.y + mx) / 20.0 + tc.y);
  float my = r.y - tc.z;
  my += uTurbulence * cos(r.x / 23.0 + tc.w);
  return r.z - (sin(mx * freq.x) * uAmplitude + sin(my * freq.y) * uAmplitude + uHeight);
}

float raymarch(vec3 pos, vec3 dir, vec2 freq, vec4 tc) {
  float dist = 0.0;
  for (int i = 0; i < 128; i++) {
    if (float(i) >= uSteps) break;
    float dscene = plasma(pos + dist * dir, freq, tc);
    if (abs(dscene) < 0.1) break;
    dist += 0.9 * dscene;
    if (!(abs(dist) < MAX_DIST)) return MAX_DIST;
  }
  return dist;
}

void main() {
  float T = iTime * uSpeed;
  vec2 freq = vec2(uWaveScale / 7.0, (uWaveScale * uWaveRatio) / 3.0);
  vec4 tc = vec4(T / 0.130, T / 0.810, T / 0.200, T / 0.710);
  float c, s;
  float vfov = (3.14159 / 2.3) / max(uZoom, 0.05);
  vec3 cam = vec3(0.0, 0.0, 30.0);
  vec2 uv = (gl_FragCoord.xy / iResolution.xy) - 0.5;
  uv.x *= iResolution.x / iResolution.y;
  uv.y *= -1.0;

  vec3 dir = vec3(0.0, 0.0, -1.0);
  float ulen = length(uv);
  float xrot = vfov * ulen;
  c = cos(xrot); s = sin(xrot);
  dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  vec2 nuv = ulen > 1e-5 ? uv / ulen : vec2(1.0, 0.0);
  c = nuv.x; s = nuv.y;
  dir = mat3(c, -s, 0.0, s, c, 0.0, 0.0, 0.0, 1.0) * dir;
  c = cos(uTilt); s = sin(uTilt);
  dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;

  if (uEnableMouse) {
    float yaw = (uMouse.x - 0.5) * uParallax * 0.4;
    float pitch = (uMouse.y - 0.5) * uParallax * 0.4;
    c = cos(yaw); s = sin(yaw);
    dir = mat3(c, 0.0, s, 0.0, 1.0, 0.0, -s, 0.0, c) * dir;
    c = cos(pitch); s = sin(pitch);
    dir = mat3(1.0, 0.0, 0.0, 0.0, c, -s, 0.0, s, c) * dir;
  }

  float dist = raymarch(cam, dir, freq, tc);
  vec3 pos = cam + dist * dir;

  float t = clamp(uFogDepth / max(dist, 0.001), 0.0, 1.0);
  vec3 body = mix(uWaveColor, uCrestColor, clamp(pos.z * 0.08 + 0.5, 0.0, 1.0));
  vec3 col = mix(uHorizonColor, body, t);
  col *= uBrightness;
  col = clamp(col, 0.0, 1.0);

  float alpha = clamp(t, 0.0, 1.0) * uOpacity;
  if (uGrain > 0.5) {
    float g = hash21(gl_FragCoord.xy + mod(iTime, 64.0) * 11.0);
    alpha += (g - 0.5) * uGrainIntensity;
  }
  alpha = clamp(alpha, 0.0, 1.0);
  fragColor = vec4(col * alpha, alpha);
}
`;

    var renderer = new Renderer({
        webgl: 2,
        alpha: true,
        premultipliedAlpha: true,
        antialias: false,
        dpr: Math.min(window.devicePixelRatio || 1, 2)
    });

    var gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    var canvas = gl.canvas;
    canvas.style.width = "100%";
    canvas.style.height = "100%";
    canvas.style.display = "block";
    container.appendChild(canvas);

    var geometry = new Triangle(gl);
    var program = new Program(gl, {
        vertex: vertex,
        fragment: fragment,
        uniforms: {
            iTime: { value: 0 },
            iResolution: { value: new Float32Array([1, 1]) },
            uSpeed: { value: 0.4 },
            uAmplitude: { value: 3.0 },
            uWaveScale: { value: 0.7 },
            uWaveRatio: { value: 0.9 },
            uSwell: { value: 35 },
            uTurbulence: { value: 20 },
            uTilt: { value: 1.11 },
            uZoom: { value: 1.0 },
            uHeight: { value: 5.5 },
            uFogDepth: { value: 15 },
            uSteps: { value: 70.0 },
            uBrightness: { value: 1.0 },
            uOpacity: { value: 1.0 },
            uGrain: { value: 1.0 },
            uGrainIntensity: { value: 0.05 },
            uMouse: { value: new Float32Array([0.5, 0.5]) },
            uParallax: { value: 0.5 },
            uEnableMouse: { value: true },
            uHorizonColor: { value: new Float32Array([0.086, 0.094, 0.118]) },
            uWaveColor: { value: new Float32Array([0.478, 0.51, 0.565]) },
            uCrestColor: { value: new Float32Array([0.91, 0.918, 0.941]) }
        }
    });

    var mesh = new Mesh(gl, { geometry, program });

    function setSize() {
        var rect = container.getBoundingClientRect();
        var w = Math.max(1, Math.floor(rect.width));
        var h = Math.max(1, Math.floor(rect.height));
        renderer.setSize(w, h);
        var res = program.uniforms.iResolution.value;
        res[0] = gl.drawingBufferWidth;
        res[1] = gl.drawingBufferHeight;
        renderer.render({ scene: mesh });
    }
    var ro = new ResizeObserver(setSize);
    ro.observe(container);
    setSize();

    var currentMouse = [0.5, 0.5];
    var targetMouse = [0.5, 0.5];

    canvas.addEventListener("pointermove", function (e) {
        var rect = canvas.getBoundingClientRect();
        targetMouse[0] = (e.clientX - rect.left) / rect.width;
        targetMouse[1] = 1.0 - (e.clientY - rect.top) / rect.height;
    });
    canvas.addEventListener("pointerleave", function () {
        targetMouse[0] = 0.5;
        targetMouse[1] = 0.5;
    });

    var raf = 0;
    var isVisible = true;
    var isPageVisible = !document.hidden;
    var t0 = performance.now();

    function loop(t) {
        program.uniforms.iTime.value = (t - t0) * 0.001;
        currentMouse[0] += 0.05 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.05 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
        renderer.render({ scene: mesh });
        raf = requestAnimationFrame(loop);
    }

    function tryStart() {
        if (isVisible && isPageVisible && raf === 0) raf = requestAnimationFrame(loop);
    }
    function tryStop() {
        if (raf !== 0) {
            cancelAnimationFrame(raf);
            raf = 0;
        }
    }

    var io = new IntersectionObserver(
        function (entries) {
            isVisible = entries[0].isIntersecting;
            isVisible ? tryStart() : tryStop();
        },
        { threshold: 0 }
    );
    io.observe(container);

    document.addEventListener("visibilitychange", function () {
        isPageVisible = !document.hidden;
        isPageVisible ? tryStart() : tryStop();
    });

    tryStart();
})();
