(function () {
    var revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.15 }
    );

    document.querySelectorAll(".reveal").forEach(function (el) {
        revealObserver.observe(el);
    });

    window.observeReveal = function (el) {
        revealObserver.observe(el);
    };

    var PLAY_ICON =
        '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    var PAUSE_ICON =
        '<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    var SMALL_PLAY =
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
    var SMALL_PAUSE =
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M6 5h4v14H6zM14 5h4v14h-4z"/></svg>';
    var VOLUME_ICON =
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16.5 12a4.5 4.5 0 0 0-2.5-4v8a4.5 4.5 0 0 0 2.5-4z"/></svg>';
    var MUTE_ICON =
        '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3z"/><path d="M16 8l5 6M21 8l-5 6"/></svg>';
    var FS_ENTER =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
    var FS_EXIT =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';

    var lightbox = document.getElementById("lightbox");
    var lightboxMedia = document.getElementById("lightbox-media");
    var lightboxRing = lightbox.querySelector(".lightbox-ring");

    var zoom = 1;
    var minZoom = 1;
    var maxZoom = 4;
    var tx = 0;
    var ty = 0;

    function clamp(v, a, b) {
        return Math.min(b, Math.max(a, v));
    }

    function applyView() {
        lightboxRing.style.transform = "translate(" + tx + "px," + ty + "px) scale(" + zoom + ")";
    }

    function resetView() {
        zoom = 1;
        tx = 0;
        ty = 0;
        applyView();
    }

    function zoomAt(px, py, factor) {
        var rect = lightboxRing.getBoundingClientRect();
        var cx = px - rect.left - rect.width / 2;
        var cy = py - rect.top - rect.height / 2;
        var prev = zoom;
        zoom = clamp(prev * factor, minZoom, maxZoom);
        var k = zoom / prev;
        tx = cx - (cx - tx) * k;
        ty = cy - (cy - ty) * k;
        applyView();
    }

    lightbox.addEventListener(
        "wheel",
        function (e) {
            e.preventDefault();
            zoomAt(e.clientX, e.clientY, e.deltaY < 0 ? 1.1 : 0.9);
        },
        { passive: false }
    );

    var pinchStartDist = 0;
    var pinching = false;
    var dragStartX = 0;
    var dragStartY = 0;
    var didDrag = false;

    function touchCount(e) {
        return e.touches.length;
    }

    function touchDistance(touches) {
        var dx = touches[0].clientX - touches[1].clientX;
        var dy = touches[0].clientY - touches[1].clientY;
        return Math.sqrt(dx * dx + dy * dy);
    }

    lightbox.addEventListener(
        "touchstart",
        function (e) {
            if (touchCount(e) === 2) {
                pinching = true;
                pinchStartDist = touchDistance(e.touches);
            } else if (touchCount(e) === 1 && lightboxRing.contains(e.target)) {
                dragStartX = e.touches[0].clientX;
                dragStartY = e.touches[0].clientY;
                lightboxRing.classList.add("dragging");
            }
        },
        { passive: false }
    );

    lightbox.addEventListener(
        "touchmove",
        function (e) {
            if (pinching && touchCount(e) === 2) {
                e.preventDefault();
                var t0 = e.touches[0];
                var t1 = e.touches[1];
                var px = (t0.clientX + t1.clientX) / 2;
                var py = (t0.clientY + t1.clientY) / 2;
                var dist = touchDistance(e.touches);
                zoomAt(px, py, dist / pinchStartDist);
                pinchStartDist = dist;
                return;
            }
            if (touchCount(e) === 1) {
                e.preventDefault();
                var t = e.touches[0];
                var dx = t.clientX - dragStartX;
                var dy = t.clientY - dragStartY;
                if (Math.abs(dx) + Math.abs(dy) > 4) didDrag = true;
                tx += dx;
                ty += dy;
                dragStartX = t.clientX;
                dragStartY = t.clientY;
                applyView();
            }
        },
        { passive: false }
    );

    lightbox.addEventListener("touchend", function () {
        pinching = false;
        lightboxRing.classList.remove("dragging");
    });

    lightbox.addEventListener("pointerdown", function (e) {
        if (e.pointerType !== "mouse" || e.button !== 0) return;
        if (!lightboxRing.contains(e.target)) return;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        didDrag = false;
        lightboxRing.setPointerCapture(e.pointerId);
        lightboxRing.classList.add("dragging");
    });

    lightbox.addEventListener("pointermove", function (e) {
        if (!lightboxRing.classList.contains("dragging")) return;
        var dx = e.clientX - dragStartX;
        var dy = e.clientY - dragStartY;
        if (Math.abs(dx) + Math.abs(dy) > 4) didDrag = true;
        tx += dx;
        ty += dy;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        applyView();
    });

    lightbox.addEventListener("pointerup", function () {
        lightboxRing.classList.remove("dragging");
    });

    lightbox.addEventListener("pointercancel", function () {
        lightboxRing.classList.remove("dragging");
    });

    lightbox.addEventListener("click", function () {
        if (didDrag) {
            didDrag = false;
            return;
        }
        closeLightbox();
    });

    lightbox.addEventListener("dblclick", function () {
        if (zoom > 1) {
            resetView();
        } else {
            zoom = 2;
            applyView();
        }
    });

    function openImage(src) {
        lightboxMedia.innerHTML = "";
        var img = document.createElement("img");
        img.src = src;
        img.alt = "放大查看";
        img.draggable = false;
        lightboxMedia.appendChild(img);
        lightbox.classList.add("open");
        resetView();
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        lightboxMedia.innerHTML = "";
        resetView();
    }

    window.openImage = openImage;

    document.addEventListener("click", function (e) {
        var img = e.target.closest(
            ".gallery-item img, .work-card .work-media img, .detail-card img, .snapshot-gallery img"
        );
        if (!img) return;
        e.preventDefault();
        openImage(img.src);
    });

    function toggleFullscreen(el) {
        var doc = document;
        if (doc.fullscreenElement) {
            doc.exitFullscreen();
        } else if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        }
    }

    window.toggleFullscreen = toggleFullscreen;

    function initVideoPlayer(wrap) {
        var video = wrap.querySelector(".work-video");
        if (!video) return;

        var ctrl = wrap.querySelector(".vp-controls");
        var centerBtn = wrap.querySelector(".vp-center-btn");
        var playToggle = wrap.querySelector(".vp-play-toggle");
        var volumeBtn = wrap.querySelector(".vp-volume-btn");
        var volumePanel = wrap.querySelector(".vp-volume-panel");
        var vSlider = wrap.querySelector(".vp-vol-slider");
        var vFill = wrap.querySelector(".vp-vol-fill");
        var vHandle = wrap.querySelector(".vp-vol-handle");
        var progress = wrap.querySelector(".vp-progress");
        var fill = wrap.querySelector(".vp-progress-fill");
        var timeEl = wrap.querySelector(".vp-time");
        var fsBtn = wrap.querySelector(".vp-fullscreen");

        var INTERACTIVE =
            ".vp-center-btn,.vp-play-toggle,.vp-volume,.vp-volume-panel,.vp-progress,.vp-fullscreen";
        var volumeTimer = null;

        function fmt(sec) {
            if (Number.isNaN(sec)) return "0:00";
            var m = Math.floor(sec / 60);
            var s = Math.floor(sec % 60);
            return m + ":" + (s < 10 ? "0" : "") + s;
        }

        function syncIcons() {
            var playing = !video.paused && !video.ended;
            centerBtn.innerHTML = playing ? PAUSE_ICON : PLAY_ICON;
            playToggle.innerHTML = playing ? SMALL_PAUSE : SMALL_PLAY;
            updateVolumeIcon();
            updateVolumeVisual(video.muted ? 0 : video.volume);
        }

        function updateVolumeIcon() {
            var muted = video.muted || video.volume === 0;
            volumeBtn.innerHTML = muted ? MUTE_ICON : VOLUME_ICON;
        }

        function updateVolumeVisual(v) {
            var pct = (v * 100).toFixed(2);
            vFill.style.height = pct + "%";
            vHandle.style.bottom = pct + "%";
        }

        function setVolume(v) {
            v = clamp(+v || 0, 0, 1);
            video.volume = v;
            video.muted = v === 0;
            updateVolumeVisual(v);
            updateVolumeIcon();
        }

        function volumeFromEvent(clientY) {
            var r = vSlider.getBoundingClientRect();
            return clamp((r.bottom - clientY) / r.height, 0, 1);
        }

        function openVolumePanel() {
            volumePanel.classList.add("open");
            clearTimeout(volumeTimer);
            volumeTimer = setTimeout(function () {
                volumePanel.classList.remove("open");
            }, 2000);
        }

        function closeVolumePanel() {
            clearTimeout(volumeTimer);
            volumePanel.classList.remove("open");
        }

        function togglePlay() {
            if (video.paused || video.ended) {
                video.play();
            } else {
                video.pause();
            }
        }

        wrap.addEventListener("click", function (e) {
            if (e.target.closest(INTERACTIVE)) return;
            ctrl.classList.toggle("show");
        });

        centerBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            togglePlay();
        });

        playToggle.addEventListener("click", function (e) {
            e.stopPropagation();
            togglePlay();
        });

        volumeBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            if (volumePanel.classList.contains("open")) {
                closeVolumePanel();
            } else {
                openVolumePanel();
            }
        });

        vSlider.addEventListener("pointerdown", function (e) {
            e.preventDefault();
            clearTimeout(volumeTimer);
            vSlider.setPointerCapture(e.pointerId);
            setVolume(volumeFromEvent(e.clientY));
        });

        vSlider.addEventListener("pointermove", function (e) {
            if (!vSlider.hasPointerCapture(e.pointerId)) return;
            setVolume(volumeFromEvent(e.clientY));
        });

        vSlider.addEventListener("pointerup", function () {
            if (volumePanel.classList.contains("open")) {
                clearTimeout(volumeTimer);
                volumeTimer = setTimeout(function () {
                    volumePanel.classList.remove("open");
                }, 2000);
            }
        });

        video.addEventListener("play", syncIcons);
        video.addEventListener("pause", syncIcons);
        video.addEventListener("ended", syncIcons);

        video.addEventListener("timeupdate", function () {
            if (video.duration) {
                fill.style.width = (video.currentTime / video.duration) * 100 + "%";
            }
            timeEl.textContent = fmt(video.currentTime) + " / " + fmt(video.duration);
        });

        progress.addEventListener("click", function (e) {
            var rect = progress.getBoundingClientRect();
            var pct = (e.clientX - rect.left) / rect.width;
            if (video.duration) {
                video.currentTime = pct * video.duration;
            }
        });

        fsBtn.innerHTML = FS_ENTER;
        fsBtn.addEventListener("click", function (e) {
            e.stopPropagation();
            toggleFullscreen(wrap);
        });

        document.addEventListener("fullscreenchange", function () {
            fsBtn.innerHTML = document.fullscreenElement ? FS_EXIT : FS_ENTER;
        });

        document.addEventListener("keydown", function (e) {
            if (e.code !== "Space") return;
            if (document.fullscreenElement !== wrap) return;
            var tag = (e.target.tagName || "").toLowerCase();
            if (tag === "input" || tag === "textarea") return;
            e.preventDefault();
            togglePlay();
        });

        syncIcons();
    }

    window.initVideoPlayer = initVideoPlayer;
    document.querySelectorAll("[data-video]").forEach(initVideoPlayer);

    var navLinks = document.querySelectorAll("nav a");
    var sections = document.querySelectorAll("section[id]");

    function highlightNav() {
        var pos = window.scrollY + 120;
        var currentId = null;
        sections.forEach(function (sec) {
            if (pos >= sec.offsetTop) {
                currentId = sec.id;
            }
        });
        navLinks.forEach(function (link) {
            link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
        });
    }

    window.addEventListener("scroll", highlightNav);
    highlightNav();

    // 「向下滑动」提示：仅页面最顶部显示，滚下即淡出
    var scrollHint = document.querySelector(".scroll-hint");
    if (scrollHint) {
        var updateScrollHint = function () {
            scrollHint.classList.toggle("hide", window.scrollY > 40);
        };
        window.addEventListener("scroll", updateScrollHint, { passive: true });
        updateScrollHint();
    }
})();

