import ColorUnlit from './01_color_unlit';
import UVsUnlit from './02_uvs_unlit';
import TextureUnlit from './03_texture_unlit';
import VertexLit from './04_vertex_lit';
import FragmentLit from './05_fragment_lit';
import ShadowMap from './06_shadow_map';
import VertexNormal from './07_vertex_normal';
import NormalMap from './08_normal_map';
import TransparentUnlit from './09_transparent';
import InnerGlow from './10_inner_glow';
import Toon from './11_toon';
import Animated from './12_animated'

import Packing from './packing.glsl';
import Lighting from './lighting.glsl';
import Shadow from './shadow.glsl';

const regex = {
    include: /#include\s+([^\s]+)/g,
}

const extensions = {
    Packing,
    Lighting,
    Shadow,
}

const shaders = [
    ColorUnlit,
    UVsUnlit,
    TextureUnlit,
    VertexLit,
    FragmentLit,
    ShadowMap,
    VertexNormal,
    NormalMap,
    TransparentUnlit,
    InnerGlow,
    Toon,
    Animated,
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