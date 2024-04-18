#version 300 es

precision highp float;

#define texture2D texture
#define SHADOWMAP_TYPE_PCF_SOFT 1

#include Packing

struct DirectionalLightShadow {
    float shadowBias;
    float shadowNormalBias;
    float shadowRadius;
    vec2 shadowMapSize;
};

uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
uniform vec3 u_color;
uniform bool receiveShadow;
uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];

in vec3 vDiffuse;
in vec4 vShadowCoords[ NUM_DIR_LIGHT_SHADOWS ];

out vec4 fragColor;

float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
    return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
}

float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
        float shadow = 1.0;
        shadowCoord.xyz /= shadowCoord.w;
        shadowCoord.z += shadowBias;
        bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
        bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
        if ( frustumTest ) {
            #if defined( SHADOWMAP_TYPE_PCF )
                vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
                float dx0 = - texelSize.x * shadowRadius;
                float dy0 = - texelSize.y * shadowRadius;
                float dx1 = + texelSize.x * shadowRadius;
                float dy1 = + texelSize.y * shadowRadius;
                float dx2 = dx0 / 2.0;
                float dy2 = dy0 / 2.0;
                float dx3 = dx1 / 2.0;
                float dy3 = dy1 / 2.0;
                shadow = (
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
                ) * ( 1.0 / 17.0 );
            #elif defined( SHADOWMAP_TYPE_PCF_SOFT )
                vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
                float dx = texelSize.x;
                float dy = texelSize.y;
                vec2 uv = shadowCoord.xy;
                vec2 f = fract( uv * shadowMapSize + 0.5 );
                uv -= f * texelSize;
                shadow = (
                    texture2DCompare( shadowMap, uv, shadowCoord.z ) +
                    texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
                    texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
                    mix( 
                        texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
                        texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
                        f.x ) +
                    mix( 
                        texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
                        texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
                        f.x ) +
                    mix( 
                        texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
                        texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
                        f.y ) +
                    mix( 
                        texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
                        texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
                        f.y ) +
                    mix( 
                        mix( 
                            texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
                            texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
                            f.x ),
                        mix( 
                            texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
                            texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
                            f.x ),
                    f.y )
                ) * ( 1.0 / 9.0 );
            #elif defined( SHADOWMAP_TYPE_VSM )
                shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
            #else
                shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
            #endif
        }
        return shadow;
    }

in vec2 vTexCoord;

void main() {
    vec3 finalColor = vDiffuse * u_color;

    float shadow = 1.0;

    #if NUM_DIR_LIGHT_SHADOWS > 1
        DirectionalLightShadow directionalLight;
        #pragma unroll_loop_start
        for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
            directionalLight = directionalLightShadows[ i ];
            shadow *= getShadow(
                directionalShadowMap[ i ],
                directionalLight.shadowMapSize, 
                directionalLight.shadowBias,
                directionalLight.shadowRadius,
                vShadowCoords[ i ] 
            );
        }
        #pragma unroll_loop_end
    #elif NUM_DIR_LIGHT_SHADOWS == 1
        DirectionalLightShadow directionalLight = directionalLightShadows[ 0 ];
        shadow *= getShadow( 
            directionalShadowMap[ 0 ], 
            directionalLight.shadowMapSize, 
            directionalLight.shadowBias, 
            directionalLight.shadowRadius, 
            vShadowCoords[ 0 ] 
        ); 
    #endif

    fragColor = vec4(finalColor * shadow, 1.0);
}