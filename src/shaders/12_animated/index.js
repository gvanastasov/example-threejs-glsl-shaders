import * as THREE from 'three';
import vert from './texture_unlit.vert';
import frag from './texture_unlit.frag';

const texture = new THREE.TextureLoader().load('static/stone-wall-with-cartoon-style/878.jpg');
texture.wrapS = THREE.RepeatWrapping;
texture.wrapT = THREE.RepeatWrapping;
export default {
    name: 'Animated',
    group: 'Advanced',
    vert,
    frag,
    props: [
        {
            editable: false,
            name: 'uTexture',
            value: texture,
        },
        {
            name: 'uTextureScale',
            type: 'Vector2',
            value: new THREE.Vector2(1, 1),
            step: 0.01,
            label: 'Scale',
        },
        {
            name: 'uTextureOffset',
            type: 'Vector2',
            value: new THREE.Vector2(0, 0),
            step: 0.01,
            label: 'Offset',
        },
    ]
}