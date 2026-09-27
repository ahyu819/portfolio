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
            works.forEach(function (w, i) { w._idx = i; });
            renderFeatured(works.filter(function (w) { return w.featured; }));
        }
        if (galleryCols) {
            renderGallery(data.gallery || []);
        }
    });

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
            var img = document.createElement("img");
            img.src = item.img;
            img.alt = item.title;
            img.loading = "lazy";
            img.draggable = false;
            media.appendChild(img);
            if (item.video) {
                var play = document.createElement("span");
                play.className = "work-play-icon";
                play.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>';
                media.appendChild(play);
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
            card.addEventListener("click", function () {
                window.location.href = "works.html#work-" + item._idx;
            });
            featuredGrid.appendChild(card);
            if (window.observeReveal) window.observeReveal(card);
            if (window.bindTilt) window.bindTilt(card);
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
