import * as THREE from 'three';
import { Car } from './car.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 20, 150);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(50, 50, 50);
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// --- TERRAIN WITH TEXTURE ---
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('terrain.png');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(25, 25); // Tiles the image across the floor

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ map: groundTexture })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// --- LOAD ROCK & TREE MODELS ---
const gltfLoader = new GLTFLoader();

function spawnNature(modelPath, count, scaleRange) {
    gltfLoader.load(modelPath, (gltf) => {
        for(let i = 0; i < count; i++) {
            const instance = gltf.scene.clone();
            const x = (Math.random() - 0.5) * 300;
            const z = (Math.random() - 0.5) * 300;
            
            // Avoid spawning on the starting point (0,0)
            if (Math.sqrt(x*x + z*z) < 10) continue;

            const s = scaleRange[0] + Math.random() * scaleRange[1];
            instance.scale.set(s, s, s);
            instance.position.set(x, 0, z);
            instance.rotation.y = Math.random() * Math.PI;
            
            instance.traverse(n => { if(n.isMesh) n.castShadow = true; });
            scene.add(instance);
        }
    });
}

spawnNature('tree.glb', 40, [0.5, 1.5]);
spawnNature('rock.glb', 30, [0.2, 0.8]);

// --- 3D WELCOME TEXT ---
const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeo = new TextGeometry('Welcome to My simple 3D world', {
        font: font,
        size: 3,
        height: 1,
    });
    const textMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const textMesh = new THREE.Mesh(textGeo, textMat);
    
    // Position the text somewhere visible
    textMesh.position.set(-25, 5, -30); 
    textMesh.castShadow = true;
    scene.add(textMesh);
});

// --- PLAYER & LOOP ---
const player = new Car(scene);
const keys = {};

window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

function animate() {
    requestAnimationFrame(animate);
    player.update(keys);

    const offset = new THREE.Vector3(0, 5, -12);
    offset.applyQuaternion(player.mesh.quaternion);
    const targetPos = player.mesh.position.clone().add(offset);
    
    camera.position.lerp(targetPos, 0.08);
    camera.lookAt(player.mesh.position);

    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
