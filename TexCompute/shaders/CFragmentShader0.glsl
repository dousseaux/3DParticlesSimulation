precision mediump float;
varying vec2 texPos;

uniform vec2 texsize;
uniform sampler2D position;

void main(void) {

    vec4 pbody1 = texture2D(position, texPos);

    if(texPos.s + 1.0/texsize[0] <= 1.0){
        vec4 pbody2 = texture2D(position, vec2(texPos.s + 1.0/texsize[0], texPos.t));
        float dx = pbody1.x - pbody2.x;
        float dy = pbody1.y - pbody2.y;
        float dz = pbody1.z - pbody2.z;
        gl_FragColor = vec4(dx, dy, dz, 1.0);
    }else{
        vec4 pbody2 = texture2D(position, vec2(0.0, texPos.t + 1.0/texsize[1]));
        float dx = pbody1.x - pbody2.x;
        float dy = pbody1.y - pbody2.y;
        float dz = pbody1.z - pbody2.z;
        gl_FragColor = vec4(dx, dy, dz, 1.0);
    }
}
