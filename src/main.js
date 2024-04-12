import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import Shaders from './shaders';

function app() {
    this._el = document.getElementById('app');
    this._composer = null;
    this._controls = null;
    this._scene = null;
    this._camera = null;
    this._renderer = null;

    this._sphere = null;

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
        this._sphere = mesh;

        this._controls = new OrbitControls(this._camera, this._renderer.domElement);
        this._controls.target.set(0, 0, 0);

        this._composer = new EffectComposer(this._renderer);
        this._composer.addPass(new RenderPass(this._scene, this._camera));

        var menu = document.createElement('div');
        menu.id = 'menu';
        menu.appendChild(this.createMenu());

        var properties = document.createElement('div');
        properties.id = 'properties';

        this._el.appendChild(menu);
        this._el.appendChild(properties);
        this._el.appendChild(this._renderer.domElement);

        window.addEventListener('resize', () => {
            this._handleWindowResize();
        }, false);
    }

    this.createMenu = () => { 
        const menu = document.createElement('ul');
        
        var groups = Shaders.reduce((arr, shader) => {
            const existing = arr.find(group => group.name === shader.group);
            if (!existing) {
                arr.push({ name: shader.group, shaders: [ shader ] });
            }
            else {
                existing.shaders.push(shader);
            }
            return arr;
        }, []);

        for (let i = 0; i < groups.length; i++) {
            const group = groups[i];
            const groupElement = document.createElement('li');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = group.name;

            const chevron = document.createElement('span');
            chevron.classList.add('chevron');

            const label = document.createElement('label');
            label.htmlFor = group.name;
            label.appendChild(chevron);
            label.appendChild(document.createTextNode(group.name));

            const groupShadersElement = document.createElement('ul');

            for (let j = 0; j < group.shaders.length; j++) {
                const shader = group.shaders[j];
                const shaderElement = document.createElement('li');

                const a = document.createElement('a');
                a.href = '#' + shader.name;
                a.innerHTML = shader.name;
                shaderElement.onclick = () => {
                    this.updateShader(shader);

                    const selectedItems = document.querySelectorAll('#menu .selected');
                    selectedItems.forEach(item => item.classList.remove('selected'));
                    shaderElement.classList.add('selected');
                }

                shaderElement.appendChild(a);
                groupShadersElement.appendChild(shaderElement);
            }
            
            groupElement.appendChild(input);
            groupElement.appendChild(label);
            groupElement.appendChild(groupShadersElement);

            menu.appendChild(groupElement);
        }

        this.createPropertyControls = (shader) => {
            const properties = document.getElementById('properties');
            properties.innerHTML = '';

            const heading = document.createElement('h4');
            heading.innerHTML = `Shader: ${shader.name} (${shader.group})`;
            properties.appendChild(heading);

            for (let i = 0; i < shader.props.length; i++) {
                const prop = shader.props[i];

                if (prop.editable === false) continue;

                // todo: refactor this to support more types
                if (prop.type === 'Vector2') {
                    const propElement = document.createElement('div');
                    propElement.classList.add('property');

                    const label = document.createElement('label');
                    label.htmlFor = prop.name;
                    label.innerHTML = prop.label;

                    const inputX = document.createElement('input');
                    inputX.type = 'number';
                    inputX.id = prop.name + '-x';
                    inputX.value = prop.value.x;
                    inputX.step = prop.step;
                    inputX.oninput = (e) => {
                        prop.value.x = parseFloat(e.target.value);
                        const value = new THREE.Vector2(prop.value.x, inputY.value);

                        this._sphere.material.uniforms[prop.name].value = value;
                    }

                    const inputY = document.createElement('input');
                    inputY.type = 'number';
                    inputY.id = prop.name + '-y';
                    inputY.value = prop.value.y;
                    inputY.step = prop.step;
                    inputY.oninput = (e) => {
                        prop.value.y = parseFloat(e.target.value);

                        const value = new THREE.Vector2(inputX.value, prop.value.y);

                        this._sphere.material.uniforms[prop.name].value = value;
                    }

                    propElement.appendChild(label);
                    propElement.appendChild(inputX);
                    propElement.appendChild(inputY);
                    properties.appendChild(propElement);
                    continue;
                } else {
                    const propElement = document.createElement('div');
                    propElement.classList.add('property');
    
                    const label = document.createElement('label');
                    label.htmlFor = prop.name;
                    label.innerHTML = prop.label;
    
                    const input = document.createElement('input');
                    input.type = prop.type;
                    input.id = prop.name;
                    input.value = prop.value;
                    input.oninput = (e) => {
                        prop.value = e.target.value;
                        
                        this._sphere.material.uniforms[prop.name].value = 
                            !!prop.valueParser
                            ? prop.valueParser(prop.value)
                            : prop.value;
                    }
    
                    propElement.appendChild(label);
                    propElement.appendChild(input);
                    properties.appendChild(propElement);
                }

            }
        }

        this.updateShader = (shader) => {
            const uniforms = shader.props.reduce((obj, prop) => {
                obj[prop.name] = { value: prop.valueParser ? prop.valueParser(prop.value) : prop.value };
                return obj;
            }, {});

            const customMaterial = new THREE.RawShaderMaterial({
                glslVersion: THREE.GLSL3,
                vertexShader: shader.vert,
                fragmentShader: shader.frag,
                uniforms,
            });

            customMaterial.onBeforeCompile = function(shader) {
                // NOTE: This is a hack to remove the #version 300 es from the shaders
                // and make the linter happy with the syntax.
                shader.vertexShader = shader.vertexShader.replace('#version 300 es\n', '');
                shader.fragmentShader = shader.fragmentShader.replace('#version 300 es\n', '');
            }
            
            this._sphere.material = customMaterial;

            this.createPropertyControls(shader);
        }

        return menu;
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