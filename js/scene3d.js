import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

(function () {
    var container = document.getElementById("scene3d");
    if (!container) return;
    /* 手机端不初始化 3D 场景：省下 68MB 模型下载与整条 WebGL 渲染管线，hero 仅保留文字与 CSS 背景 */
    if (window.innerWidth <= 700) return;

    /* ================== 模型配置：换模型只改这里 ================== */
    // url: models/ 文件夹里的 .glb 文件（列表顺序 = 点击切换的循环顺序）
    // fit   : 自动缩放到的最大尺寸（世界单位），scale 是再乘的系数，y 上下微调
    // spin  : 自转速度倍率
    // rotX/rotY/rotZ : 朝向微调（单位：度），绕模型自身中心转
    // envIntensity : 环境光强度（1 = 原始亮度，越小越暗）
    var DEFAULT_ENV = 0.25;
    var MODELS = [
        { key: "lighter", url: "models/lighter.glb", fit: 2.4, scale: 1, y: 0, spin: 1, rotX: 0, rotY: 0, rotZ: 0, envIntensity: DEFAULT_ENV },
        { key: "aodike", url: "models/aodike-opt.glb", fit: 2.4, scale: 1, y: 0, spin: 1, rotX: 0, rotY: 0, rotZ: 0, envIntensity: 0.5 }
    ];
    /* ============================================================= */

    /* ================== 灯光配置 ================== */
    // 三盏灯都照向原点（模型所在处），pos = 灯的位置：
    // key 正面主光（镜头方向稍偏上）/ top 顶光（正上方略偏后）/ rim 轮廓光（模型背后侧方，勾边缘）
    var LIGHTS = {
        ambient: 0.1,
        key: { color: 0xffffff, intensity: 1.2, pos: [0, 2.5, 6] },
        top: { color: 0xffffff, intensity: 0.8, pos: [0, 8, 1] },
        rim: { color: 0xeaf2ff, intensity: 1.2, pos: [-3, 2.5, -5] }
    };
    /* ============================================== */

    var canHover = window.matchMedia("(hover: hover)").matches;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0c0e12, 14, 26);

    // 环境贴图：金属 PBR 材质必须靠它反射才不会发黑
    var pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(renderer), 0.04).texture;

    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60);
    camera.position.set(0, 0.6, 9);
    camera.lookAt(0, 0, 0);

    // 灯光（配置见顶部 LIGHTS：正面主光 + 顶光 + 轮廓光 + 微量环境光）
    scene.add(new THREE.AmbientLight(0xffffff, LIGHTS.ambient));
    [["key", LIGHTS.key], ["top", LIGHTS.top], ["rim", LIGHTS.rim]].forEach(function (pair) {
        var cfg = pair[1];
        var light = new THREE.DirectionalLight(cfg.color, cfg.intensity);
        light.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
        scene.add(light);
    });

    // 舞台：整体自转 + 悬浮 + 滚动位移
    var stage = new THREE.Group();
    scene.add(stage);

    /* ---------------- 模型注册（随机起始 + 文字动效后弹出） ---------------- */
    var entries = [];
    var current = null;
    var switching = false;

    // 每次进入页面随机决定起始模型；切换顺序仍按配置从上到下循环
    var startKey = MODELS.length ? MODELS[Math.floor(Math.random() * MODELS.length)].key : null;

    // 首屏文字动效总时长（与 css hero-text-in 的节奏对齐），结束后模型才弹出；
    // 模型若还没加载完，就绪后立刻弹出
    var INTRO_MS = 3000;
    var introFinished = false;
    setTimeout(function () {
        introFinished = true;
        maybeShowStart();
    }, INTRO_MS);

    function registerEntry(def, group) {
        var e = { def: def, group: group, ready: true };
        group.visible = false;
        stage.add(group);
        entries.push(e);
        maybeShowStart();
        return e;
    }

    function setCurrent(e) {
        current = e;
        if (e) e.group.visible = true;
    }

    function maybeShowStart() {
        if (current || !introFinished || !entries.length) return;
        var e = null;
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].def.key === startKey) { e = entries[i]; break; }
        }
        if (!e) e = entries[0]; // 起始模型加载失败时退而求其次
        setCurrent(e);
        var base = e.group.scale.x || 1;
        e.group.scale.setScalar(0.001);
        addTween(950, easeOutCubic, function (p) {
            e.group.scale.setScalar(Math.max(0.001, base * p));
        }, function () {
            e.group.scale.setScalar(base);
        });
    }

    for (var i = 0; i < MODELS.length; i++) {
        if (MODELS[i].url) loadGLB(MODELS[i]);
    }

    function loadGLB(def) {
        var loader = new GLTFLoader();
        loader.load(
            def.url,
            function (gltf) {
                var model = gltf.scene;

                // 自动居中 + 自动缩放到 fit 尺寸
                var box = new THREE.Box3().setFromObject(model);
                var size = new THREE.Vector3();
                var center = new THREE.Vector3();
                box.getSize(size);
                box.getCenter(center);
                var maxDim = Math.max(size.x, size.y, size.z) || 1;
                var fitScale = (def.fit || 2.4) / maxDim;
                model.scale.setScalar(fitScale * (def.scale || 1));
                model.position.set(-center.x * model.scale.x, -center.y * model.scale.y + (def.y || 0), -center.z * model.scale.z);

                model.traverse(function (o) {
                    if (o.isMesh && o.material) {
                        o.castShadow = false;
                        o.receiveShadow = false;
                        if ("envMapIntensity" in o.material) {
                            o.material.envMapIntensity = def.envIntensity != null ? def.envIntensity : DEFAULT_ENV;
                        }
                    }
                });

                // 朝向微调：包一层，绕模型自身中心转，不影响居中
                var wrapper = new THREE.Group();
                wrapper.rotation.set(
                    (def.rotX || 0) * Math.PI / 180,
                    (def.rotY || 0) * Math.PI / 180,
                    (def.rotZ || 0) * Math.PI / 180
                );
                wrapper.add(model);

                registerEntry(def, wrapper);
            },
            undefined,
            function (err) {
                console.warn("模型加载失败：" + def.url, err);
            }
        );
    }

    /* ---------------- 点击切换（带缩放过渡） ---------------- */
    var easeOutBack = function (p) { var c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(p - 1, 3) + c1 * Math.pow(p - 1, 2); };
    var easeInQuad = function (p) { return p * p; };
    var easeOutCubic = function (p) { return 1 - Math.pow(1 - p, 3); };

    var tweens = [];
    function addTween(dur, ease, onUpdate, onDone) {
        tweens.push({ start: performance.now(), dur: dur, ease: ease, onUpdate: onUpdate, onDone: onDone });
    }
    function stepTweens(now) {
        for (var i = tweens.length - 1; i >= 0; i--) {
            var tw = tweens[i];
            var p = Math.min(1, (now - tw.start) / tw.dur);
            tw.onUpdate(tw.ease(p));
            if (p >= 1) {
                tweens.splice(i, 1);
                if (tw.onDone) tw.onDone();
            }
        }
    }

    function switchModel() {
        if (switching || entries.length < 2 || !current) return;
        switching = true;

        var from = current;
        var idx = entries.indexOf(from);
        var to = entries[(idx + 1) % entries.length];
        var fromBase = from.group.scale.x || 1;

        addTween(280, easeInQuad, function (p) {
            from.group.scale.setScalar(fromBase * (1 - p));
        }, function () {
            from.group.visible = false;
            from.group.scale.setScalar(fromBase);
            to.group.visible = true;
            current = to;
            var toBase = to.group.scale.x || 1;
            to.group.scale.setScalar(0.001);
            addTween(420, easeOutBack, function (p) {
                to.group.scale.setScalar(Math.max(0.001, toBase * p));
            }, function () {
                to.group.scale.setScalar(toBase);
                switching = false;
            });
        });
    }

    /* ---------------- 悬停检测 + 自定义光标 ---------------- */
    var raycaster = new THREE.Raycaster();
    var ndc = new THREE.Vector2(-2, -2);
    var hoverActive = false;
    var heroVisible = true;

    function updateHeroVisible() {
        heroVisible = window.scrollY < window.innerHeight * 0.55;
    }
    window.addEventListener("scroll", function () { updateHeroVisible(); }, { passive: true });
    updateHeroVisible();

    function overInteractive(target) {
        return !!(target && target.closest && target.closest("a, button, input, textarea, select, header, #lightbox, .fab-wrap, .fab-panel, .fab-prelayers, .fab-contact-pop, .model-hint"));
    }

    // 光标 DOM（向右箭头：立体挤出面 + 渐亮顶面 + 高光棱线，外层 CSS 发光）
    var cursorEl = null;
    if (canHover) {
        cursorEl = document.createElement("div");
        cursorEl.id = "model-cursor";
        cursorEl.innerHTML =
            '<svg width="44" height="44" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<defs>' +
            '<linearGradient id="mc-face" x1="12" y1="8" x2="30" y2="38" gradientUnits="userSpaceOnUse">' +
            '<stop offset="0" stop-color="#ffffff"/>' +
            '<stop offset="0.45" stop-color="#dcebff"/>' +
            '<stop offset="1" stop-color="#6f9dff"/>' +
            '</linearGradient>' +
            '<linearGradient id="mc-side" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0" stop-color="#2b4a80"/>' +
            '<stop offset="1" stop-color="#101c33"/>' +
            '</linearGradient>' +
            '</defs>' +
            '<path d="M12 8 L34 22 L12 36 Z" fill="url(#mc-side)" transform="translate(3.5,4)"/>' +
            '<path d="M12 8 L34 22 L12 36 Z" fill="url(#mc-face)" stroke="#f2f7ff" stroke-width="1.4" stroke-linejoin="round"/>' +
            '<path d="M13.2 9.4 L31 22" stroke="#ffffff" stroke-width="2.4" stroke-linecap="round" opacity="0.95"/>' +
            '</svg>';
        document.body.appendChild(cursorEl);
    }

    var targetX = -100, targetY = -100, curX = -100, curY = -100;

    function setHover(active, e) {
        if (!canHover) return;
        if (active === hoverActive) return;
        hoverActive = active;
        document.body.classList.toggle("model-hover", active);
        if (cursorEl) cursorEl.classList.toggle("on", active);
        if (active && e) {
            targetX = e.clientX;
            targetY = e.clientY;
            curX = targetX;
            curY = targetY;
        }
    }

    window.addEventListener("pointermove", function (e) {
        targetX = e.clientX;
        targetY = e.clientY;
        if (!canHover || !current || switching || overInteractive(e.target)) {
            setHover(false);
            return;
        }
        if (!heroVisible) { setHover(false); return; }
        ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
        ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        var hits = raycaster.intersectObject(current.group, true);
        setHover(hits.length > 0, e);
    }, { passive: true });

    // 点击（区分拖动/滚动）
    var downX = 0, downY = 0, downT = 0;
    window.addEventListener("pointerdown", function (e) {
        downX = e.clientX; downY = e.clientY; downT = performance.now();
    }, { passive: true });

    window.addEventListener("pointerup", function (e) {
        var dx = e.clientX - downX, dy = e.clientY - downY;
        var moved = Math.sqrt(dx * dx + dy * dy) > 6;
        var quick = performance.now() - downT < 400;
        if (moved || !quick) return;
        if (overInteractive(e.target)) return;
        if (!hoverActive || !current || switching) return;
        ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
        ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
        raycaster.setFromCamera(ndc, camera);
        var hits = raycaster.intersectObject(current.group, true);
        if (hits.length > 0) { switchModel(); resetAutoSwitch(); }
    }, { passive: true });

    // 手机端 next 按钮 = 同点击模型切换
    var nextBtn = document.querySelector(".model-next-btn");
    if (nextBtn) nextBtn.addEventListener("click", function () { switchModel(); resetAutoSwitch(); });

    /* ---------------- 定时轮换：每 10 秒自动切到下一个模型 ---------------- */
    var AUTO_SWITCH_MS = 10000;
    var autoTimer = null;
    function startAutoSwitch() {
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = setInterval(function () {
            if (heroVisible && !document.hidden) switchModel();
        }, AUTO_SWITCH_MS);
    }
    startAutoSwitch();

    /* ---------------- 滚动 / 缩放 / 渲染 ---------------- */
    var progress = 0;
    function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress = max > 0 ? window.scrollY / max : 0;
        updateHeroVisible();
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    window.addEventListener("resize", function () {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate(now) {
        requestAnimationFrame(animate);
        var t = now * 0.001;
        stepTweens(now);

        var spin = current && current.def.spin ? current.def.spin : 1;
        stage.rotation.y = t * 0.25 * spin;
        stage.rotation.z = Math.sin(t * 0.35) * 0.05;
        stage.position.y = 0.15 + Math.sin(t * 0.8) * 0.08 - progress * 0.85;

        camera.position.y = 0.6 - progress * 0.9;
        camera.position.x = Math.sin(t * 0.2) * 0.15;
        camera.lookAt(0, 0.15 - progress * 0.85, 0);

        // 光标跟随（轻微延迟更顺滑）
        if (cursorEl && hoverActive) {
            curX += (targetX - curX) * 0.4;
            curY += (targetY - curY) * 0.4;
            cursorEl.style.transform = "translate(" + (curX - 11) + "px," + (curY - 22) + "px)";
        }

        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
})();
