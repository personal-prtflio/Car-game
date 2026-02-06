import * as THREE from 'three';
import { Car } from './car.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

// --- MAIN SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);
scene.fog = new THREE.Fog(0x87CEEB, 20, 150);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.autoClear = false; // Required for rendering minimap overlay
document.body.appendChild(renderer.domElement);

// --- MINIMAP CAMERA (Top-Down) ---
const mapSize = 200;
const minimapCamera = new THREE.OrthographicCamera(-mapSize/2, mapSize/2, mapSize/2, -mapSize/2, 1, 1000);
minimapCamera.position.set(0, 100, 0);
minimapCamera.lookAt(0, 0, 0);

// --- LIGHTING ---
const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(50, 50, 50);
light.castShadow = true;
scene.add(light);
scene.add(new THREE.AmbientLight(0xffffff, 0.4));

// --- TERRAIN ---
const textureLoader = new THREE.TextureLoader();
const groundTexture = textureLoader.load('terrain.png');
groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
groundTexture.repeat.set(20, 20);

const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(400, 400),
    new THREE.MeshStandardMaterial({ map: groundTexture })
);
floor.rotation.x = -Math.PI / 2;
floor.receiveShadow = true;
scene.add(floor);

// --- LOAD ROCK & TREE ---
const gltfLoader = new GLTFLoader();
const spawn = (path, count, scaleRange) => {
    gltfLoader.load(path, (gltf) => {
        for(let i=0; i<count; i++) {
            const item = gltf.scene.clone();
            const x = (Math.random()-0.5)*300;
            const z = (Math.random()-0.5)*300;
            if(Math.sqrt(x*x+z*z) < 15) continue;
            const s = scaleRange[0] + Math.random()*scaleRange[1];
            item.scale.set(s,s,s);
            item.position.set(x, 0, z);
            item.traverse(n => { if(n.isMesh) n.castShadow = true; });
            scene.add(item);
        }
    });
};
spawn('tree.glb', 40, [0.5, 1]);
spawn('rock.glb', 25, [0.3, 0.6]);

// --- 3D TEXT ---
const fontLoader = new FontLoader();
fontLoader.load('https://unpkg.com/three@0.160.0/examples/fonts/helvetiker_regular.typeface.json', (font) => {
    const textGeo = new TextGeometry('Welcome to My simple 3D world', { font: font, size: 3, height: 0.5 });
    const textMesh = new THREE.Mesh(textGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));
    textMesh.position.set(-30, 8, -40);
    textMesh.castShadow = true;
    scene.add(textMesh);
});

// --- PLAYER ---
const player = new Car(scene);
const keys = {};
window.addEventListener('keydown', (e) => keys[e.key.toLowerCase()] = true);
window.addEventListener('keyup', (e) => keys[e.key.toLowerCase()] = false);

// --- GAME LOOP ---
function animate() {
    requestAnimationFrame(animate);
    player.update(keys);

    // Main Camera Follow
    const offset = new THREE.Vector3(0, 5, -12);
    offset.applyQuaternion(player.mesh.quaternion);
    const targetPos = player.mesh.position.clone().add(offset);
    camera.position.lerp(targetPos, 0.1);
    camera.lookAt(player.mesh.position);

    // Minimap Camera Follow
    minimapCamera.position.x = player.mesh.position.x;
    minimapCamera.position.z = player.mesh.position.z;

    // 1. Render Main Scene
    renderer.setViewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();
    renderer.render(scene, camera);

    // 2. Render Minimap (Bottom-Right Corner)
    const mapUI = 200; // Pixel size of minimap
    renderer.setScissorTest(true);
    renderer.setScissor(window.innerWidth - mapUI - 20, 20, mapUI, mapUI);
    renderer.setViewport(window.innerWidth - mapUI - 20, 20, mapUI, mapUI);
    renderer.render(scene, minimapCamera);
    renderer.setScissorTest(false);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
