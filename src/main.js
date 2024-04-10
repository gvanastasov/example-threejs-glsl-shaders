import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

function app() {
    this._el = document.getElementById('app');
    this._composer = null;
    this._controls = null;
    this._scene = null;
    this._camera = null;
    this._renderer = null;

    this.start = function() {
        this.configure();
        this.render();
    }

    this.configure = function() {
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this._camera = new THREE.PerspectiveCamera(60, 1920 / 1080, 1.0, 1000.0);
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._camera.position.set(50, 50, -50);
        this._camera.lookAt(0, 0, 0);

        this._scene = new THREE.Scene();

        let dirLight = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        dirLight.position.set(50, 100, 10);
        dirLight.target.position.set(0, 0, 0);
        dirLight.castShadow = true;
        dirLight.shadow.bias = -0.001;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;
        dirLight.shadow.camera.near = 0.1;
        dirLight.shadow.camera.far = 500.0;
        dirLight.shadow.camera.near = 0.5;
        dirLight.shadow.camera.far = 500.0;
        dirLight.shadow.camera.left = 100;
        dirLight.shadow.camera.right = -100;
        dirLight.shadow.camera.top = 100;
        dirLight.shadow.camera.bottom = -100;
        this._scene.add(dirLight);

        let ambientLight = new THREE.AmbientLight(0x101010);
        this._scene.add(ambientLight);

        const plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100, 10, 10),
            new THREE.MeshStandardMaterial({
                color: 0xFFFFFF,
            }
        ));
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = -Math.PI / 2;
        this._scene.add(plane);

        const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
        const geometry = new THREE.SphereGeometry(8, 32, 32);
        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(0, 10, 0);
        this._scene.add(mesh);

        this._controls = new OrbitControls(this._camera, this._renderer.domElement);
        this._controls.target.set(0, 0, 0);

        this._composer = new EffectComposer(this._renderer);
        this._composer.addPass(new RenderPass(this._scene, this._camera));

        var menu = document.createElement('div');
        menu.id = 'menu';

        this._el.appendChild(menu);
        this._el.appendChild(this._renderer.domElement);

        window.addEventListener('resize', () => {
            this._handleWindowResize();
        }, false);
    }

    this._handleWindowResize = () => {
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this.render = () => {
        requestAnimationFrame(this.render);
        this._controls.update();
        this._composer.render();
    }
}

new app().start();