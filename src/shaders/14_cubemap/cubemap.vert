#version 300 es

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;

in vec3 position;
in vec3 normal;

out vec3 vReflect;

vec3 inverseTransformDirection(in vec3 dir, in mat4 matrix) {
    return normalize((vec4(dir, 0.0) * matrix).xyz);
}

void main() {
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec3 cameraToVertex = normalize(worldPosition.xyz - cameraPosition);
    
    vec3 worldNormal = inverseTransformDirection( normalMatrix * normal, viewMatrix );

    vReflect = reflect( cameraToVertex, worldNormal );

    vec4 viewPosition = viewMatrix * worldPosition;
    gl_Position = projectionMatrix * viewPosition;
}