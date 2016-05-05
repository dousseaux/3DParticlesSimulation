attribute vec2 id;

uniform sampler2D translationTex;
uniform sampler2D scaleTex;
uniform sampler2D colorTex;
uniform sampler2D vertexPos;
uniform sampler2D vNormal;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;
uniform vec3 light;
uniform float lightmode;
uniform float shininess;
uniform vec2 size;
uniform float vTexsize;

varying mat4 modelMatrix;
varying vec4 vertexP;
varying vec3 vertexN;
varying vec3 flight;
varying float fshininess;
varying float flightmode;
varying vec4 fcolor;

void main(void) {

    int row1 = int(id.x/size[0]);
    vec2 texpos1 = vec2((id.x - float(row1)*size[0])/size[0], float(row1)/size[1]);

    int row2 = int(id.y/vTexsize);
    vec2 texpos2 = vec2((id.y + + 1.0 - float(row2)*(vTexsize+1.0))/(vTexsize+1.0), 1.0);

    vec3 t = vec3(texture2D(translationTex, texpos1));
    float s = texture2D(scaleTex, texpos1).a;
    vec4 pos = texture2D(vertexPos, texpos2);
    vec3 norm = vec3(texture2D(vNormal, texpos2));


    mat4 translation = mat4( 1.0, 0.0, 0.0, 0.0,
                             0.0, 1.0, 0.0, 0.0,
                             0.0, 0.0, 1.0, 0.0,
                             t.x, t.y, t.z, 1.0 );

    mat4 scale = mat4( s  , 0.0, 0.0, 0.0,
                       0.0, s  , 0.0, 0.0,
                       0.0, 0.0, s  , 0.0,
                       0.0, 0.0, 0.0, 1.0 );

    modelMatrix = translation * scale;

    gl_Position = projectionMatrix * viewMatrix * modelMatrix * pos;

    vertexP = pos;
    vertexN = norm;
    flight = light;
    flightmode = lightmode;
    fshininess = shininess;
    fcolor = texture2D(colorTex, texpos1);
}
