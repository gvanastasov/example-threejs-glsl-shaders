#version 300 es

precision highp float;

in vec3 vColor;
in vec3 vDiffuse;
in vec2 vCoords;
in vec3 vBitangent;
in vec3 vTangent;
in vec3 vNormal;

uniform mat3 normalMatrix;

uniform sampler2D u_normalMap;
uniform float u_normalScale;
uniform float u_distortion;
uniform sampler2D u_sceneTexture;
uniform float u_screenWidth;
uniform float u_screenHeight;

out vec4 fragColor;

#include Lighting

void main() {
    vec3 t = normalize(normalMatrix * vTangent);
    vec3 b = normalize(normalMatrix * vBitangent);
    vec3 n = normalize(normalMatrix * vNormal);

    mat3 tbn = mat3(t, b, n);


    vec2 screenPos = gl_FragCoord.xy;
    vec2 uv = screenPos / vec2(u_screenWidth, u_screenHeight);

    vec3 distortion = texture(u_normalMap, vCoords).rgb;
    vec3 normal = (distortion * 2.0 - 1.0);
    normal.xy *= u_normalScale;
    vec3 worldNormal = normalize(tbn * normal);

    vec2 distortedUV = uv + worldNormal.xy * u_distortion * gl_FragCoord.z;

    vec3 col = texture(u_sceneTexture, distortedUV).rgb;

    vec3 finalColor = col * vColor;
    
    fragColor = vec4(finalColor, 1);
}