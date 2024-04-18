import * as THREE from 'three';
import vert from './shadow_map.vert';
import frag from './shadow_map.frag';

export default {
    name: 'Shadow Receiver',
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
    ]
}