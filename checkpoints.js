import * as THREE from './libs/three.module.js';

export class CheckpointSystem {
  constructor(scene) {
    this.scene = scene;
    this.checkpoints = [];
    this.current = 0;
  }

  addCheckpoint(position) {
    const geometry = new THREE.SphereGeometry(5, 16, 16);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe:true });
    const checkpoint = new THREE.Mesh(geometry, material);
    checkpoint.position.copy(position);
    this.scene.add(checkpoint);
    this.checkpoints.push(checkpoint);
  }

  checkCar(car) {
    if (this.checkpoints.length === 0) return;
    const cp = this.checkpoints[this.current];
    const distance = car.position.distanceTo(cp.position);
    if (distance < 7) {
      cp.material.color.set(0x00ff00);
      this.current++;
      console.log(`Checkpoint ${this.current} reached!`);
    }
  }
}
