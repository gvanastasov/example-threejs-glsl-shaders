#version 300 es

precision highp float;

uniform sampler2D nTexture;
uniform mat3 normalMatrix;
uniform float normalScale;
uniform vec3 u_color;

in vec2 vTexCoord;
in vec3 vBitangent;
in vec3 vTangent;
in vec3 vNormal;

out vec4 fragColor;

#include Lighting

void main() {
    vec3 t = normalize(normalMatrix * vTangent);
    vec3 b = normalize(normalMatrix * vBitangent);
    vec3 n = normalize(normalMatrix * vNormal);

    mat3 tbn = mat3(t, b, n);

    vec3 vDiffuse = vec3(0.0, 0.0, 0.0);

    #if NUM_DIR_LIGHTS > 0
        vec3 normalColor = texture(nTexture, vTexCoord).rgb;
        vec3 normal = (normalColor * 2.0 - 1.0);
        normal.xy *= normalScale;
        vec3 worldNormal = normalize(tbn * normal);

        vDiffuse = calculateDiffuse(worldNormal);
    #endif

    vec3 finalColor = u_color * vDiffuse;
    fragColor = vec4(finalColor, 1.0);
}