(function () {
    var PAD = 20;

    var VERT = "#version 300 es\nin vec2 position;\nvoid main() {\n  gl_Position = vec4(position, 0.0, 1.0);\n}\n";

    var FRAG = "#version 300 es\n" +
        "precision highp float;\n" +
        "uniform vec2 uCenter;\n" +
        "uniform vec2 uHalfSize;\n" +
        "uniform float uRadius;\n" +
        "uniform float uAngle;\n" +
        "uniform float uPx;\n" +
        "uniform vec3 uLineColor;\n" +
        "uniform vec3 uBaseColor;\n" +
        "uniform float uIntensity;\n" +
        "uniform float uShineSize;\n" +
        "uniform float uShineFade;\n" +
        "uniform float uThickness;\n" +
        "uniform float uBaseWidth;\n" +
        "out vec4 fragColor;\n" +
        "float sdRoundedRect(vec2 p, vec2 b, float r) {\n" +
        "  vec2 q = abs(p) - b + r;\n" +
        "  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;\n" +
        "}\n" +
        "float shapeSDF(vec2 p) { return sdRoundedRect(p, uHalfSize, uRadius); }\n" +
        "float gaussianLine(float d, float sigma) {\n" +
        "  float x = d / (sigma + 1e-6);\n" +
        "  float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));\n" +
        "  return exp(-k * x * x);\n" +
        "}\n" +
        "void main() {\n" +
        "  vec2 p = gl_FragCoord.xy - uCenter;\n" +
        "  float d = shapeSDF(p);\n" +
        "  vec2 L = vec2(cos(uAngle), sin(uAngle));\n" +
        "  float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;\n" +
        "  vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);\n" +
        "  float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));\n" +
        "  float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);\n" +
        "  float line = gaussianLine(d, uThickness);\n" +
        "  float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));\n" +
        "  float hi = line * rim * edgeClamp * uIntensity;\n" +
        "  vec3 col = uBaseColor * base + uLineColor * hi;\n" +
        "  float a = clamp(base + hi, 0.0, 1.0);\n" +
        "  fragColor = vec4(col, a);\n" +
        "}\n";

    function setup(btn) {
        var fx = btn.querySelector(".more-btn-fx");
        if (!fx) return;
        var canvas = document.createElement("canvas");
        fx.appendChild(canvas);
        var gl = canvas.getContext("webgl2", { alpha: true });
        if (!gl) return;

        function compileShader(type, src) {
            var s = gl.createShader(type);
            gl.shaderSource(s, src);
            gl.compileShader(s);
            if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
                canvas.remove();
                return null;
            }
            return s;
        }

        var vs = compileShader(gl.VERTEX_SHADER, VERT);
        if (!vs) return;
        var fs = compileShader(gl.FRAGMENT_SHADER, FRAG);
        if (!fs) return;

        var prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.bindAttribLocation(prog, 0, "position");
        gl.linkProgram(prog);
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            canvas.remove();
            return;
        }
        gl.useProgram(prog);

        function uni(name) {
            return gl.getUniformLocation(prog, name);
        }
        var uCenter = uni("uCenter");
        var uHalfSize = uni("uHalfSize");
        var uRadius = uni("uRadius");
        var uAngle = uni("uAngle");
        var uPx = uni("uPx");
        var uLineColor = uni("uLineColor");
        var uBaseColor = uni("uBaseColor");
        var uIntensity = uni("uIntensity");
        var uShineSize = uni("uShineSize");
        var uShineFade = uni("uShineFade");
        var uThickness = uni("uThickness");
        var uBaseWidth = uni("uBaseWidth");

        var tri = new Float32Array([-1, -1, 3, -1, -1, 3]);
        var buf = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, tri, gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0);
        gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

        gl.clearColor(0, 0, 0, 0);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

        var dpr = window.devicePixelRatio || 1;
        var sizeRef = { w: 1, h: 1 };

        function resize() {
            var rect = btn.getBoundingClientRect();
            var w = rect.width;
            var h = rect.height;
            sizeRef.w = w;
            sizeRef.h = h;
            canvas.width = Math.round((w + PAD * 2) * dpr);
            canvas.height = Math.round((h + PAD * 2) * dpr);
            gl.viewport(0, 0, canvas.width, canvas.height);
            gl.uniform2fv(uCenter, [(PAD + w / 2) * dpr, (PAD + h / 2) * dpr]);
            gl.uniform2fv(uHalfSize, [(w / 2) * dpr, (h / 2) * dpr]);
        }

        var ro = new ResizeObserver(function () { resize(); });
        ro.observe(btn);
        resize();

        gl.uniform1f(uPx, dpr);
        gl.uniform3f(uLineColor, 1, 1, 1);
        gl.uniform3f(uBaseColor, 0.32, 0.32, 0.32);
        gl.uniform1f(uShineSize, (10 * Math.PI) / 180);
        gl.uniform1f(uShineFade, (40 * Math.PI) / 180);
        gl.uniform1f(uThickness, 1.7 * dpr);
        gl.uniform1f(uBaseWidth, dpr);

        var pointerAngle = null;
        var proximityT = 0;

        window.addEventListener("pointermove", function (e) {
            var rect = btn.getBoundingClientRect();
            var cx = rect.left + rect.width / 2;
            var cy = rect.top + rect.height / 2;
            var dx = Math.max(rect.left - e.clientX, 0, e.clientX - rect.right);
            var dy = Math.max(rect.top - e.clientY, 0, e.clientY - rect.bottom);
            var dist = Math.hypot(dx, dy);
            if (dist === 0) {
                var nx = (e.clientX - cx) / (rect.width / 2);
                var ny = (cy - e.clientY) / (rect.height / 2);
                pointerAngle = Math.atan2(2 / rect.height, -2 / rect.width) + nx * 0.3 + ny * 0.15;
            } else {
                pointerAngle = Math.atan2(cy - e.clientY, e.clientX - cx);
            }
            var t = Math.max(0, 1 - dist / 250);
            proximityT = t * t * (3 - 2 * t);
        });

        var angle = 2.4;
        var idleAngle = 2.4;
        var brightness = 0;
        var last = performance.now();

        function frame(now) {
            requestAnimationFrame(frame);
            var dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            idleAngle += 0.35 * dt;
            var target = pointerAngle != null ? pointerAngle : idleAngle;
            var diff = ((target - angle + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
            angle += diff * (1 - Math.exp(-dt * 7));
            brightness += (proximityT - brightness) * (1 - Math.exp(-dt * 8));
            gl.uniform1f(uAngle, angle);
            gl.uniform1f(uIntensity, brightness);
            gl.uniform1f(uRadius, Math.min(18, Math.min(sizeRef.w, sizeRef.h) / 2) * dpr);
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
        requestAnimationFrame(frame);
    }

    var moreBtns = document.querySelectorAll(".more-btn");
    for (var i = 0; i < moreBtns.length; i++) {
        setup(moreBtns[i]);
    }
})();

