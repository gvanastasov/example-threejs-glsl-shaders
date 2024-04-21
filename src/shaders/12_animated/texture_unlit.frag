#version 300 es

precision highp float;

uniform sampler2D uTexture;
uniform vec2 uTextureScale;
uniform vec2 uTextureOffset;
uniform float uTime;

in vec2 vTexCoord;

out vec4 fragColor;

void main() {
    vec2 coords = vTexCoord * uTextureScale + uTextureOffset;
    coords.x = clamp(coords.x + fract(uTime), 0.0, 2.0);

    fragColor = texture(uTexture, coords);
}