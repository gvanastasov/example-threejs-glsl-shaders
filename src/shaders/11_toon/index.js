import * as THREE from 'three';
import vert from './toon.vert';
import frag from './toon.frag';

export default {
    name: 'Toon',
    group: 'Advanced',
    vert,
    frag,
    props: [
        {
            label: 'Color',
            type: 'color',
            name: 'u_color',
            value: '#ffbfbf', 
            valueParser: (value) => new THREE.Color(value)
        },
        {
            label: 'Step Width',
            type: 'number',
            name: 'u_stepWidth',
            value: 0.1,
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            label: 'Step Amount',
            type: 'number',
            name: 'u_stepAmount',
            value: 3,
            min: 0,
            max: 10,
            step: 1
        },
        {
            label: 'Glossiness',
            type: 'number',
            name: 'u_glossiness',
            value: 0.5,
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            label: 'Specular Falloff',
            type: 'number',
            name: 'u_specularFalloff',
            value: 0.1,
            min: 0,
            max: 10,
            step: 0.01
        },
        {
            label: 'Specular Size',
            type: 'number',
            name: 'u_specularSize',
            value: 0.1,
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            label: 'Rim Amount',
            type: 'number',
            name: 'u_rimAmount',
            value: 0.9,
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            label: 'Rim Threshold',
            type: 'number',
            name: 'u_rimThreshold',
            value: 0.2,
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            label: 'Ambient Amount',
            type: 'number',
            name: 'u_ambientAmount',
            value: 1,
            min: 0,
            max: 10,
            step: 0.01
        },
        {
            label: 'Backlight Amount',
            type: 'number',
            name: 'u_backlightAmount',
            value: 0.9,
            min: 0,
            max: 1,
            step: 0.01
        },
        {
            label: 'Backlight Threshold',
            type: 'number',
            name: 'u_backlightThreshold',
            value: 0.2,
            min: 0,
            max: 1,
            step: 0.01
        },
    ],
    lights: true,
}