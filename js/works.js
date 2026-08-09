(function () {
    var WORKS = [
        {
            title: "视频作品 · 占位标题",
            type: "视频",
            video: "https://www.w3schools.com/html/mov_bbb.mp4",
            img: "https://picsum.photos/seed/work1/900/560",
            featured: true,
            desc: "这里是视频作品的详细说明：创作背景、做了什么、用什么做的、达到什么效果。里程碑 5 时把真实文案填进来。",
            tags: ["分类", "工具", "年份"]
        },
        {
            title: "图片作品 · 占位标题 1",
            type: "图片",
            img: "https://picsum.photos/seed/work2/900/560",
            isNew: true,
            desc: "这里是图片作品 1 的详细说明：创作背景、做了什么、用什么做的、拍 / 画了什么主题。里程碑 5 时把真实内容填进来。",
            tags: ["分类", "工具", "年份"]
        },
        {
            title: "图片作品 · 占位标题 2",
            type: "图片",
            img: "https://picsum.photos/seed/work3/900/560",
            isNew: true,
            desc: "这里是图片作品 2 的详细说明：创作背景、做了什么、用了什么工具。里程碑 5 时把真实内容填进来。",
            tags: ["分类", "工具", "年份"]
        },
        {
            title: "交互网页 · 占位标题",
            type: "交互",
            img: "https://picsum.photos/seed/work4/900/560",
            desc: "这里是交互网页作品的详细说明：页面思路、动效实现、技术栈。里程碑 5 时把真实内容填进来。",
            tags: ["分类", "工具", "年份"]
        },
        {
            title: "品牌设计 · 占位标题",
            type: "设计",
            img: "https://picsum.photos/seed/work5/900/560",
            desc: "这里是品牌设计作品的详细说明：概念、方案、应用场景。里程碑 5 时把真实内容填进来。",
            tags: ["分类", "工具", "年份"]
        },
        {
            title: "动效短片 · 占位标题",
            type: "视频",
            img: "https://picsum.photos/seed/work6/900/560",
            isNew: true,
            desc: "这里是动效短片的详细说明：分镜、节奏、渲染输出。里程碑 5 时把真实内容填进来。",
            tags: ["分类", "工具", "年份"]
        }
    ];

    var TYPES = ["全部", "视频", "图片", "交互", "设计"];

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

    function buildFilter() {
        var bar = document.getElementById("works-filter");
        if (!bar) return;
        TYPES.forEach(function (t, i) {
            var btn = document.createElement("button");
            btn.type = "button";
            btn.className = "filter-chip" + (i === 0 ? " active" : "");
            btn.textContent = t;
            btn.addEventListener("click", function () {
                if (btn.classList.contains("active")) return;
                bar.querySelectorAll(".filter-chip").forEach(function (b) {
                    b.classList.remove("active");
                });
                btn.classList.add("active");
                renderGrid(t);
            });
            bar.appendChild(btn);
        });
    }

    function badge(item) {
        if (item.featured) return '<span class="work-badge featured">精选</span>';
        if (item.isNew) return '<span class="work-badge">NEW</span>';
        return "";
    }

    function renderGrid(type) {
        grid.innerHTML = "";
        WORKS.forEach(function (item, idx) {
            if (type !== "全部" && item.type !== type) return;
            var card = document.createElement("figure");
            card.className = "reveal work-card";
            card.setAttribute("data-index", idx);
            card.innerHTML =
                '<div class="work-thumb">' +
                badge(item) +
                '<img src="' + item.img + '" alt="' + item.title + '" loading="lazy" draggable="false">' +
                (item.video ? '<span class="work-play-icon"><svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M8 5v14l11-7z"/></svg></span>' : "") +
                "</div>" +
                '<figcaption class="work-caption">' +
                '<h3>' + item.title + "</h3>" +
                '<span class="work-chip">' + item.type + "</span>" +
                "</figcaption>";
            card.addEventListener("click", function () {
                openSnapshot(item);
            });
            grid.appendChild(card);
            revealObserver.observe(card);
        });
    }

    var snapshot = document.getElementById("snapshot");
    var snapshotMedia = document.getElementById("snapshot-media");
    var snapshotTitle = document.getElementById("snapshot-title");
    var snapshotType = document.getElementById("snapshot-type");
    var snapshotDesc = document.getElementById("snapshot-desc");
    var snapshotTags = document.getElementById("snapshot-tags");
    var snapshotClose = snapshot.querySelector(".snapshot-close");

    function openSnapshot(w) {
        snapshotMedia.innerHTML = "";
        if (w.video) {
            var v = document.createElement("video");
            v.src = w.video;
            v.controls = true;
            v.preload = "metadata";
            v.draggable = false;
            snapshotMedia.appendChild(v);
        } else {
            var img = document.createElement("img");
            img.src = w.img;
            img.alt = w.title;
            img.draggable = false;
            snapshotMedia.appendChild(img);
        }
        snapshotTitle.textContent = w.title;
        snapshotType.textContent = w.type;
        snapshotDesc.textContent = w.desc;
        snapshotTags.innerHTML = "";
        (w.tags || []).forEach(function (t) {
            var span = document.createElement("span");
            span.className = "skill-chip";
            span.textContent = t;
            snapshotTags.appendChild(span);
        });
        snapshot.classList.add("open");
        document.body.classList.add("snapshot-lock");
    }

    function closeSnapshot() {
        snapshot.classList.remove("open");
        document.body.classList.remove("snapshot-lock");
        snapshotMedia.innerHTML = "";
    }

    snapshotClose.addEventListener("click", closeSnapshot);
    snapshot.addEventListener("click", function (e) {
        if (e.target === snapshot) closeSnapshot();
    });
    document.addEventListener("keydown", function (e) {
        if (e.code === "Escape" && snapshot.classList.contains("open")) closeSnapshot();
    });

    buildFilter();
    renderGrid("全部");
})();