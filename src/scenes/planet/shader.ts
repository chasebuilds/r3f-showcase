import { Color } from 'three'

export type PaletteId = 'magma' | 'toxic' | 'ice'

export interface Palette {
  label: string
  /** Cool rock colours, then hot lava colours, then the atmosphere rim. */
  crustA: string
  crustB: string
  lavaA: string
  lavaB: string
  rim: string
}

export const PALETTES: Record<PaletteId, Palette> = {
  magma: { label: 'Magma', crustA: '#1a1210', crustB: '#3b2418', lavaA: '#ff4a12', lavaB: '#ffd23a', rim: '#ff6a2a' },
  toxic: { label: 'Toxic', crustA: '#0f1511', crustB: '#233028', lavaA: '#25d96b', lavaB: '#e6ff4d', rim: '#4dff9a' },
  ice: { label: 'Ice', crustA: '#101722', crustB: '#25364d', lavaA: '#3aa0ff', lavaB: '#d4f1ff', rim: '#7cc4ff' },
}

/** Value noise and fractal noise. Written for this project, no external noise code. */
const NOISE = /* glsl */ `
float hash31(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}
float vnoise(vec3 x) {
  vec3 i = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);
  float a = mix(hash31(i), hash31(i + vec3(1, 0, 0)), f.x);
  float b = mix(hash31(i + vec3(0, 1, 0)), hash31(i + vec3(1, 1, 0)), f.x);
  float c = mix(hash31(i + vec3(0, 0, 1)), hash31(i + vec3(1, 0, 1)), f.x);
  float d = mix(hash31(i + vec3(0, 1, 1)), hash31(i + vec3(1, 1, 1)), f.x);
  return mix(mix(a, b, f.y), mix(c, d, f.y), f.z);
}
float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * vnoise(p);
    p = p * 2.03 + vec3(1.7, 9.2, 3.1);
    amp *= 0.5;
  }
  return sum;
}
`

export const PLANET_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uHeat;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
${NOISE}
void main() {
  float h = fbm(position * 1.6 + vec3(0.0, uTime * 0.05, 0.0));
  vec3 displaced = position + normal * (h - 0.5) * (0.06 + 0.1 * uHeat);
  vObj = position;
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(displaced, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const PLANET_FRAGMENT = /* glsl */ `
uniform float uTime;
uniform float uHeat;
uniform vec3 uCrustA;
uniform vec3 uCrustB;
uniform vec3 uLavaA;
uniform vec3 uLavaB;
uniform vec3 uRim;
varying vec3 vObj;
varying vec3 vNormalW;
varying vec3 vWorld;
${NOISE}
void main() {
  vec3 p = vObj * 2.2;
  float rock = fbm(p + vec3(0.0, uTime * 0.03, 0.0));
  // Ridged noise makes thin bright cracks where the crust is split.
  float ridge = 1.0 - abs(2.0 * fbm(vObj * 2.9 + vec3(uTime * 0.04, 0.0, uTime * 0.02)) - 1.0);
  float crack = smoothstep(0.9 - uHeat * 0.14, 0.985, ridge);
  float pool = 1.0 - smoothstep(0.22, 0.33 + uHeat * 0.05, rock);
  float lavaMask = clamp(crack + pool * 0.7, 0.0, 1.0);

  vec3 n = normalize(vNormalW);
  vec3 lightDir = normalize(vec3(0.6, 0.45, 0.75));
  float diffuse = max(dot(n, lightDir), 0.0) * 0.75 + 0.25;
  vec3 crust = mix(uCrustA, uCrustB, rock) * diffuse;

  float pulse = 0.75 + 0.25 * sin(uTime * 1.4 + rock * 9.0);
  vec3 lava = mix(uLavaA, uLavaB, clamp(crack * 0.55 + 0.1 * pulse, 0.0, 1.0)) * (0.7 + 0.5 * uHeat) * pulse;

  vec3 viewDir = normalize(cameraPosition - vWorld);
  float rim = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);

  vec3 color = mix(crust, lava, lavaMask) + uRim * rim * 0.55;
  gl_FragColor = vec4(color, 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}
`

export const GLOW_VERTEX = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vWorld;
void main() {
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorld = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const GLOW_FRAGMENT = /* glsl */ `
uniform vec3 uRim;
uniform float uHeat;
varying vec3 vNormalW;
varying vec3 vWorld;
void main() {
  vec3 viewDir = normalize(cameraPosition - vWorld);
  float edge = pow(max(dot(normalize(vNormalW), viewDir), 0.0), 2.2);
  float a = edge * (0.25 + 0.45 * uHeat);
  gl_FragColor = vec4(uRim * a, a);
  #include <colorspace_fragment>
}
`

export type PlanetUniforms = {
  uTime: { value: number }
  uHeat: { value: number }
  uCrustA: { value: Color }
  uCrustB: { value: Color }
  uLavaA: { value: Color }
  uLavaB: { value: Color }
  uRim: { value: Color }
}

export function createUniforms(palette: Palette, heat: number): PlanetUniforms {
  return {
    uTime: { value: 0 },
    uHeat: { value: heat },
    uCrustA: { value: new Color(palette.crustA) },
    uCrustB: { value: new Color(palette.crustB) },
    uLavaA: { value: new Color(palette.lavaA) },
    uLavaB: { value: new Color(palette.lavaB) },
    uRim: { value: new Color(palette.rim) },
  }
}

export function applyPalette(u: PlanetUniforms, palette: Palette): void {
  u.uCrustA.value.set(palette.crustA)
  u.uCrustB.value.set(palette.crustB)
  u.uLavaA.value.set(palette.lavaA)
  u.uLavaB.value.set(palette.lavaB)
  u.uRim.value.set(palette.rim)
}
