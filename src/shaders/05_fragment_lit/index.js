import * as THREE from 'three';
import vert from './fragment_lit.vert';
import frag from './fragment_lit.frag';

export default {
    name: 'Fragment',
    group: 'Lit',
    vert,
    frag,
    props: [
        {
            label: 'Color',
            type: 'color',
            name: 'u_color',
            value: '#FF0000', 
            valueParser: (value) => new THREE.Color(value)
        }
    ],
    lights: true,
}