import * as THREE from './libs/three.module.js';
import { GLTFLoader } from './libs/GLTFLoader.js';
import { generateTerrain } from './terrain.js';
import { CheckpointSystem } from './checkpoints.js';

// --- Scene & Renderer ---
const canvas = document.getElementById('gameCanvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);

const camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 2000);
camera.position.set(0, 5, -10);

const renderer = new THREE.WebGLRenderer({ canvas, antialias:true });
renderer.setSize(innerWidth, innerHeight);
document.body.appendChild(renderer.domElement);

// --- Lighting ---
const hemi = new THREE.HemisphereLight(0xffffff, 0x444444, 1.2);
hemi.position.set(0,50,0);
scene.add(hemi);
const dir = new THREE.DirectionalLight(0xffffff, 0.6);
dir.position.set(-3,10,-10);
scene.add(dir);

// --- Terrain ---
generateTerrain(scene);

// --- Checkpoints ---
const checkpoints = new CheckpointSystem(scene);
checkpoints.addCheckpoint(new THREE.Vector3(50,0,50));
checkpoints.addCheckpoint(new THREE.Vector3(-100,0,200));
checkpoints.addCheckpoint(new THREE.Vector3(200,0,-150));

// --- Car ---
let car;
const loader = new GLTFLoader();
loader.load('./assets/car.glb', gltf => { // <--- path updated
  car = gltf.scene;
  car.scale.set(1.5,1.5,1.5);
  car.position.set(0,10,0); // start above terrain
  scene.add(car);
});

// --- Controls ---
const keys = {};
const speed = { forward: 0, turn: 0 };
window.addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

function updateCar(dt) {
  if (!car) return;
  // Movement
  if (keys['w']) speed.forward = 0.08;
  else if (keys['s']) speed.forward = -0.05;
  else speed.forward *= 0.9;

  if (keys['a']) speed.turn = 0.04;
  else if (keys['d']) speed.turn = -0.04;
  else speed.turn *= 0.8;

  car.rotation.y += speed.turn;
  const forwardVec = new THREE.Vector3(0,0,1).applyQuaternion(car.quaternion).multiplyScalar(-speed.forward);
  car.position.add(forwardVec);

  // Camera follow
  const camOffset = new THREE.Vector3(0,5,-10).applyQuaternion(car.quaternion);
  camera.position.copy(car.position.clone().add(camOffset));
  camera.lookAt(car.position);

  // Checkpoints
  checkpoints.checkCar(car);
}

// --- Animate ---
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();
  updateCar(dt);
  renderer.render(scene, camera);
}
animate();
