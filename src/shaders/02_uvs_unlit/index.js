import * as THREE from 'three';
import vert from './uvs_unlit.vert';
import frag from './uvs_unlit.frag';

export default {
    name: 'UVs',
    group: 'Unlit',
    vert,
    frag,
    props: [
        {
            name: 'uScale',
            type: 'Vector2',
            value: new THREE.Vector2(1, 1),
            step: 0.01,
            label: 'Scale',
        },
        {
            name: 'uOffset',
            type: 'Vector2',
            value: new THREE.Vector2(0, 0),
            step: 0.01,
            label: 'Offset',
        },
    ]
}