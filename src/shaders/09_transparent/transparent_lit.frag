#version 300 es

precision highp float;

in vec3 vColor;
in vec3 vDiffuse;

uniform float u_opacity;

out vec4 fragColor;

void main() {
    vec3 finalColor = vDiffuse * vColor;
    
    fragColor = vec4(finalColor, u_opacity);
}