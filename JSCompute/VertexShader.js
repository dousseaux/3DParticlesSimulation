var vShaderString = `

attribute vec4 vertexPos;
attribute vec3 vNormal;
attribute vec2 vTexPixels;

uniform mat4 translation;
uniform mat4 xrotation;
uniform mat4 yrotation;
uniform mat4 zrotation;
uniform mat4 scale;

uniform mat4 viewMatrix;
uniform mat4 projectionMatrix;

uniform vec3 light;
uniform float lightmode;
uniform float shininess;

uniform vec4 color;

varying mat4 modelMatrix;
varying vec4 vertexP;
varying vec3 vertexN;
varying vec3 flight;
varying float fshininess;
varying float flightmode;
varying vec4 fcolor;

void main(void) {

    modelMatrix = translation  * xrotation * yrotation * zrotation * scale;

    gl_Position += projectionMatrix * viewMatrix * modelMatrix * vertexPos;

    vertexP = vertexPos;
    vertexN = vNormal;
    flight = light;
    flightmode = lightmode;
    fshininess = shininess;
    fcolor = color;
}
`;
