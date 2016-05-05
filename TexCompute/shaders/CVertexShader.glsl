attribute vec4 vertexPos;
attribute vec2 vTexPixels;

varying vec2 texPos;

void main(void) {
    texPos =  vTexPixels;
    gl_Position = vertexPos;
}
