(function () {
    function loadWorksData(cb) {
        fetch("data/works.json", { cache: "no-store" })
            .then(function (r) {
                if (!r.ok) throw new Error("HTTP " + r.status);
                return r.json();
            })
            .then(function (json) {
                cb(null, json);
            })
            .catch(function (err) {
                cb(err);
            });
    }
    window.loadWorksData = loadWorksData;

    var featuredGrid = document.getElementById("featured-grid");
    var galleryCols = document.getElementById("gallery-cols");
    if (!featuredGrid && !galleryCols) return;

    loadWorksData(function (err, data) {
        if (err || !data) {
            if (featuredGrid) {
                featuredGrid.innerHTML = '<p class="section-sub">作品数据加载失败，请刷新重试。</p>';
            }
            return;
        }
        var works = data.works || [];
        if (featuredGrid) {
            renderFeatured(works.filter(function (w) { return w.featured; }));
        }
        if (galleryCols) {
            renderGallery(data.gallery || []);
        }
    });

    var VP_CONTROLS =
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

    function brief(item) {
        var d = String(item.desc || "").split("\n")[0].trim();
        return d.length > 44 ? d.slice(0, 44) + "…" : d;
    }

    function renderFeatured(items) {
        featuredGrid.innerHTML = "";
        items.forEach(function (item) {
            var card = document.createElement("div");
            card.className = "work-card reveal";
            var media = document.createElement("div");
            media.className = "work-media";
            if (item.video) {
                media.setAttribute("data-video", "");
                media.innerHTML =
                    '<video class="work-video" preload="metadata" poster="' + item.img + '" src="' + item.video + '"></video>' +
                    VP_CONTROLS;
            } else {
                var img = document.createElement("img");
                img.src = item.img;
                img.alt = item.title;
                img.loading = "lazy";
                img.draggable = false;
                media.appendChild(img);
            }
            card.appendChild(media);
            var info = document.createElement("div");
            info.className = "work-info";
            var h3 = document.createElement("h3");
            h3.textContent = item.title;
            var p = document.createElement("p");
            p.textContent = brief(item);
            info.appendChild(h3);
            info.appendChild(p);
            card.appendChild(info);
            featuredGrid.appendChild(card);
            if (window.observeReveal) window.observeReveal(card);
            if (window.bindTilt) window.bindTilt(card);
            if (item.video && window.initVideoPlayer) window.initVideoPlayer(media);
        });
    }

    function renderGallery(list) {
        galleryCols.innerHTML = "";
        list.forEach(function (src, i) {
            var div = document.createElement("div");
            div.className = "gallery-item reveal";
            var img = document.createElement("img");
            img.src = src;
            img.alt = "图集 " + (i + 1);
            img.loading = "lazy";
            img.draggable = false;
            div.appendChild(img);
            galleryCols.appendChild(div);
            if (window.observeReveal) window.observeReveal(div);
            if (window.bindTilt) window.bindTilt(div);
        });
    }
})();
