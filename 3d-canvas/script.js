// Import Three.js modules
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Initialize Three.js scene
let scene, camera, renderer, controls;
let currentObject = null;
let fpsCounter = document.getElementById('fps-counter');
let loader = document.getElementById('loader');
let lastTime = 0;
let frameCount = 0;

// Create procedural textures
function createProceduralTexture(baseColor, patternColor, patternType) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Fill with base color
    context.fillStyle = baseColor;
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.fillStyle = patternColor;
    
    // Create different patterns based on type
    switch(patternType) {
        case 'grid':
            // Draw grid pattern
            const gridSize = 32;
            const lineWidth = 2;
            for (let x = 0; x < canvas.width; x += gridSize) {
                context.fillRect(x, 0, lineWidth, canvas.height);
            }
            for (let y = 0; y < canvas.height; y += gridSize) {
                context.fillRect(0, y, canvas.width, lineWidth);
            }
            break;
            
        case 'dots':
            // Draw dot pattern
            const dotSpacing = 32;
            const dotRadius = 5;
            for (let x = dotSpacing; x < canvas.width; x += dotSpacing) {
                for (let y = dotSpacing; y < canvas.height; y += dotSpacing) {
                    context.beginPath();
                    context.arc(x, y, dotRadius, 0, Math.PI * 2);
                    context.fill();
                }
            }
            break;
            
        case 'noise':
            // Create noise pattern
            for (let i = 0; i < 5000; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                const size = 1 + Math.random() * 2;
                context.fillRect(x, y, size, size);
            }
            break;
    }
    
    return new THREE.CanvasTexture(canvas);
}

// Generate textures
const textures = {
    metal: createProceduralTexture('#555555', '#999999', 'grid'),
    wood: createProceduralTexture('#8B4513', '#A0522D', 'noise'),
    brick: createProceduralTexture('#A52A2A', '#8B0000', 'dots')
};

// Materials and properties
const materials = {
    standard: new THREE.MeshStandardMaterial({
        color: 0x3498db,
        metalness: 0.3,
        roughness: 0.4
    }),
    wireframe: new THREE.MeshBasicMaterial({
        color: 0x00ff00,
        wireframe: true
    }),
    phong: new THREE.MeshPhongMaterial({
        color: 0xff5252,
        shininess: 100,
        specular: 0xffffff
    }),
    textured: {
        metal: new THREE.MeshStandardMaterial({
            map: textures.metal,
            metalness: 0.7,
            roughness: 0.3
        }),
        wood: new THREE.MeshStandardMaterial({
            map: textures.wood,
            metalness: 0.1,
            roughness: 0.8
        }),
        brick: new THREE.MeshStandardMaterial({
            map: textures.brick,
            metalness: 0.1,
            roughness: 0.9
        })
    }
};

// Initialize the scene
function init() {
    // Show loader
    loader.style.display = 'block';

    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);

    // Create camera
    camera = new THREE.PerspectiveCamera(
        75,                                     // Field of view
        window.innerWidth / window.innerHeight, // Aspect ratio
        0.1,                                    // Near clipping plane
        1000                                    // Far clipping plane
    );
    camera.position.z = 5;

    // Create renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    // Add orbit controls (using the imported OrbitControls)
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    // Add lights
    addLights();

    // Add initial cube
    createCube();

    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    document.getElementById('cube-btn').addEventListener('click', createCube);
    document.getElementById('sphere-btn').addEventListener('click', createSphere);
    document.getElementById('torus-btn').addEventListener('click', createTorus);

    // Add double-click event for switching textures
    renderer.domElement.addEventListener('dblclick', switchTexture);

    // Hide loader
    setTimeout(() => {
        loader.style.display = 'none';
    }, 1000);

    // Start animation loop
    animate();
}

// Add lights to the scene
function addLights() {
    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Directional light
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    // Point light
    const pointLight = new THREE.PointLight(0xffaa00, 1, 100);
    pointLight.position.set(-5, 0, 5);
    scene.add(pointLight);
}

