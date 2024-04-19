#version 300 es

precision highp float;

uniform mat3 normalMatrix;
uniform float u_spread;

in vec3 vColor;
in vec3 vDiffuse;
in vec3 vNormal;
in vec4 vDir;

uniform float u_opacity;
uniform vec3 u_inner_color;

out vec4 fragColor;

void main() {
    vec3 wNormal = normalize(normalMatrix * vNormal);
    vec3 wView = normalize(-vec3(vDir));

    float intensity = dot(wNormal, wView);
    intensity = clamp(intensity * u_spread, 0.0, 1.0);

    vec3 finalColor = vDiffuse * vColor;
    finalColor = mix(u_inner_color, finalColor, intensity);
    
    fragColor = vec4(finalColor, u_opacity);
}