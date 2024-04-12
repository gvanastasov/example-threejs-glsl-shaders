#version 300 es

precision highp float;

uniform vec2 uScale;
uniform vec2 uOffset;

in vec2 vTexCoord;

out vec4 fragColor;

void main() {
    vec2 coords = vTexCoord * uScale + uOffset;
    fragColor = vec4(coords, 0.0, 1.0);
}