#version 300 es

precision highp float;

in vec3 vNormal;

out vec4 fragColor;

void main() {
    vec3 finalColor = vNormal;
    fragColor = vec4(finalColor, 1.0);
}