// Digits Module - Binary digit sprites

let digits = [];

function makeDigits() {
    digits = [];
    
    // Create main road digits
    for (let z = 10; z >= -80; z -= 1) {
        for (let x = -2; x <= 2; x += 0.4) {
            const sprite = createDigitSprite(x, z, false);
            world.add(sprite);
            digits.push(sprite);
        }
    }
    
    // Create random floating digits
    for (let i = 0; i < 100; i++) {
        const z = 10 - Math.random() * 90;
        const x = (Math.random() - 0.5) * 4;
        const sprite = createDigitSprite(x, z, true);
        world.add(sprite);
        digits.push(sprite);
    }
}

function createDigitSprite(x, z, isRandom = false) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 64;
    canvas.height = 64;
    
    const digit = Math.random() > 0.5 ? '1' : '0';
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 40px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, 32, 32);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.NearestFilter;
    texture.magFilter = THREE.NearestFilter;
    
    const spriteMat = new THREE.SpriteMaterial({ 
        map: texture,
        transparent: true,
        opacity: isRandom ? 0.7 : 0.8
    });
    
    const sprite = new THREE.Sprite(spriteMat);
    
    sprite.position.set(
        x + (Math.random() - 0.5) * 0.1,
        isRandom ? 0.05 + Math.random() * 0.2 : 0.05,
        z + (Math.random() - 0.5) * 0.2
    );
    
    const distance = Math.abs(z);
    const scale = Math.max(0.15, isRandom ? 0.3 - distance / 400 : 0.35 - distance / 300);
    sprite.scale.set(scale, scale, scale);
    
    sprite.userData = {
        originalZ: sprite.position.z,
        originalX: sprite.position.x,
        originalScale: scale,
        digit: digit,
        canvas: canvas,
        ctx: ctx,
        random: isRandom,
        counter: Math.random() * 100
    };
    
    return sprite;
}

function updateDigit(sprite) {
    const newDigit = Math.random() > 0.5 ? '1' : '0';
    sprite.userData.digit = newDigit;
    
    const ctx = sprite.userData.ctx;
    ctx.clearRect(0, 0, 64, 64);
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 40px Courier New';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(newDigit, 32, 32);
    
    sprite.material.map.needsUpdate = true;
}

function updateDigitsOnScroll() {
    if (Math.random() < 0.3) {
        digits.forEach((digit, idx) => {
            digit.userData.counter++;
            if (digit.userData.counter > 100) {
                digit.userData.counter = 0;
                updateDigit(digit);
            }
        });
    }
}