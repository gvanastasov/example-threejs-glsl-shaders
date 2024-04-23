import * as THREE from 'three';
import vert from './refracted.vert';
import frag from './refracted.frag';

const nTexture = new THREE.TextureLoader().load('static/n_wave.jpg');

export default {
    name: 'Refracted',
    group: 'Advanced',
    vert,
    frag,
    // lights: true,
    requestRenderScene: true,
    transparent: true,
    props: [
        {
            label: 'Color',
            type: 'color',
            name: 'u_color',
            value: '#FFFFFF', 
            valueParser: (value) => new THREE.Color(value)
        },
        {
            editable: false,
            name: 'u_normalMap',
            value: nTexture,
        },
        {
            label: 'Normal Scale',
            type: 'number',
            name: 'u_normalScale',
            value: 1,
            min: 0,
            max: 3,
            step: 0.01
        },
        {
            editable: false,
            name: 'u_sceneTexture',
            value: null,
        },
        {
            label: 'Distortion',
            type: 'number',
            name: 'u_distortion',
            value: 0.01,
            min: 0,
            max: 3,
            step: 0.01
        },
        {
            label: 'Screen Width',
            type: 'number',
            name: 'u_screenWidth',
            value: 800,
            editable: false,
        },
        {
            label: 'Screen Height',
            type: 'number',
            name: 'u_screenHeight',
            value: 600,
            editable: false,
        }
    ]
}