var fShaderString = `
precision mediump float;

varying mat4 modelMatrix;
varying vec4 vertexP;
varying vec3 vertexN;
varying float flightmode;
varying vec3 flight;
varying float fshininess;
varying vec4 fcolor;

void main(void) {

    vec3 pos = vec3(modelMatrix * vertexP);

    vec3 L;
    vec3 H;

    if(flightmode > 0.0) L = normalize(vec3(pos - flight));
    else L = normalize(flight);

    if(flightmode > 0.0) H = normalize(L - normalize(pos));
    else H = normalize(L);

    vec3 N = -normalize(mat3(modelMatrix) * vertexN);

    float Kd = max(dot(L, N), 0.0) + max(dot(vec3(-L.x,L.y,-L.z), N), 0.0);

    float Ks = pow(max(dot(N, H), 0.0), fshininess) + pow(max(dot(N,vec3(-H.x,H.y,-H.z)), 0.0), fshininess);
    if(dot(L, N) < 0.0) Ks = 0.0;

    vec4 ambient = fcolor * vec4(0.3, 0.3, 0.3, 1.0);
    vec4 diffuse =  Kd * vec4(0.7, 0.7, 0.7, 1.0);
    vec4 specular = Ks * vec4(0.4, 0.4, 0.4, 1.0);

    gl_FragColor = vec4(vec3(fcolor*(ambient + diffuse + specular)), fcolor.a);
}
`;
