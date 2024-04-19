import * as THREE from 'three';
import vert from './normal_map.vert';
import frag from './normal_map.frag';

const nTexture = new THREE.TextureLoader().load('static/stone-wall-with-cartoon-style/n_878.png');

export default {
    name: 'Map',
    group: 'Normal',
    vert,
    frag,
    props: [
        {
            editable: false,
            name: 'nTexture',
            value: nTexture,
        },
        {
            label: 'Color',
            type: 'color',
            name: 'u_color',
            value: '#FF0000', 
            valueParser: (value) => new THREE.Color(value)
        },
        {
            name: 'normalScale',
            type: 'Number',
            value: 2,
            step: 0.01,
            label: 'Normal Scale',
        }
    ],
    lights: true,
}