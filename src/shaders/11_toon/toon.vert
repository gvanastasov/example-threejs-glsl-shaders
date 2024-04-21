#version 300 es

#define USE_SHADOWMAP 1
#define SHADOW_VERT

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

in vec3 position;
in vec3 normal;

out vec3 vNormal;
out vec3 vViewDir;

#include Packing
#include Lighting
#include Shadow

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 clipPosition = projectionMatrix * viewPosition;

    vNormal = normal;
    vViewDir = normalize(-viewPosition.xyz);

    calculateShadowCoords();

    gl_Position = clipPosition;
}