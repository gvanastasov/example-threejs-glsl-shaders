import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { GUI } from 'dat.gui';

import Shaders from './shaders';

function app() {
    this._el = document.getElementById('app');
    this._gui = new GUI();
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
    this._light = null;
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

        let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
        light.position.set(50, 100, 10);
        light.target.position.set(-1, -1, 0);
        light.target.updateMatrixWorld();
        light.castShadow = true;
        light.shadow.bias = -0.001;
        light.shadow.mapSize.width = 2048;
        light.shadow.mapSize.height = 2048;
        light.shadow.camera.near = 0.1;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.near = 0.5;
        light.shadow.camera.far = 500.0;
        light.shadow.camera.left = 100;
        light.shadow.camera.right = -100;
        light.shadow.camera.top = 100;
        light.shadow.camera.bottom = -100;
        light.add(light.target);
        this._scene.add(light);
        this._light = light;

        const directionalLightHelper = new THREE.DirectionalLightHelper(light, 3);
        // directionalLightHelper.visible = false;
        this._scene.add(directionalLightHelper);
        directionalLightHelper.update(); 

        const lightColorControl = function (l) {
            this.color = l.color.getHex();
        }
        const lcc = new lightColorControl(light);
        const lightFolder = this._gui.addFolder('Directional Light');
        lightFolder.add(light, 'intensity', 0, 10).name('Intensity');
        lightFolder.addColor(lcc, 'color').name('Color').onChange(function(color) {
            light.color = new THREE.Color(color);
        });
        const positionFolder = lightFolder.addFolder('Position');
        positionFolder.add(light.position, 'x').name('X');
        positionFolder.add(light.position, 'y').name('Y');
        positionFolder.add(light.position, 'z').name('Z');
        positionFolder.domElement.addEventListener('click', () => {
            directionalLightHelper.visible = !positionFolder.closed;
        })

        const direction = new THREE.Vector3();
        direction.subVectors(light.target.position, light.position).normalize();

        // Calculate Euler angles from the direction vector
        const euler = new THREE.Euler();
        euler.setFromVector3(direction);

        // Convert Euler angles from radians to degrees
        const initialRotationX = THREE.MathUtils.radToDeg(euler.x);
        const initialRotationY = THREE.MathUtils.radToDeg(euler.y);
        const initialRotationZ = THREE.MathUtils.radToDeg(euler.z);

        const rotationFolder = lightFolder.addFolder('Rotation');
        rotationFolder.add(light.rotation, 'x', 0, 360).name('X').setValue(initialRotationX).onChange(function(value) {
            light.rotation.x = THREE.MathUtils.degToRad(value);
        });
        rotationFolder.add(light.rotation, 'y', 0, 360).name('Y').setValue(initialRotationY).onChange(function(value) {
            light.rotation.y = THREE.MathUtils.degToRad(value);
        });
        rotationFolder.add(light.rotation, 'z', 0, 360).name('Z').setValue(initialRotationZ).onChange(function(value) {
            light.rotation.z = THREE.MathUtils.degToRad(value);
        });
        lightFolder.open();

        // let ambientLight = new THREE.AmbientLight(0x101010);
        // this._scene.add(ambientLight);

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
                uniforms: {
                    ambientLightColor: { value: null },
                    lightProbe: { value: null },
                    directionalLights: { value: null },
                    directionalLightShadows: { value: null },
                    spotLights: { value: null },
                    spotLightShadows: { value: null },
                    rectAreaLights: { value: null },
                    ltc_1: { value: null },
                    ltc_2: { value: null },
                    pointLights: { value: null },
                    pointLightShadows: { value: null },
                    hemisphereLights: { value: null },

                    directionalShadowMap: { value: null },
                    directionalShadowMatrix: { value: null },
                    spotShadowMap: { value: null },
                    spotLightMatrix: { value: null },
                    spotLightMap: { value: null },
                    pointShadowMap: { value: null },
                    pointShadowMatrix: { value: null },
                    ...uniforms
                },
            });

            customMaterial.name = 'Custom Material';
            customMaterial.lights = true;

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

        console.log(JSON.stringify(this._light.target.position));
    }
}

new app().start();