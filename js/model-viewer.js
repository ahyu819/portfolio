import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

(function () {
    function createModelViewer(container, url, opts) {
        opts = opts || {};
        var onProgress = opts.onProgress || function () {};
        var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1.0;
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.domElement.style.width = "100%";
        renderer.domElement.style.height = "100%";
        renderer.domElement.style.display = "block";
        container.appendChild(renderer.domElement);

        var scene = new THREE.Scene();
        var camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
        camera.position.set(0, 0, 6);

        var pmrem = new THREE.PMREMGenerator(renderer);
        var envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
        scene.environment = envTex;

        var ambient = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambient);
        var key = new THREE.DirectionalLight(0xffffff, 1.4);
        key.position.set(2, 3, 4);
        scene.add(key);
        var rim = new THREE.DirectionalLight(0xeaf2ff, 1.1);
        rim.position.set(-3, 2, -5);
        scene.add(rim);

        var root = new THREE.Group();
        scene.add(root);
        var disposed = false;
        var paused = false;

        new GLTFLoader().load(
            url,
            function (gltf) {
                if (disposed) return;
                var model = gltf.scene;
                var env = opts.envIntensity != null ? opts.envIntensity : 0.5;
                model.traverse(function (o) {
                    if (o.isMesh && o.material && "envMapIntensity" in o.material) {
                        o.material.envMapIntensity = env;
                    }
                });
                var box = new THREE.Box3().setFromObject(model);
                var size = box.getSize(new THREE.Vector3());
                var center = box.getCenter(new THREE.Vector3());
                var maxDim = Math.max(size.x, size.y, size.z) || 1;
                model.scale.setScalar(3.2 / maxDim);
                model.position.sub(center.multiplyScalar(3.2 / maxDim));
                root.add(model);
                onProgress(1);
            },
            function (evt) {
                if (evt.total) onProgress(evt.loaded / evt.total);
            },
            function () {
                onProgress(-1);
            }
        );

        var rotX = 0, rotY = 0, velX = 0, velY = 0;
        var dragging = false, lastX = 0, lastY = 0;
        var el = renderer.domElement;
        el.style.touchAction = "none";
        el.style.cursor = "grab";

        function clampX() {
            var L = 0.9;
            if (rotX > L) rotX = L;
            if (rotX < -L) rotX = -L;
        }
        el.addEventListener("pointerdown", function (e) {
            dragging = true;
            lastX = e.clientX;
            lastY = e.clientY;
            el.setPointerCapture(e.pointerId);
            el.style.cursor = "grabbing";
        });
        el.addEventListener("pointermove", function (e) {
            if (!dragging) return;
            var dx = e.clientX - lastX, dy = e.clientY - lastY;
            lastX = e.clientX;
            lastY = e.clientY;
            rotY += dx * 0.006;
            rotX += dy * 0.004;
            velY = dx * 0.006;
            velX = dy * 0.004;
            clampX();
        });
        function endDrag() {
            dragging = false;
            el.style.cursor = "grab";
        }
        el.addEventListener("pointerup", endDrag);
        el.addEventListener("pointercancel", endDrag);
        el.addEventListener("dblclick", function () {
            rotX = 0; rotY = 0; velX = 0; velY = 0;
        });

        function resize() {
            var cw = container.clientWidth || 1;
            var ch = container.clientHeight || 1;
            renderer.setSize(cw, ch, false);
            camera.aspect = cw / ch;
            camera.updateProjectionMatrix();
        }
        var ro = new ResizeObserver(resize);
        ro.observe(container);
        resize();

        var raf = 0;
        var last = performance.now();
        function loop(now) {
            if (disposed) return;
            raf = requestAnimationFrame(loop);
            if (paused) return;
            var dt = Math.min((now - last) / 1000, 0.05);
            last = now;
            if (!dragging) {
                rotY += velY;
                rotX += velX;
                clampX();
                velY *= Math.pow(0.05, dt);
                velX *= Math.pow(0.05, dt);
                if (Math.abs(velY) < 0.0004) velY = 0;
                if (Math.abs(velX) < 0.0004) velX = 0;
                if (velY === 0 && velX === 0 && !opts.noAutoSpin) rotY += dt * 0.25;
            }
            root.rotation.x = rotX;
            root.rotation.y = rotY;
            renderer.render(scene, camera);
        }
        raf = requestAnimationFrame(loop);

        function dispose() {
            if (disposed) return;
            disposed = true;
            cancelAnimationFrame(raf);
            ro.disconnect();
            scene.traverse(function (o) {
                if (o.geometry) o.geometry.dispose();
                if (o.material) {
                    var ms = Array.isArray(o.material) ? o.material : [o.material];
                    ms.forEach(function (m) {
                        for (var k in m) {
                            var v = m[k];
                            if (v && v.isTexture) v.dispose();
                        }
                        m.dispose();
                    });
                }
            });
            envTex.dispose();
            pmrem.dispose();
            renderer.dispose();
            if (el.parentNode) el.parentNode.removeChild(el);
        }

        return {
            dispose: dispose,
            setPaused: function (p) {
                paused = p;
                if (!p) last = performance.now();
            },
            canvas: el
        };
    }

    window.ModelViewer = { create: createModelViewer };
})();
