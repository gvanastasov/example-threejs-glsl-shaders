#version 300 es

#include Lighting

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform vec3 u_color;

in vec3 position;
in vec3 normal;
in vec3 tangent;
in vec2 uv;

out vec3 vColor;
out vec3 vDiffuse;
out vec2 vCoords;
out vec3 vTangent;
out vec3 vBitangent;
out vec3 vNormal;

void main() {
    #if NUM_DIR_LIGHTS > 0
        vec3 worldNormal =  normalize( vec3( normalMatrix * normal ) );
        vDiffuse = calculateDiffuse(worldNormal);
    #else
        vDiffuse = vec3(0.0, 0.0, 0.0);
    #endif
    
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
    vColor = u_color;
    vCoords = uv;
    vBitangent = cross(normal, tangent);
    vTangent = tangent;
    vNormal = normal;
}