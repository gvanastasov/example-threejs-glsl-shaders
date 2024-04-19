#version 300 es

#define USE_TANGENT

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec3 normal;
in vec3 tangent;
in vec2 uv;

out vec2 vTexCoord;
out vec3 vTangent;
out vec3 vBitangent;
out vec3 vNormal;

void main() {
    vTexCoord = uv;
    vBitangent = cross(normal, tangent);
    vTangent = tangent;
    vNormal = normal;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}