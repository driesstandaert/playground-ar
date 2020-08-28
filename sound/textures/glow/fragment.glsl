#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform vec3 color;
uniform float start;
uniform float end;
uniform float alpha;

varying vec3 fPosition;
varying vec3 fNormal;

void main()
{
  vec3 normal = normalize(fNormal);
  vec3 eye = normalize(-fPosition.xyz);
  float rim = 1.0 - smoothstep(start, end, 1.0 - dot(normal, eye));
  float value = clamp( rim, 0.0, 1.0 ) * alpha;
  gl_FragColor = vec4( value * color, length( value ) );
}