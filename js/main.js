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

    lightbox.addEventListener("mousedown", function (e) {
        if (e.button !== 0) return;
        if (!lightboxRing.contains(e.target)) return;
        dragStartX = e.clientX;
        dragStartY = e.clientY;
        didDrag = false;
        lightboxRing.classList.add("dragging");
    });

    window.addEventListener("mousemove", function (e) {
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

    window.addEventListener("mouseup", function () {
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
        lightboxMedia.appendChild(img);
        lightbox.classList.add("open");
        resetView();
    }

    function closeLightbox() {
        lightbox.classList.remove("open");
        lightboxMedia.innerHTML = "";
        resetView();
    }

    document
        .querySelectorAll(".gallery-item img, .work-card .work-media img")
        .forEach(function (img) {
            img.addEventListener("click", function () {
                openImage(img.src);
            });
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

    document.querySelectorAll("[data-video]").forEach(function (wrap) {
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
    });

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
})();