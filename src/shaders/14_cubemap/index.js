import vert from './cubemap.vert';
import frag from './cubemap.frag';

export default {
    name: 'Cubemap',
    group: 'Advanced',
    vert,
    frag,
    props: [
        {
            label: 'Environment Map',
            name: 'envMap',
            value: null,
            editable: false,
        },
        {
            label: 'Environment Map Intensity',
            name: 'envMapIntensity',
            type: 'float',
            value: 1,
            min: 0,
            max: 1,
            step: 0.01,
        }
    ]
}