(function () {
    var DURATION = 400;
    var SPARK_COUNT = 8;
    var SPARK_RADIUS = 15;
    var SPARK_SIZE = 7;

    var canvas = document.createElement("canvas");
    canvas.id = "click-spark";
    document.body.appendChild(canvas);
    var ctx = canvas.getContext("2d");
    var dpr = window.devicePixelRatio || 1;

    function resize() {
        canvas.width = Math.round(window.innerWidth * dpr);
        canvas.height = Math.round(window.innerHeight * dpr);
    }
    window.addEventListener("resize", resize);
    resize();

    var sparks = [];
    var running = false;

    function easeOut(t) {
        return t * (2 - t);
    }

    function spawn(x, y) {
        var now = performance.now();
        var color = document.documentElement.getAttribute("data-theme") === "light" ? "#14181f" : "#ffffff";
        for (var i = 0; i < SPARK_COUNT; i++) {
            sparks.push({
                x: x * dpr,
                y: y * dpr,
                angle: (2 * Math.PI * i) / SPARK_COUNT,
                start: now,
                color: color
            });
        }
        if (!running) {
            running = true;
            requestAnimationFrame(draw);
        }
    }

    function draw(now) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        sparks = sparks.filter(function (s) {
            var elapsed = now - s.start;
            if (elapsed >= DURATION) return false;
            var t = easeOut(elapsed / DURATION);
            var dist = t * SPARK_RADIUS * dpr;
            var len = SPARK_SIZE * (1 - t) * dpr;
            var x1 = s.x + dist * Math.cos(s.angle);
            var y1 = s.y + dist * Math.sin(s.angle);
            var x2 = s.x + (dist + len) * Math.cos(s.angle);
            var y2 = s.y + (dist + len) * Math.sin(s.angle);
            ctx.strokeStyle = s.color;
            ctx.lineWidth = 2 * dpr;
            ctx.lineCap = "round";
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
            return true;
        });
        if (sparks.length) {
            requestAnimationFrame(draw);
        } else {
            running = false;
        }
    }

    var downX = null;
    var downY = null;

    document.addEventListener("pointerdown", function (e) {
        downX = e.clientX;
        downY = e.clientY;
    });

    document.addEventListener("pointerup", function (e) {
        if (downX == null) return;
        var dx = e.clientX - downX;
        var dy = e.clientY - downY;
        downX = null;
        downY = null;
        if (Math.abs(dx) > 6 || Math.abs(dy) > 6) return;
        spawn(e.clientX, e.clientY);
    });

    document.addEventListener("pointercancel", function () {
        downX = null;
        downY = null;
    });
})();

