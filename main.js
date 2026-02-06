import * as THREE from 'three';
import { Car } from './car.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky Blue
scene.fog = new THREE.Fog(0x87CEEB, 10, 100);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(20, 50, 20);
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.5));

// Floor
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(1000, 1000),
    new THREE.MeshStandardMaterial({ color: 0x44aa44 })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// Obstacles
for(let i=0; i<50; i++) {
    const mesh = new THREE.Mesh(
        new THREE.BoxGeometry(2, 2, 2),
        new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff })
    );
    mesh.position.set((Math.random()-0.5)*150, 1, (Math.random()-0.5)*150);
    mesh.castShadow = true;
    scene.add(mesh);
}

const player = new Car(scene);
const keys = {};

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function animate() {
    requestAnimationFrame(animate);
    player.update(keys);

    const offset = new THREE.Vector3(0, 4, -8);
    offset.applyQuaternion(player.mesh.quaternion);
    const targetPos = player.mesh.position.clone().add(offset);
    
    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(player.mesh.position);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
