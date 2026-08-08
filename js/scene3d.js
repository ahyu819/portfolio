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

    var stageY = -1.2;

    var disc = new THREE.Mesh(
        new THREE.CylinderGeometry(3.4, 3.4, 0.18, 64),
        new THREE.MeshStandardMaterial({ color: 0x15181e, metalness: 0.55, roughness: 0.35 })
    );
    disc.position.y = stageY;
    disc.receiveShadow = true;
    scene.add(disc);

    var discTop = new THREE.Mesh(
        new THREE.CircleGeometry(3.38, 64),
        new THREE.MeshStandardMaterial({ color: 0x1a1d24, metalness: 0.7, roughness: 0.3 })
    );
    discTop.rotation.x = -Math.PI / 2;
    discTop.position.y = stageY + 0.09;
    discTop.receiveShadow = true;
    scene.add(discTop);

    var deck = new THREE.Mesh(
        new THREE.TorusGeometry(3.4, 0.02, 12, 96),
        new THREE.MeshStandardMaterial({ color: 0x9aa3b2, metalness: 0.9, roughness: 0.25 })
    );
    deck.rotation.x = Math.PI / 2;
    deck.position.y = stageY + 0.1;
    scene.add(deck);

    var group = new THREE.Group();
    group.position.y = 0.15;

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

    var ball = solid(new THREE.SphereGeometry(0.75, 64, 64), 0xeef1f6, 0.85, 0.2, 0);
    var torus = solid(new THREE.TorusGeometry(1.15, 0.09, 24, 96), 0x9aa3b2, 0.9, 0.25, 0);
    torus.rotation.x = Math.PI / 2.6;

    var torus2 = solid(new THREE.TorusGeometry(1.55, 0.05, 24, 96), 0x6b7280, 0.85, 0.3, 0);
    torus2.rotation.x = Math.PI / 1.8;
    torus2.rotation.y = 0.5;

    var baseRing = solid(new THREE.TorusGeometry(1.7, 0.045, 20, 96), 0x7d8794, 0.85, 0.32, -1.05);
    baseRing.rotation.x = Math.PI / 2;

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

    var beams = [];

    function beam(x, z, radius, height, opacity) {
        var mesh = new THREE.Mesh(
            new THREE.ConeGeometry(radius, height, 28, 1, true),
            new THREE.MeshBasicMaterial({
                color: 0xffffff,
                transparent: true,
                opacity: opacity,
                blending: THREE.AdditiveBlending,
                depthWrite: false,
                side: THREE.DoubleSide
            })
        );
        mesh.rotation.x = Math.PI;
        mesh.position.set(x, stageY + height / 2, z);
        scene.add(mesh);
        beams.push({ mesh: mesh, base: opacity, phase: beams.length });
        return mesh;
    }

    beam(0, 1.8, 1.15, 6.4, 0.075);
    beam(0, -1.8, 0.85, 5.6, 0.05);
    beam(2.6, 0, 0.7, 5.2, 0.045);
    beam(-2.6, 0, 0.7, 5.2, 0.045);
    beam(1.7, 1.7, 0.6, 4.8, 0.04);
    beam(-1.7, -1.7, 0.6, 4.8, 0.04);
    beam(0, 0, 0.5, 6.8, 0.08);

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

        for (var i = 0; i < beams.length; i++) {
            var b = beams[i];
            b.mesh.material.opacity = b.base * (0.75 + 0.25 * Math.sin(t * 1.4 + b.phase * 1.7));
        }

        renderer.render(scene, camera);
    }
    requestAnimationFrame(animate);
})();