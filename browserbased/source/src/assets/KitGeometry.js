import {
  BufferAttribute,
  BufferGeometry,
  InstancedBufferAttribute,
  InstancedBufferGeometry,
  Sphere,
  Vector3
} from 'three';

/**
 * Parameter-space geometry for the kit abilities.
 *
 * This generalises the trick `createBoltRibbonGeometry` and
 * `createBeamTubeGeometry` already use: a mesh carries no metres at all, only a
 * `(u, v)` pair per vertex in 0..1, and the vertex shader decides what surface
 * that pair lies on this frame. The same grid is a ribbon when `nv = 2`, a tube
 * when `v` is read as an angle, a disc when `u` is read as a radius, a dome when
 * both are read as spherical angles — so one generator serves every kit effect,
 * and every dimension of every effect stays a live slider.
 *
 * `aIndex` is the instance number; shaders derive per-instance seeds from it.
 *
 * @param {number} nu        samples along u
 * @param {number} nv        samples along v
 * @param {number} instances instance capacity (the live count is `instanceCount`)
 */
export function createParamGrid(nu = 64, nv = 2, instances = 1) {
  const su = Math.max(2, Math.round(nu));
  const sv = Math.max(2, Math.round(nv));
  const positions = new Float32Array(su * sv * 3);
  let p = 0;
  for (let i = 0; i < su; i++) {
    const u = i / (su - 1);
    for (let j = 0; j < sv; j++) {
      positions[p++] = u;
      positions[p++] = j / (sv - 1);
      positions[p++] = 0;
    }
  }

  const IndexArray = su * sv > 65535 ? Uint32Array : Uint16Array;
  const indices = new IndexArray((su - 1) * (sv - 1) * 6);
  let k = 0;
  for (let i = 0; i < su - 1; i++) {
    for (let j = 0; j < sv - 1; j++) {
      const a = i * sv + j;
      const b = a + sv;
      indices[k++] = a;
      indices[k++] = b;
      indices[k++] = a + 1;
      indices[k++] = b;
      indices[k++] = b + 1;
      indices[k++] = a + 1;
    }
  }

  return finish(positions, indices, instances);
}

/**
 * A unit quad per instance (corners at ±0.5), for camera-facing billboards —
 * orbs, falling stars — whose centre the vertex shader computes.
 */
export function createInstancedQuad(instances = 1) {
  const positions = new Float32Array([-0.5, -0.5, 0, 0.5, -0.5, 0, 0.5, 0.5, 0, -0.5, 0.5, 0]);
  const indices = new Uint16Array([0, 1, 2, 0, 2, 3]);
  return finish(positions, indices, instances);
}

/**
 * Take any ordinary geometry (a cone, a spear) and make it instanceable with
 * `aIndex`, so its placement can be done in the vertex shader too.
 */
export function instanceGeometry(source, instances = 1) {
  const geometry = new InstancedBufferGeometry();
  geometry.index = source.index;
  for (const [name, attribute] of Object.entries(source.attributes)) {
    geometry.setAttribute(name, attribute);
  }
  addIndex(geometry, instances);
  return geometry;
}

function finish(positions, indices, instances) {
  const geometry = new InstancedBufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setIndex(new BufferAttribute(indices, 1));
  addIndex(geometry, instances);
  return geometry;
}

function addIndex(geometry, instances) {
  const count = Math.max(1, Math.round(instances));
  const index = new Float32Array(count);
  for (let i = 0; i < count; i++) index[i] = i;
  geometry.setAttribute('aIndex', new InstancedBufferAttribute(index, 1));
  geometry.instanceCount = count;
  // Placed in world space by the vertex shader — its own bounds mean nothing.
  geometry.boundingSphere = new Sphere(new Vector3(), 1e4);
}

/** Plain (non-instanced) helper kept for symmetry with three's API. */
export function emptyGeometry() {
  return new BufferGeometry();
}
