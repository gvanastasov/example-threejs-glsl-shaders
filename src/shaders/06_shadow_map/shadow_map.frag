#version 300 es

precision highp float;

#define texture2D texture
#define USE_SHADOWMAP 1
#define SHADOWMAP_TYPE_PCF_SOFT 1
#define SHADOW_FRAG

#include Packing
#include Shadow

uniform vec3 u_color;

in vec3 vDiffuse;

out vec4 fragColor;

void main() {
    vec3 finalColor = vDiffuse * u_color;

    #ifdef USE_SHADOWMAP
        float shadow = calculateShadow();
        finalColor *= shadow;
    #endif

    fragColor = vec4(finalColor * shadow, 1.0);
}