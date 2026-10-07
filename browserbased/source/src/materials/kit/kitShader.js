import { ShaderMaterial, AdditiveBlending, NormalBlending, DoubleSide, Color, Vector3 } from 'three';
import { noiseGLSL } from '../../shaders/lib/noise.glsl.js';
import { commonGLSL } from '../../shaders/lib/common.glsl.js';
import { sharedUniforms } from '../../core/FrameUniforms.js';

/**
 * The uniform block every kit material shares.
 *
 * The first five abilities each grew their own list; the kit abilities all
 * need the same cast frame (origin, heading, lateral, length, target), the same
 * clocks (age, time since landing, fade) and the same three-colour palette, so
 * it is declared once. `KitAbility#syncKit` fills it from the live settings on
 * every frame — paused frames included — which is what keeps the editor rule.
 */
export const KIT_PRELUDE = /* glsl */ `
  #define PI  3.141592653589793
  #define TAU 6.283185307179586

  uniform float uTime;
  uniform float uAge;        // seconds since the cast
  uniform float uHold;       // seconds since it landed (0 while travelling)
  uniform float uFade;       // 1 while alive, → 0 through the fade
  uniform float uProgress;   // 0..1 of the travelling front
  uniform float uFront;      // metres the front has travelled
  uniform float uSeed;
  uniform float uIntensity;
  uniform float uOpacity;
  uniform float uGlow;
  uniform float uGlobalGlow;
  uniform float uShaderIntensity;
  uniform float uLength;
  uniform float uRadius;     // zoneRadius for far casts
  uniform vec3  uOrigin;
  uniform vec3  uDir;
  uniform vec3  uSide;
  uniform vec3  uCenter;     // far end of the cast line, on the floor
  uniform vec3  uColorA;
  uniform vec3  uColorB;
  uniform vec3  uColorC;
  uniform vec3  uLightDir;

  ${noiseGLSL}

  /** Camera-facing offset for a path point with the given tangent. */
  vec3 faceCamera(vec3 p, vec3 tangent) {
    vec3 camPos = cameraPosition;
    vec3 toCam = normalize(camPos - p);
    vec3 w = cross(normalize(tangent + vec3(1e-5)), toCam);
    return normalize(w + vec3(1e-5));
  }

  /** A point on the cast line, s in 0..1, lifted to height h. */
  vec3 linePoint(float s, float h) {
    return uOrigin + uDir * (s * uLength) + vec3(0.0, h, 0.0);
  }
`;

/**
 * Build a kit ShaderMaterial.
 *
 * @param {object} o
 * @param {string} o.vertexShader   body appended after the prelude
 * @param {string} o.fragmentShader body appended after the prelude
 * @param {object} [o.uniforms]     extra uniforms
 * @param {boolean} [o.additive]
 * @param {boolean} [o.depthWrite]
 * @param {boolean} [o.transparent]
 * @param {number} [o.side]
 * @param {object} [o.defines]
 */
export function createKitMaterial({
  vertexShader,
  fragmentShader,
  uniforms = {},
  additive = true,
  depthWrite = false,
  transparent = true,
  side = DoubleSide,
  defines = {}
}) {
  return new ShaderMaterial({
    defines,
    transparent,
    depthWrite,
    depthTest: true,
    side,
    blending: additive ? AdditiveBlending : NormalBlending,
    toneMapped: false,
    uniforms: sharedUniforms({
      uAge: { value: 0 },
      uHold: { value: 0 },
      uFade: { value: 1 },
      uProgress: { value: 0 },
      uFront: { value: 0 },
      uSeed: { value: 0 },
      uIntensity: { value: 1 },
      uOpacity: { value: 1 },
      uGlow: { value: 1 },
      uLength: { value: 1 },
      uRadius: { value: 1 },
      uOrigin: { value: new Vector3() },
      uDir: { value: new Vector3(0, 0, 1) },
      uSide: { value: new Vector3(1, 0, 0) },
      uCenter: { value: new Vector3() },
      uColorA: { value: new Color() },
      uColorB: { value: new Color() },
      uColorC: { value: new Color() },
      ...uniforms
    }),
    vertexShader: `${KIT_PRELUDE}\n${vertexShader}`,
    // The common chunk uses derivatives, so it is fragment-only.
    fragmentShader: `${KIT_PRELUDE}\n${commonGLSL}\n${fragmentShader}`
  });
}
