#if NUM_DIR_LIGHTS > 0
    struct DirectionalLight {
        vec3 direction;
        vec3 color;
    };

    uniform DirectionalLight directionalLights[NUM_DIR_LIGHTS];
#endif

vec3 calculateDiffuse(vec3 worldNormal) {
    vec3 diffuseColor = vec3(0.0);
#if NUM_DIR_LIGHTS > 0
    #pragma unroll_loop_start
    for (int i = 0; i < NUM_DIR_LIGHTS; i++) {
        vec3 lightDirection = normalize(directionalLights[i].direction);
        float diffuseIntensity = max(dot(worldNormal, lightDirection), 0.0);
        diffuseColor += diffuseIntensity * directionalLights[i].color.rgb;
    }
    #pragma unroll_loop_end
#endif
    return diffuseColor;
}