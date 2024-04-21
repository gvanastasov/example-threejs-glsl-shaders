#version 300 es

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

in vec3 position;
in vec2 uv;

out vec2 vTexCoord;

void main() {
    vTexCoord = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}