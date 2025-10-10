import {
  BufferGeometry,
  Cache,
  Float32BufferAttribute,
  Group,
  Node,
  Vector3,
  type DataTexture,
  type Object3DEventMap,
} from 'three/webgpu';
import { add, mul, ShaderNodeObject } from 'three/tsl';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EXRLoader } from 'three/examples/jsm/loaders/EXRLoader.js';

Cache.enabled = true;

const exrLoader = new EXRLoader();

export async function loadEnvironment(path: string): Promise<DataTexture> {
  return await exrLoader.loadAsync(path);
}

const gltfLoader = new GLTFLoader();

export async function loadModel(path: string): Promise<Group<Object3DEventMap>> {
  const model = await gltfLoader.loadAsync(path);

  return model.scene;
}

// https://www.desmos.com/calculator/niymgzgvov
export const quadraticCurve = (
  x: ShaderNodeObject<Node>,
  a: number,
  p: number,
  q: number,
) => add(mul(a, x.sub(p).pow2()), q);

export function createArcStrip(
  radius: number,
  center: Vector3,
  thickness: number = 0.03,
  segments: number = 128,
): BufferGeometry {
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];

  const startAngle = -Math.PI / 2;
  const endAngle = Math.PI / 2;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = startAngle + t * (endAngle - startAngle);

    const x = Math.cos(angle) * radius + center.x;
    const z = Math.sin(angle) * radius + center.z;
    const y = 0;

    positions.push(x, y, z);
    positions.push(
      Math.cos(angle) * (radius + thickness) + center.x,
      y,
      Math.sin(angle) * (radius + thickness) + center.z,
    );

    uvs.push(t, 0);
    uvs.push(t, 1);
  }

  for (let i = 0; i < segments * 2; i += 2) {
    indices.push(i, i + 1, i + 2);
    indices.push(i + 1, i + 3, i + 2);
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);

  return geometry;
}
