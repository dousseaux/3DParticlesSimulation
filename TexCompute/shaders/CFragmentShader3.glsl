precision mediump float;
varying vec2 texPos;

uniform sampler2D velocity;
uniform sampler2D position;

uniform float dt;

void main(void) {

    vec4 v = texture2D(velocity, texPos);
    vec4 p = texture2D(position, texPos);

    float px = p.x + v.x*dt;
    float py = p.y + v.y*dt;
    float pz = p.z + v.z*dt;

    gl_FragColor = vec4(px, py, pz, 1.0);
}
