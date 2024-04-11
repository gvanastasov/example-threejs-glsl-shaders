import * as THREE from 'three';
import vert from './color_unlit.vert';
import frag from './color_unlit.frag';

export default {
    name: 'Color',
    group: 'Unlit',
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