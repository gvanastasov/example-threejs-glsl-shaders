# Example GLSL

Example repository used for playing around with manual shading in three.js, from some simple (color) shading towards more advanced ones (refraction). 

![3js-shaders-demo](.github/3js-shaders.gif)

WebGL is simply based on the fact that the HTML5 canvas element provides us with access to the OpenGL ES 2.0 API, allowing for hardware-accelerated 3D graphics rendering directly within web browsers. However, working directly with WebGL can be complex and requires extensive knowledge of graphics programming. This is where Three.js comes in. Three.js is a popular JavaScript library built on top of WebGL that simplifies the process of creating 3D graphics for the web. It provides high-level abstractions and utilities for creating and manipulating 3D scenes, loading 3D models, applying materials and textures, and more. One powerful feature of Three.js is its support for custom shaders through ShaderMaterial and RawShaderMaterial. These materials allow developers to inject custom shader instructions written in GLSL directly into their Three.js applications. With ShaderMaterial, developers can define custom vertex and fragment shaders to achieve advanced rendering effects and visualizations. RawShaderMaterial provides even greater flexibility by allowing direct control over the entire shader program, including the vertex and fragment shaders. This capability empowers developers to create highly customized and performance-optimized rendering pipelines tailored to their specific needs, all within the familiar and accessible Three.js framework.

## Getting started

1. Build and Run

```sh
npm i
npm run start
```

> uses parcel to bundle the project and deliver via dev server.

## Development (VSCode)

1. Install language support for VSCode - [https://marketplace.visualstudio.com/items?itemName=raczzalan.webgl-glsl-editor](WebGL GLSL Editor).
2. Install GLSL live preview for VSCode - [https://marketplace.visualstudio.com/items?itemName=circledev.glsl-canvas](glsl-canvas)
3. Install linter - [https://marketplace.visualstudio.com/items?itemName=dtoplak.vscode-glsllint](GLSL Lint)
    - herein the linter might require extra bit of work - you would need to probably download the [https://github.com/KhronosGroup/glslang](https://github.com/KhronosGroup/glslang), get proper release version for your machine and update the extension setting `glsllint.glslangValidatorPath` to point at the `bin\glslangValidator.exe` from the release binaries
4. Add GLSL snippets - [https://marketplace.visualstudio.com/items?itemName=j0hnm4r5.glsl-snippets](glsl-snippets)

> GLSL Canvas is optional way to preview the work in real time, but three.js is much nicer as we can use it for much better demo purposes with shader controls (as one example).

## Shaders

1. [Color](./src/shaders/01_color_unlit/index.js)
2. [UVs](./src/shaders/02_uvs_unlit/index.js)
3. [Texture](./src/shaders/03_texture_unlit/index.js)
4. [Vertex Lit](./src/shaders/04_vertex_lit/index.js)
5. [Fragment Lit](./src/shaders/05_fragment_lit/index.js)
6. [Shadow Mapped](./src/shaders/06_shadow_map/index.js)
7. [Vertex Normals](./src/shaders/07_vertex_normal/index.js)
8. [Texture Normals (bumpmap)](./src/shaders/08_normal_map/index.js)
9. [Transparent](./src/shaders/09_transparent/index.js)
10. [Inner Glow (rim)](./src/shaders/10_inner_glow/index.js)
11. [Toon](./src/shaders/11_toon/index.js)
12. [Animated](./src/shaders/12_animated/index.js)
13. [Refraction/Distortion (map)](./src/shaders/13_refracted/index.js)
14. [Reflection (cubemap)](./src/shaders/14_cubemap/index.js)

> im still using three.js built-in render pipeline to inject global uniforms into the shaders, for example directional light information, or generated shadow maps, although one can also generate those himself but thats beyound the scope of this example repo. Lighting is limited to handling only directional sources (and a bit of ambient). Shadowmaps are generated by the engine and injected into the shader programms.

## Credits

- threejs
- glsl