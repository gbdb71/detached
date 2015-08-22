precision highp float;

attribute vec2 position;
attribute vec2 uv;

uniform mat3 model;
uniform mat3 view;

varying vec2 fPosition;
varying vec2 fUv;

void main(void) {
    vec3 worldPosition = view * model * vec3(position, 1.0);
    gl_Position = vec4(worldPosition.xy, 0.0, 1.0);
    fPosition = worldPosition.xy;
    fUv= uv;
}
