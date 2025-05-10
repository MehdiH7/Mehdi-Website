// Import Three.js
import * as THREE from 'three';

// Create scene, camera, and renderer
let scene, camera, renderer;
let particles, particleSystem;
let animationFrameId;
let lastScrollY = 0;

// Colors from your CSS variables
const colors = {
    primary: new THREE.Color('#1a73e8'),
    secondary: new THREE.Color('#615EFC'),
    accent: new THREE.Color('#7E8EF1')
};

// Configuration
const config = {
    particleCount: 300,
    particleSize: 0.08,
    particleMaxDistance: 12,
    cameraZ: 5,
    responsive: true,
    scrollSensitivity: 0.003
};

// Initialize the 3D scene
function init() {
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    const aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(75, aspectRatio, 0.1, 1000);
    camera.position.z = config.cameraZ;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true 
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // Add canvas to the page
    const container = document.getElementById('bg-canvas');
    container.appendChild(renderer.domElement);
    
    // Style the canvas container
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.zIndex = '-1';
    container.style.pointerEvents = 'none';
    
    // Create particles
    createParticles();
    
    // Set up event listeners
    window.addEventListener('resize', onWindowResize);
    window.addEventListener('scroll', onScroll);
    
    // Start animation loop
    animate();
}

// Create particles
function createParticles() {
    const particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(config.particleCount * 3);
    const colors = new Float32Array(config.particleCount * 3);
    
    for (let i = 0; i < config.particleCount; i++) {
        // Position
        const x = (Math.random() - 0.5) * 20;
        const y = (Math.random() - 0.5) * 20;
        const z = (Math.random() - 0.5) * 20;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Color (gradient from blue to purple)
        const ratio = Math.random();
        const color = new THREE.Color().lerpColors(
            new THREE.Color('#1a73e8'),  // Primary color
            new THREE.Color('#615EFC'),  // Secondary color
            ratio
        );
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create particle material
    const particleMaterial = new THREE.PointsMaterial({
        size: config.particleSize,
        sizeAttenuation: true,
        vertexColors: true,
        transparent: true,
        opacity: 0.6
    });
    
    // Create particle system
    particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);
    
    // Create connections between particles
    createConnections();
}

// Create connections between particles that are close to each other
function createConnections() {
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({ 
        color: 0x1a73e8, 
        opacity: 0.1,
        transparent: true
    });
    
    // This will be updated in the animation loop
    const linePositions = new Float32Array(config.particleCount * 6); // 2 points per line * 3 coordinates
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    // Add the lines to the scene
    particles = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(particles);
}

// Handle window resize
function onWindowResize() {
    if (!config.responsive) return;
    
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Handle scroll events
function onScroll() {
    const scrollY = window.scrollY;
    const delta = scrollY - lastScrollY;
    
    // Rotate particle system based on scroll
    if (particleSystem) {
        particleSystem.rotation.x += delta * config.scrollSensitivity;
        particleSystem.rotation.y += delta * config.scrollSensitivity * 0.5;
    }
    
    lastScrollY = scrollY;
}

// Animation loop
function animate() {
    animationFrameId = requestAnimationFrame(animate);
    
    // Slowly rotate particles
    if (particleSystem) {
        particleSystem.rotation.y += 0.0005;
    }
    
    // Update particle connections
    updateConnections();
    
    // Render
    renderer.render(scene, camera);
}

// Update connections between particles based on distance
function updateConnections() {
    if (!particles || !particleSystem) return;
    
    const positions = particleSystem.geometry.attributes.position.array;
    const linePositions = particles.geometry.attributes.position.array;
    
    let lineIndex = 0;
    
    // Clear previous connections
    for (let i = 0; i < linePositions.length; i++) {
        linePositions[i] = 0;
    }
    
    // Create new connections
    for (let i = 0; i < config.particleCount; i++) {
        const x1 = positions[i * 3];
        const y1 = positions[i * 3 + 1];
        const z1 = positions[i * 3 + 2];
        
        for (let j = i + 1; j < config.particleCount; j++) {
            const x2 = positions[j * 3];
            const y2 = positions[j * 3 + 1];
            const z2 = positions[j * 3 + 2];
            
            // Calculate distance
            const dx = x1 - x2;
            const dy = y1 - y2;
            const dz = z1 - z2;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // If particles are close, draw a line between them
            if (distance < config.particleMaxDistance) {
                // Skip more connections for performance and subtlety
                if (Math.random() > 0.02) continue;
                
                // First point
                linePositions[lineIndex++] = x1;
                linePositions[lineIndex++] = y1;
                linePositions[lineIndex++] = z1;
                
                // Second point
                linePositions[lineIndex++] = x2;
                linePositions[lineIndex++] = y2;
                linePositions[lineIndex++] = z2;
            }
        }
    }
    
    particles.geometry.attributes.position.needsUpdate = true;
}

// Clean up resources when navigating away
function cleanup() {
    window.removeEventListener('resize', onWindowResize);
    window.removeEventListener('scroll', onScroll);
    cancelAnimationFrame(animationFrameId);
    
    if (scene) {
        scene.clear();
    }
    
    if (renderer) {
        renderer.dispose();
    }
}

// Initialize when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Delay initialization slightly to allow the page to load
    setTimeout(init, 2000); // Wait for the loading animation to complete
});

// Clean up when navigating away
window.addEventListener('beforeunload', cleanup); 