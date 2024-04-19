import * as THREE from 'three';
import vert from './inner_glow.vert';
import frag from './inner_glow.frag';

export default {
    name: 'Inner Glow',
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
            value: '#FFFFFF', 
            valueParser: (value) => new THREE.Color(value)
        },
        {
            label: 'Inner Color',
            type: 'color',
            name: 'u_inner_color',
            value: '#FF0000',
            valueParser: (value) => new THREE.Color(value)
        },
        {
            label: 'Spread',
            type: 'number',
            name: 'u_spread',
            value: 1.5,
            min: 0,
            max: 1,
            step: 0.01
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