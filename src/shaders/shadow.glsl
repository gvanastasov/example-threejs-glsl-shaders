
#ifdef USE_SHADOWMAP
    #if NUM_DIR_LIGHT_SHADOWS > 0
        uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
        uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
        varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
        
        // varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
        
        struct DirectionalLightShadow {
            float shadowBias;
            float shadowNormalBias;
            float shadowRadius;
            vec2 shadowMapSize;
        };
        uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
    #endif
    
    float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
        return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
    }
    
    vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
        return unpackRGBATo2Half( texture2D( shadow, uv ) );
    }
    
    float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
        float occlusion = 1.0;
        vec2 distribution = texture2DDistribution( shadow, uv );
        float hard_shadow = step( compare , distribution.x );
        if (hard_shadow != 1.0 ) {
            float distance = compare - distribution.x ;
            float variance = max( 0.00000, distribution.y * distribution.y );
            float softness_probability = variance / (variance + distance * distance );
            softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );
            occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
        }
        
        return occlusion;
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
#endif

#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 ) )
    vec4 calculateShadowCoords(vec3 position, vec3 normal, mat4 modelMatrix, mat4 viewMatrix) {
        vec3 objectNormal = vec3( normal );
        vec3 transformedNormal = objectNormal;

        vec4 worldPosition = modelMatrix * vec4(position, 1.0);

        vec4 coords[ NUM_DIR_LIGHT_SHADOWS ];
        vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
        
        #pragma unroll_loop_start
            for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
                vec4 shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
                coords[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
            }
        #pragma unroll_loop_end
        return coords;
    } 

    // vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
    // vec4 shadowWorldPosition;
    // #pragma unroll_loop_start
    //     for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
    //         shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
    //         vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
    //     }
#endif

float calculateShadow(vec4 coords) {
    float shadow = 1.0;
    #ifdef ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 ) )
        DirectionalLightShadow directionalLight;
        #pragma unroll_loop_start
            for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
                directionalLight = directionalLightShadows[ i ];
                shadow *= receiveShadow 
                    ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, coords[ i ] ) 
                    : 1.0;
            }
        #pragma unroll_loop_end
    #endif
    return shadow;
}
