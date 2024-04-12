#version 300 es

precision highp float;

uniform vec3 u_color;

in vec3 vDiffuse;

out vec4 fragColor;

void main() {
    vec3 finalColor = vDiffuse * u_color;
    fragColor = vec4(finalColor, 1.0);
}