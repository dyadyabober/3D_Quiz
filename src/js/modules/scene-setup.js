// Scene Setup Module - Three.js scene initialization

let world, cam, render;

function setupThree() {
    world = new THREE.Scene();
    cam = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    render = new THREE.WebGLRenderer({ 
        antialias: window.devicePixelRatio <= 1,
        alpha: false,
        powerPreference: "high-performance"
    });
    
    render.setSize(window.innerWidth, window.innerHeight);
    render.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    render.setClearColor(0x000000, 1);
    render.shadowMap.enabled = false;
    
    document.getElementById('mainCanvas').appendChild(render.domElement);

    cam.position.set(0, 2, 5);
    cam.lookAt(0, 0, 0);

    // Setup lighting
    const light = new THREE.AmbientLight(0x404040, 0.8);
    world.add(light);
}

function onResize() {
    cam.aspect = window.innerWidth / window.innerHeight;
    cam.updateProjectionMatrix();
    render.setSize(window.innerWidth, window.innerHeight);
}