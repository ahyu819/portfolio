import * as THREE from "three";

(function () {
    var container = document.getElementById("scene3d");
    if (!container) return;

    var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0c0e12, 14, 26);

    var camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 60);
    camera.position.set(0, 0.6, 9);
    camera.lookAt(0, 0, 0);

    var group = new THREE.Group();

    function solid(geo, color, metal, rough, y) {
        var m = new THREE.Mesh(
            geo,
            new THREE.MeshStandardMaterial({ color: color, metalness: metal, roughness: rough })
        );
        m.position.y = y;
        m.castShadow = true;
        group.add(m);
        return m;
    }

    solid(new THREE.SphereGeometry(0.75, 64, 64), 0xeef1f6, 0.85, 0.2, 0);
    var torus = solid(new THREE.TorusGeometry(1.15, 0.09, 24, 96), 0x9aa3b2, 0.9, 0.25, 0);
    torus.rotation.x = Math.PI / 2.6;

    var torus2 = solid(new THREE.TorusGeometry(1.55, 0.05, 24, 96), 0x6b7280, 0.85, 0.3, 0);
    torus2.rotation.x = Math.PI / 1.8;
    torus2.rotation.y = 0.5;

    scene.add(group);

    scene.add(new THREE.AmbientLight(0xffffff, 0.16));

    var key = new THREE.SpotLight(0xffffff, 2.4, 32, 0.52, 0.55, 1.6);
    key.position.set(0, 8, 2.5);
    key.target.position.set(0, 0, 0);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.bias = -0.002;
    scene.add(key);
    scene.add(key.target);

    var rimLight = new THREE.DirectionalLight(0xffffff, 0.45);
    rimLight.position.set(-4, 2.5, -3);
    scene.add(rimLight);

    function makeFieldLayer(count, size, opacity, speed) {
        var positions = new Float32Array(count * 3);
        for (var i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 22;
            positions[i * 3 + 1] = Math.random() * 6.5 - 1.2;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
        }
        var geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
        var mat = new THREE.PointsMaterial({
            color: color,
            size: size,
            transparent: true,
            opacity: opacity,
            depthWrite: false,
            blending: THREE.AdditiveBlending
        });
        var points = new THREE.Points(geo, mat);
        var base = new Float32Array(count);
        for (var j = 0; j < count; j++) {
            base[j] = positions[j * 3 + 1];
        }
        scene.add(points);
        return {
            update: function (t) {
                var attr = geo.attributes.position;
                for (var i = 0; i < count; i++) {
                    var y = base[i] - ((t * speed + i * 0.37) % 5.6);
                    attr.array[i * 3 + 1] = y;
                }
                attr.needsUpdate = true;
            }
        };
    }

    var dust = makeFieldLayer(420, 0xffffff, 0.05, 0.55, 0.06);
    var stars = makeFieldLayer(120, 0xffffff, 0.08, 0.95, 0.16);

    function makeMountain(z, color, height) {
        var shape = new THREE.Shape();
        shape.moveTo(-26, 0);
        var xs = [-20, -15, -10, -5, 0, 5, 10, 15, 20, 26];
        var peaks = [0.45, 1.0, 0.3, 1.2, 0.5, 1.0, 0.25, 0.9, 0.4, 0];
        for (var i = 0; i < xs.length; i++) {
            shape.lineTo(xs[i], peaks[i] * height);
        }
        shape.lineTo(26, 0);
        shape.closePath();

        var geo = new THREE.ShapeGeometry(shape);
        geo.rotateX(-Math.PI / 2);
        var mesh = new THREE.Mesh(
            geo,
            new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0, depthWrite: false })
        );
        mesh.position.set(0, 0, -z);
        scene.add(mesh);
        return mesh;
    }

    var mountainsFar = makeMountain(3.2, 0x0d1015, 2.6);
    var mountainsNear = makeMountain(2.4, 0x08090c, 1.9);

    var progress = 0;

    function onScroll() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        progress = max > 0 ? window.scrollY / max : 0;
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

        group.rotation.y = t * 0.25;
        group.rotation.z = Math.sin(t * 0.35) * 0.05;
        group.position.y = 0.15 + Math.sin(t * 0.8) * 0.08 - progress * 0.85;

        camera.position.y = 0.6 - progress * 0.9;
        camera.position.x = Math.sin(t * 0.2) * 0.15;
        camera.lookAt(0, 0.15 - progress * 0.85, 0);

        dust.update(t);
        stars.update(t);

        var mountainIn = Math.min(1, Math.max(0, (progress - 0.78) / 0.22));
        mountainsFar.material.opacity = mountainIn * 0.9;
        mountainsFar.position.y = (mountainIn - 1) * 1.6;
        mountainsNear.material.opacity = mountainIn;
        mountainsNear.position.y = (mountainIn - 1) * 2.2;

        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
})();