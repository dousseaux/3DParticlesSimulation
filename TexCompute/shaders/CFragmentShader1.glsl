precision mediump float;
varying vec2 texPos;

uniform vec2 texsize;
uniform sampler2D distance;
uniform sampler2D velocity;
uniform sampler2D radius;
uniform sampler2D position;
uniform float friction;
uniform float wallspring;
uniform float nparticles;
uniform vec3 worldsize;

void main(void) {

    vec4 v = texture2D(velocity, texPos);
    vec4 p = texture2D(position, texPos);
    vec4 r = texture2D(radius, texPos);

    float fx = 0.0;
    float fy = 0.0;
    float fz = 0.0;

    float n = float(int(texPos.s*texsize[0]) + int(texPos.t*texsize[1])*int(texsize[0]));

    if(n < nparticles){
        vec4 d = texture2D(distance, texPos);
        float distance = sqrt(d.x*d.x+d.y*d.y+d.z*d.z);
        float force1 = -(distance-50.0)*(distance-50.0)*(distance-50.0);

        fx = (d.x/distance*force1) - friction*v.x;
        fy = (d.y/distance*force1) - friction*v.y;
        fz = (d.z/distance*force1) - friction*v.z;
    }

    if(n > 0.0 && n <= nparticles){
        if(texPos.s - 1.0/texsize[0] >= 0.0){
            vec4 d0 =  texture2D(position, vec2(texPos.s - 1.0/texsize[0], texPos.t));
            float distance0 = sqrt(d0.x*d0.x+d0.y*d0.y+d0.z*d0.z);
            float force2 = -(distance0-50.0)*(distance0-50.0)*(distance0-50.0);
            fx += (d0.x/distance0*force2);
            fy += (d0.y/distance0*force2);
            fz += (d0.z/distance0*force2);
        }else{
            vec4 d0 =  texture2D(position, vec2(1.0, texPos.t - 1.0/texsize[1]));
            float distance0 = sqrt(d0.x*d0.x+d0.y*d0.y+d0.z*d0.z);
            float force2 = -(distance0-50.0)*(distance0-50.0)*(distance0-50.0);
            fx += (d0.x/distance0*force2);
            fy += (d0.y/distance0*force2);
            fz += (d0.z/distance0*force2);
        }
    }

    if (p.x-r.x < -worldsize[0])
        fx += -wallspring*(p.x-r.x+worldsize[0]);
    else if (p.x+r.x > worldsize[0])
        fx += -wallspring*(p.x+r.x-worldsize[0]);

    if (p.y-r.x < -worldsize[1])
        fy += -wallspring*(p.y-r.x+worldsize[1]);
    else if (p.y+r.x > worldsize[1])
        fy += -wallspring*(p.y+r.x-worldsize[1]);

    if (p.z-r.x < -worldsize[2])
        fz += -wallspring*(p.z-r.x+worldsize[2]);
    else if (p.z+r.x > worldsize[2])
        fz += -wallspring*(p.z+r.x-worldsize[2]);

    gl_FragColor = vec4(fx, fy, fz, 1.0);
}