(function () {
    var AMP = 7;
    var SCALE = 1.08;
    var cards = [];
    var running = false;
    var last = performance.now();

    function tick(now) {
        var dt = Math.min((now - last) / 1000, 0.05);
        last = now;
        var damp = Math.exp(-7.5 * dt);
        var k = 100 * dt;
        var active = false;
        for (var i = 0; i < cards.length; i++) {
            var c = cards[i];
            c.vx += (c.tx - c.rx) * k;
            c.vx *= damp;
            c.rx += c.vx * dt;
            c.vy += (c.ty - c.ry) * k;
            c.vy *= damp;
            c.ry += c.vy * dt;
            c.vs += (c.ts - c.s) * k;
            c.vs *= damp;
            c.s += c.vs * dt;
            if (Math.abs(c.rx - c.tx) > 0.02 || Math.abs(c.ry - c.ty) > 0.02 || Math.abs(c.s - c.ts) > 0.002) {
                active = true;
            }
            c.img.style.transform = "rotateX(" + c.rx.toFixed(2) + "deg) rotateY(" + c.ry.toFixed(2) + "deg) scale(" + c.s.toFixed(4) + ")";
        }
        if (active) {
            requestAnimationFrame(tick);
        } else {
            running = false;
        }
    }

    function start() {
        if (!running) {
            running = true;
            requestAnimationFrame(tick);
        }
    }

    function bindTilt(item) {
        if (item.getAttribute("data-tilt") === "1") return;
        item.setAttribute("data-tilt", "1");
        var img = item.querySelector("img") || item.querySelector("video");
        if (!img) return;
        var c = { img: img, rx: 0, ry: 0, s: 1, tx: 0, ty: 0, ts: 1, vx: 0, vy: 0, vs: 0 };
        cards.push(c);
        item.addEventListener("pointerenter", function (e) {
            if (e.pointerType !== "mouse") return;
            item.classList.add("active");
        });
        item.addEventListener("pointermove", function (e) {
            if (e.pointerType !== "mouse") return;
            var rect = item.getBoundingClientRect();
            var ox = e.clientX - rect.left - rect.width / 2;
            var oy = e.clientY - rect.top - rect.height / 2;
            c.tx = (oy / (rect.height / 2)) * -AMP;
            c.ty = (ox / (rect.width / 2)) * AMP;
            c.ts = SCALE;
            start();
        });
        item.addEventListener("pointerleave", function () {
            item.classList.remove("active");
            c.tx = 0;
            c.ty = 0;
            c.ts = 1;
            start();
        });
    }

    window.bindTilt = bindTilt;
    document.querySelectorAll(".gallery-item, .work-card").forEach(bindTilt);
})();