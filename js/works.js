(function () {
    var WORKS = [];

    var gridWrap = document.getElementById("works-grid-wrap");
    var grid = document.getElementById("works-grid");
    if (!gridWrap || !grid) return;

    var revealObserver = new IntersectionObserver(
        function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    revealObserver.unobserve(entry.target);
                }
            });
        },
        { threshold: 0.12 }
    );

    var curCat = null;
    var curTag = null;

    function matches(item) {
        if (curCat && curCat !== "全部") {
            if (curCat === "精选") {
                if (!item.featured) return false;
            } else if (curCat === "图片") {
                if (item.type === "视频") return false;
            } else if (curCat === "视频") {
                if (item.type !== "视频") return false;
            }
        }
        if (curTag && item.addTag !== curTag) return false;
        return true;
    }

    function badge(text) {
        return '<span class="work-badge">' + text + "</span>";
    }

    function categoryTag(item) {
        return item.type === "视频" ? "视频" : "图片";
    }

    function renderGrid() {
        grid.innerHTML = "";
        WORKS.forEach(function (item, idx) {
            if (!matches(item)) return;
            var card = document.createElement("figure");
            card.className = "reveal work-card";
            card.setAttribute("data-index", idx);
            card.innerHTML =
                '<div class="work-thumb">' +
                (item.featured ? '<span class="work-badge featured">精选</span>' : "") +
                '<img src="' + item.img + '" alt="' + item.title + '" loading="lazy" draggable="false">' +
                (item.video ? '<span class="work-play-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' : "") +
                "</div>" +
                '<figcaption class="work-caption">' +
                "<h3>" + item.title + "</h3>" +
                '<span class="work-badges">' +
                (item.addTag ? badge(item.addTag) : "") +
                badge(categoryTag(item)) +
                "</span>" +
                "</figcaption>";
            card.addEventListener("click", function () {
                openSnapshot(item);
            });
            grid.appendChild(card);
            revealObserver.observe(card);
            if (window.bindTilt) window.bindTilt(card);
        });
    }

    var snapshot = document.getElementById("snapshot");
    var snapshotInner = snapshot.querySelector(".snapshot-inner");
    var snapshotMedia = document.getElementById("snapshot-media");
    var snapshotTitle = document.getElementById("snapshot-title");
    var snapshotType = document.getElementById("snapshot-type");
    var snapshotDesc = document.getElementById("snapshot-desc");
    var snapshotTags = document.getElementById("snapshot-tags");
    var snapshotGallery = document.getElementById("snapshot-gallery");
    var snapshotClose = snapshot.querySelector(".snapshot-close");

    var FS_ENTER =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3"/><path d="M21 8V5a2 2 0 0 0-2-2h-3"/><path d="M3 16v3a2 2 0 0 0 2 2h3"/><path d="M16 21h3a2 2 0 0 0 2-2v-3"/></svg>';
    var FS_EXIT =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/><path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/></svg>';
    var fsIconBtn = null;
    var modelApi = null;
    var currentVideo = null;

    function disposeViewer() {
        if (modelApi) {
            modelApi.dispose();
            modelApi = null;
        }
        currentVideo = null;
    }

    document.addEventListener("fullscreenchange", function () {
        if (fsIconBtn) {
            fsIconBtn.innerHTML = document.fullscreenElement ? FS_EXIT : FS_ENTER;
        }
    });

    function buildTabs(w, mediaNode, modelNode) {
        var tabs = document.createElement("div");
        tabs.className = "snapshot-tabs";
        var mediaLabel = w.video ? "视频" : "图片";
        var bMedia = document.createElement("button");
        bMedia.type = "button";
        bMedia.className = "snapshot-tab active";
        bMedia.textContent = mediaLabel;
        var bModel = document.createElement("button");
        bModel.type = "button";
        bModel.className = "snapshot-tab";
        bModel.textContent = "3D 模型";
        tabs.appendChild(bMedia);
        tabs.appendChild(bModel);

        function activate(showModel) {
            bMedia.classList.toggle("active", !showModel);
            bModel.classList.toggle("active", showModel);
            mediaNode.classList.toggle("is-hidden", showModel);
            modelNode.classList.toggle("is-hidden", !showModel);
            if (currentVideo) {
                if (showModel) currentVideo.pause();
            }
            if (modelApi) modelApi.setPaused(!showModel);
        }

        bMedia.addEventListener("click", function () { activate(false); });
        bModel.addEventListener("click", function () {
            if (!modelNode.dataset.built) {
                modelNode.dataset.built = "1";
                var inner = document.createElement("div");
                inner.className = "snapshot-model-inner";
                modelNode.appendChild(inner);
                var loadingTip = modelNode.querySelector(".model-loading");
                if (loadingTip) inner.appendChild(loadingTip);
                if (window.ModelViewer) {
                    modelApi = window.ModelViewer.create(inner, w.model, {
                        onProgress: function (p) {
                            if (!loadingTip) return;
                            if (p >= 1) {
                                loadingTip.remove();
                            } else if (p < 0) {
                                loadingTip.textContent = "模型加载失败，请检查文件路径";
                            } else {
                                loadingTip.textContent = "模型加载中 " + Math.round(p * 100) + "%";
                            }
                        }
                    });
                } else {
                    loadingTip.textContent = "模型组件未加载";
                }
            }
            activate(true);
        });
        return tabs;
    }

    function openSnapshot(w) {
        disposeViewer();
        snapshotMedia.innerHTML = "";
        fsIconBtn = null;
        currentVideo = null;

        var mediaNode = document.createElement("div");
        mediaNode.className = "snapshot-media-node";

        if (w.video) {
            var wrap = document.createElement("div");
            wrap.className = "work-media snapshot-video";
            wrap.setAttribute("data-video", "");
            wrap.innerHTML =
                '<video class="work-video" preload="metadata" src="' + w.video + '"></video>' +
                '<div class="vp-controls">' +
                '<button class="vp-center-btn" type="button" aria-label="播放或暂停"></button>' +
                '<div class="vp-bottom">' +
                '<button class="vp-play-toggle" type="button" aria-label="播放或暂停"></button>' +
                '<div class="vp-progress"><div class="vp-progress-fill"></div></div>' +
                '<span class="vp-time">0:00 / 0:00</span>' +
                '<div class="vp-volume">' +
                '<button class="vp-volume-btn" type="button" aria-label="音量"></button>' +
                '<div class="vp-volume-panel"><div class="vp-vol-slider"><div class="vp-vol-fill"></div><div class="vp-vol-handle"></div></div></div>' +
                "</div>" +
                '<button class="vp-fullscreen" type="button" aria-label="全屏"></button>' +
                "</div></div>";
            mediaNode.appendChild(wrap);
            if (window.initVideoPlayer) window.initVideoPlayer(wrap);
            currentVideo = wrap.querySelector("video");
        } else {
            var iwrap = document.createElement("div");
            iwrap.className = "snapshot-imgwrap";
            var img = document.createElement("img");
            img.src = w.img;
            img.alt = w.title;
            img.draggable = false;
            var fsBtn = document.createElement("button");
            fsBtn.type = "button";
            fsBtn.className = "vp-fullscreen snapshot-fs";
            fsBtn.setAttribute("aria-label", "全屏");
            fsBtn.innerHTML = FS_ENTER;
            fsBtn.addEventListener("click", function () {
                if (window.toggleFullscreen) window.toggleFullscreen(iwrap);
            });
            iwrap.appendChild(img);
            iwrap.appendChild(fsBtn);
            mediaNode.appendChild(iwrap);
            fsIconBtn = fsBtn;
        }

        var stack = document.createElement("div");
        stack.className = "snapshot-media-stack";
        var stage = document.createElement("div");
        stage.className = "snapshot-stage";
        stack.appendChild(stage);
        stage.appendChild(mediaNode);

        var hasModel = !!w.model;
        if (hasModel) {
            var modelNode = document.createElement("div");
            modelNode.className = "snapshot-model is-hidden";
            var tip = document.createElement("div");
            tip.className = "model-loading";
            tip.textContent = "模型加载中 0%";
            modelNode.appendChild(tip);
            stage.appendChild(modelNode);
            stack.appendChild(buildTabs(w, mediaNode, modelNode));
        }

        snapshotMedia.appendChild(stack);
        snapshotTitle.textContent = w.title;
        snapshotType.textContent = w.type;
        snapshotDesc.textContent = w.desc;
        snapshotTags.innerHTML = "";
        var snapBadges = [];
        if (w.addTag) snapBadges.push(badge(w.addTag));
        snapBadges.push(badge(categoryTag(w)));
        snapshotTags.innerHTML = snapBadges.join("");
        snapshotGallery.innerHTML = "";
        (w.gallery || []).forEach(function (src) {
            var img = document.createElement("img");
            img.src = src;
            img.alt = w.title;
            img.loading = "lazy";
            img.draggable = false;
            snapshotGallery.appendChild(img);
        });
        snapshot.classList.add("open");
        document.body.classList.add("snapshot-lock");
        snapshotInner.scrollTop = 0;
    }

    function closeSnapshot() {
        snapshot.classList.remove("open");
        document.body.classList.remove("snapshot-lock");
        disposeViewer();
        snapshotMedia.innerHTML = "";
    }

    snapshotClose.addEventListener("click", closeSnapshot);
    snapshot.addEventListener("click", function (e) {
        if (e.target === snapshot) closeSnapshot();
    });
    document.addEventListener("keydown", function (e) {
        if (e.code === "Escape" && snapshot.classList.contains("open")) closeSnapshot();
    });

    function initBottomNav() {
        var nav = document.getElementById("bottom-nav");
        if (!nav) return;
        nav.querySelectorAll(".bnav-btn").forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (btn.classList.contains("active")) {
                    btn.classList.remove("active");
                    curCat = null;
                    renderGrid();
                    return;
                }
                nav.querySelectorAll(".bnav-btn").forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
                curCat = btn.getAttribute("data-cat");
                renderGrid();
            });
        });
    }

    function initTagBar() {
        var bar = document.getElementById("works-tagbar");
        if (!bar) return;
        bar.querySelectorAll(".tag-chip").forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (btn.classList.contains("active")) {
                    btn.classList.remove("active");
                    curTag = null;
                    renderGrid();
                    return;
                }
                bar.querySelectorAll(".tag-chip").forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
                curTag = btn.getAttribute("data-tag");
                renderGrid();
            });
        });
    }

    initBottomNav();
    initTagBar();

    if (window.loadWorksData) {
        window.loadWorksData(function (err, data) {
            if (err || !data) {
                grid.innerHTML = '<p class="section-sub">作品数据加载失败，请刷新重试。</p>';
                return;
            }
            WORKS = data.works || [];
            renderGrid();
        });
    }
})();
