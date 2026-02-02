import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import SimplexNoise from './libs/SimplexNoise.js';

export function generateTerrain(scene) {
  const size = 2000;
  const segments = 200;

  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  const noise = new SimplexNoise();

  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const y = geometry.attributes.position.getY(i);
    const z = noise.noise2D(x/100, y/100) * 50;
    geometry.attributes.position.setZ(i, z);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ color: 0xdeb887 });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI/2;
  scene.add(terrain);

  const loader = new GLTFLoader();

  function placeModel(file, scale=1, count=20) {
    loader.load(`./assets/${file}`, gltf => {
      for (let i = 0; i < count; i++) {
        const model = gltf.scene.clone();
        model.scale.set(scale, scale, scale);
        const x = (Math.random() - 0.5) * size;
        const z = (Math.random() - 0.5) * size;
        const xIndex = Math.floor((x + size/2)/size * segments);
        const zIndex = Math.floor((z + size/2)/size * segments);
        const index = zIndex * (segments+1) + xIndex;
        const y = geometry.attributes.position.getZ(index) || 0;
        model.position.set(x, y, z);
        scene.add(model);
      }
    });
  }

  placeModel('tree.glb', 2, 50);
  placeModel('rock.glb', 1.5, 50);

  return terrain;
}
