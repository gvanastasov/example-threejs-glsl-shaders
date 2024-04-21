#version 300 es

precision highp float;

#define texture2D texture
#define USE_SHADOWMAP 1
#define SHADOWMAP_TYPE_PCF_SOFT 1
#define SHADOW_FRAG

// shader specific uniforms
uniform vec3 u_color;
uniform float u_glossiness;
uniform float u_rimAmount;
uniform float u_rimThreshold;
uniform float u_stepWidth;
uniform float u_stepAmount;
uniform float u_specularFalloff;
uniform float u_specularSize;
uniform float u_ambientAmount;
uniform float u_backlightThreshold;
uniform float u_backlightAmount;

// built-in uniforms
uniform mat3 normalMatrix;
uniform vec3 ambientLightColor;

// input
in vec3 vNormal;
in vec3 vViewDir;

// output
out vec4 fragColor;

// libs
#include Lighting
#include Packing
#include Shadow

vec3 calculateDiffuseStep(float shadow) {
    vec3 worldNormal =  normalize( vec3( normalMatrix * vNormal ) );
    vec3 diffuseColor = vec3(0.0);

    float attenuationChange = fwidth(shadow) * 0.5;
    float s = smoothstep(0.5 - attenuationChange, 0.5 + attenuationChange, shadow);

#if NUM_DIR_LIGHTS > 0
    #pragma unroll_loop_start
    for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
        vec3 lightDirection = normalize(directionalLights[i].direction);
        float lightReflection = dot(worldNormal, lightDirection);

        lightReflection /= u_stepWidth; // stepwidth

        float lightIntensity = floor(lightReflection);
        float change = fwidth(lightReflection);
        float smoothing = smoothstep(0.0, change, fract(lightReflection));
        lightIntensity += smoothing;

        lightIntensity /= u_stepAmount; // stepHeight
        lightIntensity = clamp(lightIntensity, 0.0, 1.0);

        lightIntensity *= s;

        // diffuse
        diffuseColor += lightIntensity * directionalLights[i].color.rgb;

        // specular (Blinn-Phong)
        // vec3 halfVector = normalize(lightDirection + vViewDir);
        // float specularReflection = dot(worldNormal, halfVector);
        // float specularIntensity = pow(max(specularReflection * lightIntensity, 0.0), 1000.0 / u_glossiness);
        // float specularIntensitySmooth = smoothstep(0.0, 0.01, specularIntensity);
        // diffuseColor += specularIntensitySmooth * directionalLights[i].color.rgb;

        // specular 2 (Phong)
        vec3 reflectionDirection = reflect(lightDirection, worldNormal);
        float specularReflection = dot(vViewDir, -reflectionDirection);
        float specularFalloff = dot(vViewDir, worldNormal);
        specularFalloff = pow(specularFalloff, u_specularFalloff);
        specularReflection *= specularFalloff; 

        float specularChange = fwidth(specularReflection);
        float specularIntesity = smoothstep(1.0 - u_specularSize, 1.0 - u_specularSize + specularChange, specularReflection);
        specularIntesity = clamp(specularIntesity, 0.0, 1.0);

        specularIntesity *= s;

        diffuseColor += specularIntesity * directionalLights[i].color.rgb;

        // ambient
        diffuseColor += ambientLightColor * u_ambientAmount;

        // rim lighting
        float rimDot = 1.0 - dot(vViewDir, worldNormal);
        float rimIntensity = rimDot * pow(lightReflection, u_rimThreshold);
        rimIntensity = smoothstep(u_rimAmount - 0.01, u_rimAmount + 0.01, rimIntensity);
        vec3 rim = rimIntensity * directionalLights[i].color;
        diffuseColor += rim;

        // backlight
        float backlightIntensity = rimDot * pow(-lightReflection, u_backlightThreshold);
        backlightIntensity = smoothstep(u_rimAmount - 0.01, u_backlightAmount + 0.01, backlightIntensity);
        vec3 backlight = backlightIntensity * ambientLightColor;
        diffuseColor += backlight;
    }
    #pragma unroll_loop_end
#endif
    return diffuseColor;
}

void main() {
    #ifdef USE_SHADOWMAP
        float shadow = calculateShadow();
    #endif

    vec3 vDiffuse = calculateDiffuseStep(shadow);

    fragColor = vec4(vDiffuse * u_color, 1.0);
}