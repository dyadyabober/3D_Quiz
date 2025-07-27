// Main Application File - Initialize and coordinate all modules

let loadPercent = 0;
let loaded = false;

// Loading Screen Functions
function makeFallingChar(container) {
    const char = document.createElement('div');
    char.className = 'binaryChar';
    char.textContent = Math.random() > 0.5 ? '1' : '0';
    char.style.left = Math.random() * 100 + '%';
    char.style.animationDelay = Math.random() * 2 + 's';
    char.style.animationDuration = (2 + Math.random() * 2) + 's';
    
    container.appendChild(char);
    
    setTimeout(() => {
        if (char.parentNode) {
            char.parentNode.removeChild(char);
        }
    }, 4000);
    
    if (!loaded) {
        setTimeout(() => makeFallingChar(container), 1000 + Math.random() * 2000);
    }
}

function fakeLoading() {
    const bar = document.getElementById('progressBar');
    const text = document.getElementById('loadingText');
    
    const steps = [
        { progress: 10, text: 'Завантаження Three.js...' },
        { progress: 25, text: 'Створення 3D сцени...' },
        { progress: 40, text: 'Генерація зоряного фону...' },
        { progress: 55, text: 'Створення бінарної дороги...' },
        { progress: 70, text: 'Завантаження питань...' },
        { progress: 85, text: 'Налаштування управління...' },
        { progress: 100, text: 'Готово!' }
    ];
    
    let step = 0;
    
    function updateBar() {
        if (step < steps.length) {
            const current = steps[step];
            loadPercent = current.progress;
            
            bar.style.width = loadPercent + '%';
            text.textContent = `${current.text} ${loadPercent}%`;
            
            step++;
            setTimeout(updateBar, 400 + Math.random() * 600);
        } else {
            setTimeout(hideLoader, 500);
        }
    }
    
    updateBar();
}

function hideLoader() {
    loaded = true;
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    
    setTimeout(() => {
        if (loader.parentNode) {
            loader.parentNode.removeChild(loader);
        }
    }, 500);
    
    startApp();
}

function startLoading() {
    const bgContainer = document.getElementById('binaryBackground');
    
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            makeFallingChar(bgContainer);
        }, i * 150);
    }
    
    fakeLoading();
}

// Main Application Functions
function animate() {
    requestAnimationFrame(animate);
    
    updateCameraRotation();
    animateBackground();
    
    render.render(world, cam);
}

function startApp() {
    setupThree();
    makeBackground();
    makeDigits();
    makeBoards();
    
    setupMouse();
    setupClicks();
    setupScroll();
    setupHelp();
    
    animate();
    
    window.addEventListener('resize', onResize);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        startLoading();
    }, 100);
});