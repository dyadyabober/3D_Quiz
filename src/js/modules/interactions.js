// Interactions Module - Mouse, scroll, and UI interactions

let targetX = 0, targetY = 0;
let mouseX = 0, mouseY = 0;

function setupClicks() {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    
    function onClick(event) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
        
        raycaster.setFromCamera(mouse, cam);
        
        const objects = [];
        world.traverse((child) => {
            if (child.isMesh && child.userData.isBtn) {
                objects.push(child);
            }
        });
        
        const hits = raycaster.intersectObjects(objects, false);
        
        if (hits.length > 0) {
            const clicked = hits[0].object;
            
            if (clicked.userData.isBtn) {
                pickAnswer(
                    clicked.userData.qIdx,
                    clicked.userData.ansIdx
                );
            }
        }
    }
    
    render.domElement.addEventListener('click', onClick);
}

function setupMouse() {
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        
        targetX = -mouseX * 0.4;
        targetY = mouseY * 0.4;
    });
}

function setupScroll() {
    gsap.registerPlugin(ScrollTrigger);
    
    ScrollTrigger.create({
        trigger: "body",
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
            if (gameOver) {
                return;
            }
            
            const prog = self.progress;
            cam.position.z = 5 - (prog * 100);
            
            // Update digits occasionally
            updateDigitsOnScroll();
            
            checkDistance(prog);
        }
    });
}

function checkDistance(scrollProg) {
    boards.forEach((group, idx) => {
        const dist = Math.abs(cam.position.z - group.position.z);
        
        if (dist < 15 && !group.userData.active) {
            group.userData.active = true;
            
            group.userData.frame.material.color.setHex(0x00ffff);
            
            const dir = new THREE.Vector3();
            dir.subVectors(cam.position, group.position);
            dir.normalize();
            
            const targetRot = Math.atan2(dir.x, dir.z);
            
            gsap.to(group.rotation, {
                x: 0,
                y: targetRot,
                z: 0,
                duration: 1.2,
                ease: "power2.out"
            });
            
        } else if (dist >= 15 && group.userData.active) {
            group.userData.active = false;
            
            if (!group.userData.answered) {
                group.userData.frame.material.color.setHex(0x00ff00);
            }
            
            gsap.to(group.rotation, {
                x: 0,
                y: group.userData.originalRotY,
                z: 0,
                duration: 1.2,
                ease: "power2.in"
            });
        }
    });
}

function setupHelp() {
    const helpBtn = document.getElementById('helpButton');
    const helpPanel = document.getElementById('helpPanel');
    const okBtn = document.getElementById('okButton');
    
    helpBtn.addEventListener('click', () => {
        helpPanel.classList.toggle('open');
    });
    
    okBtn.addEventListener('click', () => {
        helpPanel.classList.remove('open');
    });
    
    document.addEventListener('click', (event) => {
        if (!helpBtn.contains(event.target) && !helpPanel.contains(event.target)) {
            helpPanel.classList.remove('open');
        }
    });
    
    const restartBtn = document.getElementById('restartButton');
    restartBtn.addEventListener('click', restart);
}

function updateCameraRotation() {
    cam.rotation.y += (targetX - cam.rotation.y) * 0.03;
    cam.rotation.x += (targetY - cam.rotation.x) * 0.03;
}