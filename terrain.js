import * as THREE from './libs/three.module.js';
import SimplexNoise from './libs/SimplexNoise.js';

export function generateTerrain(scene) {
  const size = 2000;
  const segments = 200;

  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
  const noise = new SimplexNoise();

  // Add hills
  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const x = geometry.attributes.position.getX(i);
    const y = geometry.attributes.position.getY(i);
    const z = noise.noise2D(x/100, y/100) * 50; // height variation
    geometry.attributes.position.setZ(i, z);
  }
  geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ color: 0xdeb887 }); // desert brown
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI/2;
  scene.add(terrain);

  // Add some trees/rocks
  const treeGeom = new THREE.ConeGeometry(2, 10, 6);
  const treeMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
  for (let i = 0; i < 50; i++) {
    const tree = new THREE.Mesh(treeGeom, treeMat);
    tree.position.set(
      (Math.random() - 0.5) * size,
      0,
      (Math.random() - 0.5) * size
    );
    // adjust y based on terrain height
    const xIndex = Math.floor((tree.position.x + size/2)/size*segments);
    const yIndex = Math.floor((tree.position.z + size/2)/size*segments);
    const index = yIndex * (segments+1) + xIndex;
    tree.position.y = geometry.attributes.position.getZ(index);
    scene.add(tree);
  }

  return terrain;
}
