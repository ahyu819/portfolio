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
                "</figcaption>";
            card.addEventListener("click", function () {
                window.openWorkSnapshot(item);
            });
            grid.appendChild(card);
            revealObserver.observe(card);
            if (window.bindTilt) window.bindTilt(card);
        });
    }


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
            var m = window.location.hash.match(/^#work-(\d+)$/);
            if (m && WORKS[+m[1]]) window.openWorkSnapshot(WORKS[+m[1]]);
        });
    }
})();
