import * as THREE from 'three';
import vert from './transparent_lit.vert';
import frag from './transparent_lit.frag';

export default {
    name: 'Lit',
    group: 'Transparent',
    vert,
    frag,
    transparent: true,
    lights: true,
    props: [
        {
            label: 'Color',
            type: 'color',
            name: 'u_color',
            value: '#FF0000', 
            valueParser: (value) => new THREE.Color(value)
        },
        {
            label: 'Opacity',
            type: 'number',
            name: 'u_opacity',
            value: 0.5,
            min: 0,
            max: 1,
            step: 0.01
        }
    ]
}