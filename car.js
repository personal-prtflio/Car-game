import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Car {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.velocity = 0;
        
        // Physics constants
        this.acceleration = 0.015;
        this.friction = 0.97;
        this.maxSpeed = 0.6;
        this.turnSpeed = 0.04;

        this.init();
    }

    init() {
        const loader = new GLTFLoader();
        loader.load('car.glb', (gltf) => {
            const model = gltf.scene;
            model.traverse(n => { if(n.isMesh) n.castShadow = true; });
            this.mesh.add(model);
            document.getElementById('loading').style.display = 'none';
        }, undefined, (err) => {
            // Fallback if car.glb is missing
            const box = new THREE.Mesh(
                new THREE.BoxGeometry(1.2, 0.6, 2.5),
                new THREE.MeshStandardMaterial({ color: 0x00ffcc })
            );
            this.mesh.add(box);
            document.getElementById('loading').innerHTML = "Model not found - using placeholder";
        });
        this.scene.add(this.mesh);
    }

    reset() {
        this.velocity = 0;
        this.mesh.position.set(0, 0, 0);
        this.mesh.rotation.set(0, 0, 0); // Flips car upright
    }

    update(keys) {
        if (keys['r']) this.reset();

        if (keys['w'] || keys['arrowup']) this.velocity += this.acceleration;
        if (keys['s'] || keys['arrowdown']) this.velocity -= this.acceleration;
        
        this.velocity *= this.friction;
        if (keys[' ']) this.velocity *= 0.8;

        this.velocity = Math.max(Math.min(this.velocity, this.maxSpeed), -this.maxSpeed/2);

        if (Math.abs(this.velocity) > 0.01) {
            const direction = this.velocity > 0 ? 1 : -1;
            if (keys['a'] || keys['arrowleft']) this.mesh.rotation.y += this.turnSpeed * direction;
            if (keys['d'] || keys['arrowright']) this.mesh.rotation.y -= this.turnSpeed * direction;
        }

        this.mesh.position.x += Math.sin(this.mesh.rotation.y) * this.velocity;
        this.mesh.position.z += Math.cos(this.mesh.rotation.y) * this.velocity;
    }
}
