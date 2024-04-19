#version 300 es

#define USE_SHADOWMAP 1
#define SHADOW_VERT

#define texture2D texture

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vDiffuse;
out vec2 vTexCoord;

#include Packing
#include Lighting
#include Shadow

void main() {
    #if NUM_DIR_LIGHTS > 0
        vec3 worldNormal =  normalize( vec3( normalMatrix * normal ) );
        vDiffuse = calculateDiffuse(worldNormal);
    #else
        vDiffuse = vec3(0.0, 0.0, 0.0);
    #endif

    calculateShadowCoords();

    vTexCoord = uv;
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}