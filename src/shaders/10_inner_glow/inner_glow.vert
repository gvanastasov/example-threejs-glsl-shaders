#version 300 es

#include Lighting

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform vec3 u_color;

in vec3 position;
in vec3 normal;

out vec3 vColor;
out vec3 vDiffuse;
out vec3 vNormal;
out vec4 vDir;

void main() {
    #if NUM_DIR_LIGHTS > 0
        vec3 worldNormal =  normalize( vec3( normalMatrix * normal ) );
        vDiffuse = calculateDiffuse(worldNormal);
    #else
        vDiffuse = vec3(0.0, 0.0, 0.0);
    #endif
    
    vColor = u_color;
    vNormal = normal;
    vDir = viewMatrix * modelMatrix * vec4(position, 1.0);
    
    gl_Position = projectionMatrix * vDir;
}