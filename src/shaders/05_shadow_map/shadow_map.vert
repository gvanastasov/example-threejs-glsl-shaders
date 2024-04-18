#version 300 es

#define USE_SHADOWMAP 1
#define texture2D texture

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
    return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}

#include Packing
#include Lighting

uniform mat4 modelMatrix;
uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform mat3 normalMatrix;

uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];

struct DirectionalLightShadow {
    float shadowBias;
    float shadowNormalBias;
    float shadowRadius;
    vec2 shadowMapSize;
};
uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];

in vec3 position;
in vec3 normal;
in vec2 uv;

out vec3 vDiffuse;
out vec4 vShadowCoords[ NUM_DIR_LIGHT_SHADOWS ];
out vec2 vTexCoord;

void calculateShadowCoords() {
    vec3 objectNormal = vec3( normal );
    vec3 transformedNormal = objectNormal;
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
    
    #if NUM_DIR_LIGHTS > 1

        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
            vec4 shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
            vShadowCoords[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
        }
        #pragma unroll_loop_end

    #elif NUM_DIR_LIGHTS == 1
    
            vec4 shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ 0 ].shadowNormalBias, 0 );
            vShadowCoords[ 0 ] = directionalShadowMatrix[ 0 ] * shadowWorldPosition;
    #endif
} 

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