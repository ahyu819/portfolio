(function () {
    if (document.getElementById("fab-wrap")) return;

    var CFG = {
        contacts: [
            { icon: "wechat", label: "微信", value: "zhenhaoya500" },
            { icon: "mail", label: "邮箱", value: "2827290813@qq.com", href: "mailto:2827290813@qq.com" }
        ]
    };

    var ICONS = {
        plus: '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
        cross: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>',
        heart:
            '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20.5C7 16.8 3.5 13.6 3.5 9.9 3.5 7.2 5.5 5.2 8 5.2c1.6 0 3 .8 4 2 .9-1.2 2.4-2 4-2 2.5 0 4.5 2 4.5 4.7 0 3.7-3.5 6.9-8.5 10.6z"/></svg>',
        mail: '<svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></svg>',
        wechat:
            '<svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M9 3C5.1 3 2 5.7 2 9c0 1.9 1 3.5 2.6 4.6L4 16l2.7-1.4c.7.2 1.5.3 2.3.3.2 0 .4 0 .6-.1C9.2 14.2 9 13.6 9 13c0-2.8 2.7-5 6-5 .3 0 .7 0 1 .1C15.4 5.3 12.5 3 9 3zM6.5 6.5c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm5 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1z"/><path d="M22 13.5c0-2.5-2.2-4.5-5-4.5s-5 2-5 4.5 2.2 4.5 5 4.5c.6 0 1.2-.1 1.7-.3L20 19l-.4-1.5C20.7 16.6 22 15.2 22 13.5zM14.5 12.2c.4 0 .8.4.8.8s-.4.8-.8.8-.8-.4-.8-.8.4-.8.8-.8zm4 0c.4 0 .8.4.8.8s-.4.8-.8.8-.8-.4-.8-.8.4-.8.8-.8z"/></svg>',
        sun:
            '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4.5"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M4.6 4.6l1.8 1.8M17.6 17.6l1.8 1.8M19.4 4.6l-1.8 1.8M6.4 17.6l-1.8 1.8"/></svg>',
        moon:
            '<svg viewBox="0 0 24 24" width="19" height="19" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
        chevron:
            '<svg class="fab-menu-arrow" viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>'
    };

    var LIKE_KEY = "ajan_site_likes";
    var THEME_KEY = "ajan_theme";

    function likeCount() {
        try {
            return parseInt(localStorage.getItem(LIKE_KEY) || "0", 10) || 0;
        } catch (e) {
            return 0;
        }
    }

    function saveLikes(n) {
        try {
            localStorage.setItem(LIKE_KEY, String(n));
        } catch (e) {}
    }

    var wrap = document.createElement("div");
    wrap.className = "fab-wrap";
    wrap.id = "fab-wrap";
    wrap.innerHTML =
        '<div class="fab-prelayers">' +
        '<div class="fab-prelayer off" style="background:#dde0e7"></div>' +
        '<div class="fab-prelayer off" style="background:#c9cdd7"></div>' +
        '<div class="fab-prelayer off" style="background:#b6bbc8"></div>' +
        '<div class="fab-prelayer off" style="background:#f4f6f8"></div>' +
        "</div>" +
        '<div class="fab-panel">' +
        '<button class="fab-theme-btn" type="button" aria-label="切换深色/浅色模式" title="切换深色/浅色模式">' +
        '<span class="fab-theme-sun">' + ICONS.sun + "</span>" +
        '<span class="fab-theme-moon">' + ICONS.moon + "</span>" +
        "</button>" +
        '<div class="fab-scroll">' +
        '<div class="fab-brand">Ahyu</div>' +
        '<nav class="fab-menu" aria-label="快捷导航">' +
        '<button class="fab-menu-item" type="button" data-act="home"><span class="fab-menu-text">主页</span>' + ICONS.chevron + '<span class="fab-menu-tile" aria-hidden="true"></span></button>' +
        '<div class="fab-collapse" id="fab-home-panel">' +
        '<div class="fab-home-sub">' +
        '<a class="fab-sub-item" href="index.html#hero"><span class="fab-sub-dot"></span>三维设计</a>' +
        '<button class="fab-sub-item" type="button" data-sub="science"><span class="fab-sub-dot"></span>科研绘图</button>' +
        "</div>" +
        "</div>" +
        '<button class="fab-menu-item" type="button" data-act="about"><span class="fab-menu-text">关于我</span><span class="fab-menu-tile" aria-hidden="true"></span></button>' +
        '<div class="fab-collapse" id="fab-about-panel">' +
        '<div class="fab-about-content">你好，我是 Ahyu，一名热爱视觉创作的记录者。喜欢用镜头定格灵感，用设计传递情绪，正在用一件件作品搭建属于自己的小宇宙。</div>' +
        "</div>" +
        '<button class="fab-menu-item" type="button" data-act="msg"><span class="fab-menu-text">说点什么</span><span class="fab-menu-tile" aria-hidden="true"></span></button>' +
        '<div class="fab-collapse" id="fab-msg-panel">' +
        '<div class="fab-msg-content">' +
        '<div class="fab-msg-box">' +
        '<input class="fab-msg-nick" id="fab-msg-nick" maxlength="12" placeholder="昵称（选填）" autocomplete="off">' +
        '<textarea class="fab-msg-input" id="fab-msg-input" placeholder="写点什么吧…"></textarea>' +
        '<button class="fab-msg-send" id="fab-msg-send" type="button">发送</button>' +
        "</div>" +
        '<ul class="fab-msg-list" id="fab-msg-list"></ul>' +
        "</div>" +
        "</div>" +
        "</nav>" +
        "</div>" +
        '<div class="fab-scrim" aria-hidden="true"></div>' +
        '<div class="fab-foot">' +
        '<div class="fab-foot-links">' +
        '<button class="fab-mini" type="button" data-act="like" aria-label="点赞">' + ICONS.heart +
        "<span>点赞</span><span class=\"fab-like-count\">" + likeCount() + "</span>" +
        '<span class="fab-tooltip">喜欢就点个赞</span></button>' +
        '<button class="fab-mini" type="button" data-act="contact" aria-label="联系方式">' + ICONS.mail + "<span>联系</span>" +
        '<div class="fab-contact-pop" id="fab-contact-pop"></div>' +
        "</button>" +
        "</div>" +
        "</div>" +
        "</div>" +
        '<button class="fab-btn" id="fab-btn" type="button" aria-label="菜单">' +
        '<span class="fab-plus">' + ICONS.plus + "</span>" +
        '<span class="fab-cross">' + ICONS.cross + "</span>" +
        "</button>";
    document.body.appendChild(wrap);

    var wrapEl = wrap;
    var fabBtn = wrap.querySelector(".fab-btn");
    var layers = Array.prototype.slice.call(wrap.querySelectorAll(".fab-prelayer"));
    var contactPop = wrap.querySelector("#fab-contact-pop");

    function renderContacts() {
        contactPop.innerHTML = CFG.contacts
            .map(function (c) {
                return (
                    '<a class="fab-contact-item" ' +
                    (c.href ? 'href="' + c.href + '"' : "") +
                    '><span>' + ICONS[c.icon] + "</span>" + c.label + "：" + c.value + "</a>"
                );
            })
            .join("");
    }
    renderContacts();

    function setOpen(open) {
        wrapEl.classList.toggle("open", open);
        if (!open) contactPop.classList.remove("open");
        layers.forEach(function (l) {
            l.classList.toggle("off", !open);
        });
    }

    fabBtn.addEventListener("click", function () {
        setOpen(!wrapEl.classList.contains("open"));
    });

    function applyTheme(t) {
        document.documentElement.setAttribute("data-theme", t);
    }

    try {
        if (sessionStorage.getItem(THEME_KEY) === "light") applyTheme("light");
    } catch (e) {}

    var themeBtn = wrap.querySelector(".fab-theme-btn");

    themeBtn.addEventListener("click", function () {
        var next =
            document.documentElement.getAttribute("data-theme") === "light"
                ? "dark"
                : "light";
        applyTheme(next);
        try {
            sessionStorage.setItem(THEME_KEY, next);
        } catch (e) {}
    });

    var popTimer = null;

    function cancelPopClose() {
        clearTimeout(popTimer);
        popTimer = null;
    }

    function schedulePopClose() {
        if (popTimer) clearTimeout(popTimer);
        popTimer = setTimeout(function () {
            contactPop.classList.remove("open");
        }, 3000);
    }

    var contactBtn = wrap.querySelector('.fab-mini[data-act="contact"]');

    contactBtn.addEventListener("mouseenter", cancelPopClose);
    contactBtn.addEventListener("mouseleave", function (e) {
        if (!contactPop.contains(e.relatedTarget)) schedulePopClose();
    });
    contactPop.addEventListener("mouseenter", cancelPopClose);
    contactPop.addEventListener("mouseleave", function (e) {
        if (!contactBtn.contains(e.relatedTarget)) schedulePopClose();
    });

    document.addEventListener("click", function (e) {
        if (!wrapEl.classList.contains("open")) return;
        if (wrapEl.contains(e.target)) return;
        setOpen(false);
    });

    document.addEventListener("keydown", function (e) {
        if (e.code === "Escape") {
            setOpen(false);
            contactPop.classList.remove("open");
        }
    });

    var aboutBtn = wrap.querySelector('.fab-menu-item[data-act="about"]');
    var msgBtn = wrap.querySelector('.fab-menu-item[data-act="msg"]');
    var aboutPanel = wrap.querySelector("#fab-about-panel");
    var msgPanel = wrap.querySelector("#fab-msg-panel");

    function toggleCollapse(panel, btn) {
        var open = panel.classList.contains("open");
        if (open) {
            panel.classList.remove("open");
            panel.style.maxHeight = "0px";
            btn.classList.remove("active");
        } else {
            panel.classList.add("open");
            panel.style.maxHeight = panel.scrollHeight + "px";
            btn.classList.add("active");
        }
    }

    aboutBtn.addEventListener("click", function () {
        toggleCollapse(aboutPanel, aboutBtn);
    });

    msgBtn.addEventListener("click", function () {
        toggleCollapse(msgPanel, msgBtn);
    });

    // 主页：展开子导航（三维设计 / 科研绘图）
    var homeBtn = wrap.querySelector('.fab-menu-item[data-act="home"]');
    var homePanel = wrap.querySelector("#fab-home-panel");

    homeBtn.addEventListener("click", function () {
        toggleCollapse(homePanel, homeBtn);
    });

    // 「还在装修中」小弹框
    var toast = document.createElement("div");
    toast.className = "fab-toast";
    document.body.appendChild(toast);
    var toastTimer = null;

    function showToast(msg, anchor) {
        toast.textContent = msg;
        toast.classList.add("show");
        if (anchor) {
            var r = anchor.getBoundingClientRect();
            toast.style.top = (r.top + r.height / 2) + "px";
            toast.style.left = (r.right + 14) + "px";
            var w = toast.offsetWidth;
            if (r.right + 14 + w > window.innerWidth - 12) {
                toast.style.left = Math.max(12, window.innerWidth - w - 12) + "px";
            }
        }
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            toast.classList.remove("show");
        }, 2200);
    }

    homePanel.addEventListener("click", function (e) {
        var sub = e.target.closest(".fab-sub-item");
        if (!sub) return;
        if (sub.getAttribute("data-sub") === "science") {
            showToast("还在装修中", sub);
        }
    });

    var MSG_KEY = "ajan_msgs";
    var msgInput = wrap.querySelector("#fab-msg-input");
    var msgNick = wrap.querySelector("#fab-msg-nick");
    var msgSend = wrap.querySelector("#fab-msg-send");
    var msgList = wrap.querySelector("#fab-msg-list");

    function loadMsgs() {
        try {
            var arr = JSON.parse(localStorage.getItem(MSG_KEY) || "[]");
            return Array.isArray(arr) ? arr : [];
        } catch (e) {
            return [];
        }
    }

    function saveMsgs(list) {
        try {
            localStorage.setItem(MSG_KEY, JSON.stringify(list));
        } catch (e) {}
    }

    function escapeHtml(s) {
        return String(s).replace(/[&<>"']/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
        });
    }

    function pad2(n) {
        return n < 10 ? "0" + n : String(n);
    }

    function nowStr() {
        var d = new Date();
        return (
            d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate()) +
            " " + pad2(d.getHours()) + ":" + pad2(d.getMinutes())
        );
    }

    function renderMsgs() {
        var list = loadMsgs();
        if (!list.length) {
            msgList.innerHTML = '<li class="fab-msg-item fab-msg-empty">还没有留言，来抢沙发～</li>';
            return;
        }
        msgList.innerHTML = list
            .map(function (m) {
                return (
                    '<li class="fab-msg-item">' +
                    '<div class="fab-msg-nickname">' +
                    escapeHtml(m.nick ? m.nick : "匿名") +
                    "</div>" +
                    '<div class="fab-msg-text">' +
                    escapeHtml(m.text) +
                    '</div><span class="fab-msg-time">' +
                    escapeHtml(m.time) +
                    "</span></li>"
                );
            })
            .join("");
    }

    msgSend.addEventListener("click", function () {
        var v = msgInput.value.trim();
        if (!v) return;
        var nick = msgNick.value.trim();
        var list = loadMsgs();
        list.unshift({ nick: nick, text: v, time: nowStr() });
        saveMsgs(list);
        msgInput.value = "";
        renderMsgs();
        if (msgPanel.classList.contains("open")) {
            msgPanel.style.maxHeight = msgPanel.scrollHeight + "px";
        }
    });

    renderMsgs();

    // 方向性滑入遮罩（resonance 风格）：按鼠标进入方向滑入，按离开方向收回
    var fabMenu = wrap.querySelector(".fab-menu");
    var lastMoveY = 0;
    document.addEventListener("mousemove", function (e) {
        lastMoveY = e.clientY;
    });

    fabMenu.querySelectorAll(".fab-menu-item").forEach(function (item) {
        var tile = item.querySelector(".fab-menu-tile");
        if (!tile) return;

        item.addEventListener("mouseenter", function (e) {
            var fromTop = e.clientY <= lastMoveY;
            tile.style.transition = "none";
            tile.style.transform = "translateY(" + (fromTop ? "-100%" : "100%") + ")";
            void tile.offsetWidth;
            tile.style.transition = "";
            tile.style.transform = "translateY(0)";
        });

        item.addEventListener("mouseleave", function (e) {
            var fromTop = e.clientY <= lastMoveY;
            tile.style.transform = "translateY(" + (fromTop ? "-100%" : "100%") + ")";
        });
    });

    renderMsgs();

    wrap.addEventListener("click", function (e) {
        if (e.target.closest("#fab-contact-pop")) return;
        var btn = e.target.closest(".fab-mini");
        if (!btn) return;
        var act = btn.getAttribute("data-act");
        if (act === "like") {
            var n = likeCount() + 1;
            saveLikes(n);
            var cnt = btn.querySelector(".fab-like-count");
            if (cnt) cnt.textContent = n;
            btn.style.animation = "none";
            btn.offsetHeight;
            btn.style.animation = "fab-pop 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";
        } else if (act === "contact") {
            var isOpen = contactPop.classList.contains("open");
            contactPop.classList.toggle("open", !isOpen);
        }
    });
})();