#version 300 es

precision highp float;

uniform float envMapIntensity;
uniform samplerCube envMap;

in vec3 vReflect;

out vec4 fragColor;

void main() {
    vec4 envColor = texture( envMap, vec3( -1.0 * vReflect.x, vReflect.yz ) );
    fragColor = vec4( envColor.xyz * envMapIntensity, 1.0 );
}