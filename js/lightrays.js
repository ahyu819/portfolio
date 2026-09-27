import { Renderer, Program, Triangle, Mesh } from "ogl";

(function () {
    if (window.innerWidth <= 700) return; /* 手机端禁用 WebGL 背景，CSS 渐变兜底 */
    var container = document.createElement("div");
    container.className = "light-rays-container";
    document.body.appendChild(container);

    var renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: true });
    var gl = renderer.gl;
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    container.appendChild(gl.canvas);

    var vert = `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}`;

    var frag = `precision highp float;

uniform float iTime;
uniform vec2  iResolution;

uniform vec2  rayPos;
uniform vec2  rayDir;
uniform vec3  raysColor;
uniform float raysSpeed;
uniform float lightSpread;
uniform float rayLength;
uniform float pulsating;
uniform float fadeDistance;
uniform float saturation;
uniform vec2  mousePos;
uniform float mouseInfluence;
uniform float noiseAmount;
uniform float distortion;

varying vec2 vUv;

float noise(vec2 st) {
  return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
}

float rayStrength(vec2 raySource, vec2 rayRefDirection, vec2 coord,
                  float seedA, float seedB, float speed) {
  vec2 sourceToCoord = coord - raySource;
  vec2 dirNorm = normalize(sourceToCoord);
  float cosAngle = dot(dirNorm, rayRefDirection);

  float distortedAngle = cosAngle + distortion * sin(iTime * 2.0 + length(sourceToCoord) * 0.01) * 0.2;
  
  float spreadFactor = pow(max(distortedAngle, 0.0), 1.0 / max(lightSpread, 0.001));

  float distance = length(sourceToCoord);
  float maxDistance = iResolution.x * rayLength;
  float lengthFalloff = clamp((maxDistance - distance) / maxDistance, 0.0, 1.0);
  
  float fadeFalloff = clamp((iResolution.x * fadeDistance - distance) / (iResolution.x * fadeDistance), 0.5, 1.0);
  float pulse = pulsating > 0.5 ? (0.8 + 0.2 * sin(iTime * speed * 3.0)) : 1.0;

  float baseStrength = clamp(
    (0.45 + 0.15 * sin(distortedAngle * seedA + iTime * speed)) +
    (0.3 + 0.2 * cos(-distortedAngle * seedB + iTime * speed)),
    0.0, 1.0
  );

  return baseStrength * lengthFalloff * fadeFalloff * spreadFactor * pulse;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
  
  vec2 finalRayDir = rayDir;
  if (mouseInfluence > 0.0) {
    vec2 mouseScreenPos = mousePos * iResolution.xy;
    vec2 mouseDirection = normalize(mouseScreenPos - rayPos);
    finalRayDir = normalize(mix(rayDir, mouseDirection, mouseInfluence));
  }

  vec4 rays1 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 36.2214, 21.11349,
                           1.5 * raysSpeed);
  vec4 rays2 = vec4(1.0) *
               rayStrength(rayPos, finalRayDir, coord, 22.3991, 18.0234,
                           1.1 * raysSpeed);

  fragColor = rays1 * 0.5 + rays2 * 0.4;

  if (noiseAmount > 0.0) {
    float n = noise(coord * 0.01 + iTime * 0.1);
    fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
  }

  float brightness = 1.0 - (coord.y / iResolution.y);
  fragColor.x *= 0.1 + brightness * 0.8;
  fragColor.y *= 0.3 + brightness * 0.6;
  fragColor.z *= 0.5 + brightness * 0.5;

  if (saturation != 1.0) {
    float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
    fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
  }

  fragColor.rgb *= raysColor;
}

void main() {
  vec4 color;
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor  = color;
}`;

    function themeRgb() {
        var light = document.documentElement.getAttribute("data-theme") === "light";
        return light ? [0.08, 0.1, 0.14] : [1, 1, 1];
    }

    var uniforms = {
        iTime: { value: 0 },
        iResolution: { value: [1, 1] },
        rayPos: { value: [0, 0] },
        rayDir: { value: [0, 1] },
        raysColor: { value: themeRgb() },
        raysSpeed: { value: 1 },
        lightSpread: { value: 0.8 },
        rayLength: { value: 1.4 },
        pulsating: { value: 0 },
        fadeDistance: { value: 1.0 },
        saturation: { value: 1.0 },
        mousePos: { value: [0.5, 0.5] },
        mouseInfluence: { value: 0.1 },
        noiseAmount: { value: 0 },
        distortion: { value: 0 }
    };

    var geometry = new Triangle(gl);
    var program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
    var mesh = new Mesh(gl, { geometry, program });

    function updatePlacement() {
        var wCSS = container.clientWidth;
        var hCSS = container.clientHeight;
        renderer.setSize(wCSS, hCSS);
        var dpr = renderer.dpr;
        var w = wCSS * dpr;
        var h = hCSS * dpr;
        uniforms.iResolution.value = [w, h];
        var outside = 0.2;
        uniforms.rayPos.value = [0.5 * w, -outside * h];
        uniforms.rayDir.value = [0, 1];
    }
    window.addEventListener("resize", updatePlacement);
    updatePlacement();

    var mouse = { x: 0.5, y: 0.5 };
    var sm = { x: 0.5, y: 0.5 };

    window.addEventListener("mousemove", function (e) {
        var r = container.getBoundingClientRect();
        mouse.x = (e.clientX - r.left) / r.width;
        mouse.y = (e.clientY - r.top) / r.height;
    });

    var lastTheme = null;

    function loop(t) {
        requestAnimationFrame(loop);
        uniforms.iTime.value = t * 0.001;
        var theme = document.documentElement.getAttribute("data-theme");
        if (theme !== lastTheme) {
            lastTheme = theme;
            uniforms.raysColor.value = themeRgb();
        }
        sm.x = sm.x * 0.92 + mouse.x * 0.08;
        sm.y = sm.y * 0.92 + mouse.y * 0.08;
        uniforms.mousePos.value = [sm.x, sm.y];
        renderer.render({ scene: mesh });
    }
    requestAnimationFrame(loop);
})();
