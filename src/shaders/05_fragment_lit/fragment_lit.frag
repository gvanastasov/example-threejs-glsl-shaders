#version 300 es

precision highp float;

uniform vec3 u_color;
uniform mat3 normalMatrix;

in vec3 vNormal;

out vec4 fragColor;

#include Lighting

void main() {
    vec3 vDiffuse = vec3(0.0, 0.0, 0.0);

    #if NUM_DIR_LIGHTS > 0
        vec3 worldNormal =  normalize( vec3( normalMatrix * vNormal ) );
        vDiffuse = calculateDiffuse(worldNormal);
    #endif

    vec3 finalColor = vDiffuse * u_color;
    fragColor = vec4(finalColor, 1.0);
}