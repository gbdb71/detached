precision highp float;

varying vec2 fPosition;
varying vec2 fUv;

uniform sampler2D sampler;
uniform float time;
uniform vec4 tint;

vec4 rand3To4(vec3 seed) {
        return fract(
            sin(dot(seed, vec3(12.9898, 78.233, 1284.179)))
            * vec4(43758.5453, 28001.8384, 50849.4141, 37431.2324));
}

vec4 dither(vec4 color, vec3 seed) {
    vec4 triRand =  rand3To4(seed) + rand3To4(seed + 0.07) - 0.5;
    return color + triRand / 64.0 * color.a;
}

void main(void) {
    vec4 color = texture2D(sampler, fUv);

    color.rgb *= tint.rgb;
    color *= tint.a;

    color = dither(color, vec3(fPosition, sin(time)));

    gl_FragColor = color;
}
