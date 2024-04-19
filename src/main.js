import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import * as dat from 'dat.gui';

import Shaders from './shaders';

const guiControls = {
    color: function (c) {
        let colorInternal = c;
        if (typeof(colorInternal) === 'string') {
            colorInternal = new THREE.Color(c);
        }
        this.color = colorInternal.getHex();
    }
}

const engineUniforms = {
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
};

function app() {
    this._el = document.getElementById('app');

    /**
     * @type {GUI}
     */
    this._gui = new dat.GUI();
    this._composer = null;
    this._renderer = null;
    this._controls = null;

    this._scene = {
        ref: null,
        objects: {
            sceneCamera: {
                ref: null,
                name: 'Scene Camera',
                create: function() {
                    const camera = new THREE.PerspectiveCamera(60, 1920 / 1080, 1.0, 1000.0);
                    camera.aspect = window.innerWidth / window.innerHeight;
                    camera.updateProjectionMatrix();
                    camera.position.set(50, 50, -50);
                    camera.lookAt(0, 0, 0);
                    return camera;
                }
            },
            directionLight: {
                ref: null,
                name: 'Main Light',
                create: function() {
                    let light = new THREE.DirectionalLight(0xFFFFFF, 1.0);
                    light.position.set(50, 100, 10);
                    light.target.position.set(0, 0, -1);
                    light.lookAt(0,0,0);
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

                    const helper = new THREE.DirectionalLightHelper(light, 3);
                    helper.visible = false;
                    helper.update();
                    light.add(helper);

                    return light;
                },
                /**
                 * @param {dat.GUI} parent
                 */
                gui: function(parent) {
                    const g = parent.addFolder('Directional Light');

                    g.add(this, 'intensity', 0, 10).name('Intensity');

                    const lcc = new guiControls.color(this.color);
                    g.addColor(lcc, 'color').name('Color').onChange((color) => {
                        this.color = new THREE.Color(color);
                    });

                    const positionFolder = g.addFolder('Position');
                    positionFolder.add(this.position, 'x').name('X');
                    positionFolder.add(this.position, 'y').name('Y');
                    positionFolder.add(this.position, 'z').name('Z');
                    positionFolder.domElement.addEventListener('click', () => {
                        helper.visible = !positionFolder.closed;
                    })
            
                    var rotationFolder = g.addFolder('Rotation');
                    var rotationControls = {
                        rotationX: THREE.MathUtils.radToDeg(this.rotation.x),
                        rotationY: THREE.MathUtils.radToDeg(this.rotation.y),
                        rotationZ: THREE.MathUtils.radToDeg(this.rotation.z),
                    };
                    const updateRotation = () => {
                        this.rotation.x = THREE.MathUtils.degToRad(rotationControls.rotationX);
                        this.rotation.y = THREE.MathUtils.degToRad(rotationControls.rotationY);
                        this.rotation.z = THREE.MathUtils.degToRad(rotationControls.rotationZ);
                    }
                    rotationFolder.add(rotationControls, 'rotationX').name('Rotation X').onChange(updateRotation);
                    rotationFolder.add(rotationControls, 'rotationY').name('Rotation Y').onChange(updateRotation);
                    rotationFolder.add(rotationControls, 'rotationZ').name('Rotation Z').onChange(updateRotation);
                    
                    g.open();
                }
            },
            ambientLight: {
                ref: null,
                name: 'Ambient Light',
                create: function() {
                    return new THREE.AmbientLight(0x101010);
                }
            },
            floor: {
                ref: null,
                name: 'Floor',
                create: function() {
                    const plane = new THREE.Mesh(
                        new THREE.PlaneGeometry(100, 100, 10, 10),
                        new THREE.MeshStandardMaterial({
                            color: 0xFFFFFF,
                        }
                    ));
                    plane.castShadow = false;
                    plane.receiveShadow = true;
                    plane.rotation.x = -Math.PI / 2;
                    return plane;
                }
            },
            target: {
                ref: null,
                name: 'Target',
                create: function() {
                    const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
                    const geometry = new THREE.SphereGeometry(8, 16, 16);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.position.set(0, 10, 0);
                    return mesh;
                },
                /**
                 * @param {dat.GUI} parent
                 */
                gui: function(parent) {
                    const g = parent.addFolder('Target');
                    g.add(this, 'visible').name('Visible');
                    const geometryType = function(type) {
                        this.type = type;
                    }
                    const gt = new geometryType('Sphere');
                    const options = {
                        Sphere: { type: 'Sphere', geometry: () => (new THREE.SphereGeometry(8, 16, 16)) },
                        Box: { type: 'Box', geometry: () => (new THREE.BoxGeometry(8, 8, 8)) },
                        Cylinder: { type: 'Cylinder', geometry: () => (new THREE.CylinderGeometry(8, 8, 16, 16)) },
                        Torus: { type: 'Torus', geometry: () => (new THREE.TorusGeometry(8, 3, 16, 100)) },
                        Knot: { type: 'Knot', geometry: () => (new THREE.TorusKnotGeometry(8, 3, 100, 16)) },
                    }
                    var geometry = g.add(gt, 'type', Object.keys(options)).name('Geometry').onChange((value) => {
                        gt.type = value;
                        this.geometry = options[value].geometry();
                        // todo: this should be conditional
                        this.geometry.computeTangents();
                    });
                    geometry.setValue('Sphere');
                    g.open();
                }
            },
            shadowCaster: {
                ref: null,
                name: 'Shadow Caster',
                create: function() {
                    const material = new THREE.MeshStandardMaterial({ color: 0xFF0000 });
                    const geometry = new THREE.SphereGeometry(3, 16, 16);
                    const mesh = new THREE.Mesh(geometry, material);
                    mesh.castShadow = true;
                    mesh.receiveShadow = true;
                    mesh.position.set(15, 35, 0);
                    return mesh;
                },
                /**
                 * @param {dat.GUI} parent
                 */
                gui: function(parent) {
                    const g = parent.addFolder('Shadow Caster');
                    g.add(this, 'visible').name('Visible');
                    g.open();
                }
            }
        }
    }

    this.start = function() {
        this.configure();
        this.render();
    }

    this.populateScene = function() {
        Object.keys(this._scene.objects).forEach(key => {
            var object = this._scene.objects[key];
            
            var sceneObject = object.create();
            sceneObject.name = object.name;
            
            this._scene.objects[key].ref = (sceneObject);
            this._scene.ref.add(sceneObject);

            object.gui?.call(sceneObject, this._gui);
        });
    }   
    
    this.configure = function() {
        this._renderer = new THREE.WebGLRenderer({ antialias: true });
        this._renderer.setSize(window.innerWidth, window.innerHeight);
        this._renderer.setPixelRatio(window.devicePixelRatio);
        this._renderer.shadowMap.enabled = true;
        this._renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this._scene.ref = new THREE.Scene();
        this.populateScene();

        this._controls = new OrbitControls(this._scene.objects.sceneCamera.ref, this._renderer.domElement);
        this._controls.target.set(0, 0, 0);

        this._composer = new EffectComposer(this._renderer);
        this._composer.addPass(new RenderPass(this._scene.ref, this._scene.objects.sceneCamera.ref));

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
            var folder = this._gui.__folders['Target Material'] 
            if (folder) {
                this._gui.removeFolder(folder);
            } else {
                folder = this._gui.addFolder('Target Material');
            }

            for (let i = 0; i < shader.props.length; i++) {
                const prop = shader.props[i];

                if (prop.editable === false) {
                    continue;
                }

                if (prop.type === 'Vector2') {
                    const vec2 = new THREE.Vector2(prop.value.x, prop.value.y);
                    const vectorFolder = folder.addFolder(prop.label);
                    vectorFolder.add(vec2, 'x').name('X').step(0.01).onChange((value) => {
                        vec2.x = value;
                        this._scene.objects.target.ref.material.uniforms[prop.name].value = vec2;
                    });
                    vectorFolder.add(vec2, 'y').name('Y').step(0.01).onChange((value) => {
                        vec2.y = value;
                        this._scene.objects.target.ref.material.uniforms[prop.name].value = vec2;
                    });
                    vectorFolder.open();
                } else if(prop.type === 'color') { 
                    const lcc = new guiControls.color(prop.value);
                    folder.addColor(lcc, 'color').name(prop.label).onChange((color) => {
                        this._scene.objects.target.ref.material.uniforms[prop.name].value = new THREE.Color(color);
                    });
                } else {
                    folder.add(this._scene.objects.target.ref.material.uniforms[prop.name], 'value').name(prop.label).onChange((value) => {
                        this._scene.objects.target.ref.material.uniforms[prop.name].value = 
                            !!prop.valueParser
                            ? prop.valueParser(value)
                            : value;
                    });
                }
            }
            folder.open();
        }

        this.updateShader = (shader) => {
            const shaderUniforms = shader.props.reduce((obj, prop) => {
                obj[prop.name] = { value: prop.valueParser ? prop.valueParser(prop.value) : prop.value };
                return obj;
            }, {});

            const customMaterial = new THREE.RawShaderMaterial({
                glslVersion: THREE.GLSL3,
                vertexShader: shader.vert,
                fragmentShader: shader.frag,
                uniforms: {
                    // todo: lets align with engine cast & receive shadows
                    ...(shader.lights ? engineUniforms : {}),
                    ...shaderUniforms
                },
            });

            customMaterial.name = 'Custom Material';
            customMaterial.lights = !!shader.lights;
            customMaterial.transparent = !!shader.transparent;
            customMaterial.onBeforeCompile = function(shader) {
                // NOTE: This is a hack to remove the #version 300 es from the shaders
                // and make the linter happy with the syntax.
                shader.vertexShader = shader.vertexShader.replace('#version 300 es\n', '');
                shader.fragmentShader = shader.fragmentShader.replace('#version 300 es\n', '');
            }

            this._scene.objects.target.ref.material = customMaterial;

            // todo: make conditional
            this._scene.objects.target.ref.geometry.computeTangents();

            this.createPropertyControls(shader);
        }

        return menu;
    }

    this._handleWindowResize = () => {
        this._scene.objects.sceneCamera.ref.aspect = window.innerWidth / window.innerHeight;
        this._scene.objects.sceneCamera.ref.updateProjectionMatrix();
        this._renderer.setSize(window.innerWidth, window.innerHeight);
    }

    this.render = () => {
        requestAnimationFrame(this.render);
        this._controls.update();
        this._composer.render();
    }
}

new app().start();