#version 300 es

precision highp float;

uniform sampler2D uTexture;
uniform vec2 uTextureScale;
uniform vec2 uTextureOffset;

in vec2 vTexCoord;

out vec4 fragColor;

void main() {
    vec2 coords = vTexCoord * uTextureScale + uTextureOffset;
    fragColor = texture(uTexture, coords);
}