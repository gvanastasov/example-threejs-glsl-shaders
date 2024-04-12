import ColorUnlit from './01_color_unlit';
import UVsUnlit from './02_uvs_unlit';
import TextureUnlit from './03_texture_unlit';
import VertexLit from './04_vertex_lit';

import Lighting from './lighting.glsl';

const regex = {
    include: /#include\s+([^\s]+)/g,
}

const extensions = {
    Lighting,
}

const shaders = [
    ColorUnlit,
    UVsUnlit,
    TextureUnlit,
    VertexLit,
];

shaders.forEach(x => {
    x.vert = processShader(x.vert);
    x.frag = processShader(x.frag);
});

function processShader(shaderCode) {
    let modifiedCode = shaderCode;
    let match;
    while ((match = regex.include.exec(shaderCode)) !== null) {
        const name = match[1];
        const extension = extensions[name];
        if (!!extension) {
            modifiedCode = modifiedCode.replace(match[0], extension);
        }
    }
    return modifiedCode;
}

export default shaders;