// Create a cube
function createCube() {
    removeCurrentObject();
    
    // Show loader while creating object
    loader.style.display = 'block';
    
    const geometry = new THREE.BoxGeometry(2, 2, 2);
    currentObject = new THREE.Mesh(geometry, materials.textured.wood);
    currentObject.castShadow = true;
    scene.add(currentObject);

    // Add animation data
    currentObject.userData.animation = {
        rotationSpeed: {
            x: 0.01,
            y: 0.02,
            z: 0
        }
    };
    
    // Add object type for texture switching
    currentObject.userData.type = 'cube';
    
    // Hide loader
    setTimeout(() => {
        loader.style.display = 'none';
    }, 300);
}

// Create a sphere
function createSphere() {
    removeCurrentObject();
    
    // Show loader while creating object
    loader.style.display = 'block';
    
    const geometry = new THREE.SphereGeometry(1.5, 32, 32);
    currentObject = new THREE.Mesh(geometry, materials.textured.metal);
    currentObject.castShadow = true;
    scene.add(currentObject);

    // Add animation data
    currentObject.userData.animation = {
        rotationSpeed: {
            x: 0.01,
            y: 0.01,
            z: 0.01
        }
    };
    
    // Add object type for texture switching
    currentObject.userData.type = 'sphere';
    
    // Hide loader
    setTimeout(() => {
        loader.style.display = 'none';
    }, 300);
}

// Create a torus
function createTorus() {
    removeCurrentObject();
    
    // Show loader while creating object
    loader.style.display = 'block';
    
    const geometry = new THREE.TorusGeometry(1, 0.4, 16, 100);
    currentObject = new THREE.Mesh(geometry, materials.textured.brick);
    currentObject.castShadow = true;
    scene.add(currentObject);

    // Add animation data
    currentObject.userData.animation = {
        rotationSpeed: {
            x: 0.02,
            y: 0,
            z: 0.01
        }
    };
    
    // Add object type for texture switching
    currentObject.userData.type = 'torus';
    
    // Hide loader
    setTimeout(() => {
        loader.style.display = 'none';
    }, 300);
}

// Switch textures on double-click
function switchTexture(event) {
    if (!currentObject) return;
    
    const textureNames = Object.keys(materials.textured);
    let currentTexture = '';
    
    // Determine current texture
    for (let i = 0; i < textureNames.length; i++) {
        if (currentObject.material.map === materials.textured[textureNames[i]].map) {
            currentTexture = textureNames[i];
            break;
        }
    }
    
    // Get next texture
    let nextTextureIndex = textureNames.indexOf(currentTexture) + 1;
    if (nextTextureIndex >= textureNames.length) nextTextureIndex = 0;
    const nextTextureName = textureNames[nextTextureIndex];
    
    // Apply new texture
    currentObject.material = materials.textured[nextTextureName];
    
    // Display texture name temporarily
    const textureInfo = document.createElement('div');
    textureInfo.style.position = 'absolute';
    textureInfo.style.top = '50%';
    textureInfo.style.left = '50%';
    textureInfo.style.transform = 'translate(-50%, -50%)';
    textureInfo.style.background = 'rgba(0, 0, 0, 0.7)';
    textureInfo.style.color = 'white';
    textureInfo.style.padding = '10px 20px';
    textureInfo.style.borderRadius = '5px';
    textureInfo.style.zIndex = '1000';
    textureInfo.innerText = `Texture: ${nextTextureName}`;
    document.body.appendChild(textureInfo);
    
    setTimeout(() => {
        document.body.removeChild(textureInfo);
    }, 1500);
}

// Remove current object
function removeCurrentObject() {
    if (currentObject) {
        scene.remove(currentObject);
        currentObject.geometry.dispose();
        currentObject.material.dispose();
    }
}

// Handle window resize
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Calculate and update FPS
function updateFPS() {
    frameCount++;
    
    const now = performance.now();
    const delta = now - lastTime;
    
    if (delta >= 1000) {
        const fps = Math.round((frameCount * 1000) / delta);
        fpsCounter.textContent = `FPS: ${fps}`;
        
        frameCount = 0;
        lastTime = now;
    }
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Rotate the current object
    if (currentObject && currentObject.userData.animation) {
        const speed = currentObject.userData.animation.rotationSpeed;
        currentObject.rotation.x += speed.x;
        currentObject.rotation.y += speed.y;
        currentObject.rotation.z += speed.z;
    }
    
    // Update FPS counter
    updateFPS();
    
    // Render the scene
    renderer.render(scene, camera);
}

// Start the application
window.addEventListener('DOMContentLoaded', init); 