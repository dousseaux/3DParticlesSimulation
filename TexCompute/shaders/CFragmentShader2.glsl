precision mediump float;
varying vec2 texPos;

uniform sampler2D velocity;
uniform sampler2D force;
uniform sampler2D mass;

uniform float dt;
uniform float gravity;
uniform float maxvelocity;

void main(void) {

    vec4 v = texture2D(velocity, texPos);
    vec4 f = texture2D(force, texPos);
    vec4 m = texture2D(mass, texPos);

    float vx = v.x;
    float vy = v.y;
    float vz = v.z;

    if(m.a > 0.0){
        vx += f.x/m.a*dt;
        vy += f.y/m.a*dt + gravity;
        vz += f.z/m.a*dt;
    }

    if (vx > maxvelocity) vx = maxvelocity;
    else if (vx < -maxvelocity) vx = -maxvelocity;
    if (vy > maxvelocity) vy = maxvelocity - v.y;
    else if (vy < -maxvelocity) vy = -maxvelocity;
    if (vz > maxvelocity) vz = maxvelocity - v.z;
    else if (vz < -maxvelocity) vz = -maxvelocity;

    gl_FragColor = vec4(vx, vy, vz, 1.0);
}
