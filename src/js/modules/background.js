// Background Module - Stars and particles

let stars = [];
let clouds = [];

function makeBackground() {
    createFarStars();
    createNearStars();
    createClouds();
}

function createFarStars() {
    const farGeo = new THREE.BufferGeometry();
    const farCount = 800;
    const farPos = new Float32Array(farCount * 3);
    const farSize = new Float32Array(farCount);
    
    for (let i = 0; i < farCount; i++) {
        farPos[i * 3] = (Math.random() - 0.5) * 200;
        farPos[i * 3 + 1] = (Math.random() - 0.5) * 100;
        farPos[i * 3 + 2] = (Math.random() - 0.5) * 200 - 50;
        farSize[i] = Math.random() * 2 + 0.5;
    }
    
    farGeo.setAttribute('position', new THREE.BufferAttribute(farPos, 3));
    farGeo.setAttribute('size', new THREE.BufferAttribute(farSize, 1));
    
    const farMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0x8888ff) }
        },
        vertexShader: `
            attribute float size;
            uniform float time;
            varying float vAlpha;
            
            void main() {
                vAlpha = 0.3 + 0.7 * sin(time * 0.5 + position.x * 0.01);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                float alpha = (1.0 - r * 2.0) * vAlpha;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const farStars = new THREE.Points(farGeo, farMat);
    world.add(farStars);
    stars.push({ points: farStars, speed: 0.2, material: farMat });
}

function createNearStars() {
    const nearGeo = new THREE.BufferGeometry();
    const nearCount = 400;
    const nearPos = new Float32Array(nearCount * 3);
    const nearSize = new Float32Array(nearCount);
    
    for (let i = 0; i < nearCount; i++) {
        nearPos[i * 3] = (Math.random() - 0.5) * 120;
        nearPos[i * 3 + 1] = (Math.random() - 0.5) * 60;
        nearPos[i * 3 + 2] = (Math.random() - 0.5) * 120 - 20;
        nearSize[i] = Math.random() * 3 + 1;
    }
    
    nearGeo.setAttribute('position', new THREE.BufferAttribute(nearPos, 3));
    nearGeo.setAttribute('size', new THREE.BufferAttribute(nearSize, 1));
    
    const nearMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            color: { value: new THREE.Color(0xffffff) }
        },
        vertexShader: `
            attribute float size;
            uniform float time;
            varying float vAlpha;
            
            void main() {
                vAlpha = 0.5 + 0.5 * sin(time * 1.2 + position.y * 0.02);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 color;
            varying float vAlpha;
            
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                float alpha = (1.0 - r * 2.0) * vAlpha;
                gl_FragColor = vec4(color, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const nearStars = new THREE.Points(nearGeo, nearMat);
    world.add(nearStars);
    stars.push({ points: nearStars, speed: 0.5, material: nearMat });
}

function createClouds() {
    const cloudGeo = new THREE.BufferGeometry();
    const cloudCount = 300;
    const cloudPos = new Float32Array(cloudCount * 3);
    const cloudSize = new Float32Array(cloudCount);
    const cloudColors = new Float32Array(cloudCount * 3);
    
    for (let i = 0; i < cloudCount; i++) {
        cloudPos[i * 3] = (Math.random() - 0.5) * 150;
        cloudPos[i * 3 + 1] = (Math.random() - 0.5) * 80;
        cloudPos[i * 3 + 2] = (Math.random() - 0.5) * 150 - 30;
        cloudSize[i] = Math.random() * 8 + 3;
        
        const pick = Math.random();
        if (pick < 0.33) {
            cloudColors[i * 3] = 0.8;
            cloudColors[i * 3 + 1] = 0.2;
            cloudColors[i * 3 + 2] = 1.0;
        } else if (pick < 0.66) {
            cloudColors[i * 3] = 1.0;
            cloudColors[i * 3 + 1] = 0.3;
            cloudColors[i * 3 + 2] = 0.8;
        } else {
            cloudColors[i * 3] = 0.3;
            cloudColors[i * 3 + 1] = 0.8;
            cloudColors[i * 3 + 2] = 1.0;
        }
    }
    
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(cloudPos, 3));
    cloudGeo.setAttribute('size', new THREE.BufferAttribute(cloudSize, 1));
    cloudGeo.setAttribute('color', new THREE.BufferAttribute(cloudColors, 3));
    
    const cloudMat = new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 }
        },
        vertexShader: `
            attribute float size;
            attribute vec3 color;
            uniform float time;
            varying vec3 vColor;
            varying float vAlpha;
            
            void main() {
                vColor = color;
                vAlpha = 0.2 + 0.3 * sin(time * 0.3 + position.x * 0.005 + position.z * 0.003);
                
                vec3 pos = position;
                pos.x += sin(time * 0.2 + position.y * 0.01) * 2.0;
                pos.y += cos(time * 0.15 + position.x * 0.008) * 1.5;
                
                vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                gl_PointSize = size * (300.0 / -mvPosition.z);
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            varying vec3 vColor;
            varying float vAlpha;
            
            void main() {
                float r = distance(gl_PointCoord, vec2(0.5));
                if (r > 0.5) discard;
                float alpha = (1.0 - r * 2.0) * vAlpha;
                gl_FragColor = vec4(vColor, alpha);
            }
        `,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    
    const cloudPoints = new THREE.Points(cloudGeo, cloudMat);
    world.add(cloudPoints);
    clouds.push({ points: cloudPoints, material: cloudMat });
}

function animateBackground() {
    const time = Date.now() * 0.001;
    
    stars.forEach((layer) => {
        layer.material.uniforms.time.value = time;
        layer.points.position.x = cam.position.x * layer.speed * 0.1;
        layer.points.position.z = cam.position.z * layer.speed * 0.05;
    });
    
    clouds.forEach((cloud) => {
        cloud.material.uniforms.time.value = time;
        cloud.points.position.x = cam.position.x * 0.03;
        cloud.points.position.z = cam.position.z * 0.02;
    });
}