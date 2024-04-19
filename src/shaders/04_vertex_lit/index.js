import * as THREE from 'three';
import vert from './vertex_lit.vert';
import frag from './vertex_lit.frag';

export default {
    name: 'Vertex',
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