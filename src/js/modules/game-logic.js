// Game Logic Module - Quiz logic, levels, and progression

let lvl = 1;
let progress = { 1: 0, 2: 0, 3: 0 };
let blocked = { 1: false, 2: true, 3: true };
let correctCount = 0;
let gameOver = false;

function pickAnswer(qIdx, ansIdx) {
    const questions = quizData[lvl];
    const question = questions[qIdx];
    const group = boards[qIdx];
    
    if (group.userData.answered) {
        return;
    }
    
    group.userData.answered = true;
    
    const correct = ansIdx === question.correct;
    
    // Update all button visuals
    group.userData.buttons.forEach((button, idx) => {
        updateButtonVisual(button, idx, question.correct, ansIdx, correct);
    });
    
    if (correct) {
        // Correct answer
        group.userData.board.material.color.setHex(0x002200);
        group.userData.frame.material.color.setHex(0x00ff00);
        
        progress[lvl]++;
        updateProgress();
        
    } else {
        // Wrong answer
        group.userData.board.material.color.setHex(0x220000);
        group.userData.frame.material.color.setHex(0xff0000);
        
        gameOver = true;
        showGameOver();
    }
}

function updateButtonVisual(button, idx, correctIdx, selectedIdx, wasCorrect) {
    const data = button.userData;
    const textMesh = data.textMesh;
    const canvas = textMesh.userData.canvas;
    const ctx = textMesh.userData.ctx;
    const texture = textMesh.userData.texture;
    
    if (idx === correctIdx) {
        // Show correct answer
        ctx.fillStyle = '#00bb00';
        ctx.fillRect(0, 0, 1200, 300);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 15;
        ctx.strokeRect(8, 8, 1184, 284);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 75px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✓ ПРАВИЛЬНО!', 600, 150);
        
        data.btnMesh.material.color.setHex(0x00bb00);
        
    } else if (idx === selectedIdx && idx !== correctIdx) {
        // Show wrong answer
        ctx.fillStyle = '#bb0000';
        ctx.fillRect(0, 0, 1200, 300);
        
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 15;
        ctx.strokeRect(8, 8, 1184, 284);
        
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 65px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('✗ НЕПРАВИЛЬНО', 600, 150);
        
        data.btnMesh.material.color.setHex(0xbb0000);
        
    } else {
        // Dim other options
        ctx.fillStyle = '#444444';
        ctx.fillRect(0, 0, 1200, 300);
        
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 12;
        ctx.strokeRect(6, 6, 1188, 288);
        
        ctx.fillStyle = '#cccccc';
        ctx.font = 'bold 100px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(textMesh.userData.originalText, 600, 150);
        
        data.btnMesh.material.color.setHex(0x444444);
    }
    
    texture.needsUpdate = true;
}

function updateProgress() {
    const progressEl = document.getElementById('levelProgress');
    const totalQ = quizData[lvl].length;
    const currentProg = progress[lvl];
    
    progressEl.textContent = `Рівень ${lvl}: ${currentProg}/${totalQ} питань`;
    
    if (currentProg >= totalQ) {
        const levelEl = document.getElementById(`level${lvl}`);
        levelEl.className = 'levelBox completed';
        
        if (lvl < 3) {
            setTimeout(() => {
                nextLevel();
            }, 1000);
        } else {
            setTimeout(() => {
                showWin();
            }, 1000);
        }
    }
}

function nextLevel() {
    if (lvl >= 3) return;
    
    lvl++;
    correctCount = 0;
    
    const nextEl = document.getElementById(`level${lvl}`);
    nextEl.className = 'levelBox active';
    blocked[lvl] = false;
    
    // Remove old boards
    boards.forEach(group => {
        gsap.to(group.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.5,
            ease: "power2.in",
            onComplete: () => {
                world.remove(group);
            }
        });
    });
    
    setTimeout(() => {
        boards = [];
        makeBoards();
        
        // Animate new boards in
        boards.forEach((group, idx) => {
            group.scale.set(0, 0, 0);
            gsap.to(group.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.8,
                delay: idx * 0.2,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }, 600);
    
    const progressEl = document.getElementById('levelProgress');
    progressEl.textContent = `Рівень ${lvl}: 0/${quizData[lvl].length} питань`;
    
    gsap.to(cam.position, {
        z: 5,
        duration: 1.5,
        ease: "power2.out"
    });
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    
    showLevelMsg();
}

function showLevelMsg() {
    const msg = document.createElement('div');
    msg.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0, 255, 0, 0.9);
        color: #000;
        padding: 30px 50px;
        border-radius: 15px;
        font-family: 'Courier New', monospace;
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        z-index: 1000;
        box-shadow: 0 0 20px #00ff00;
    `;
    
    const levelNames = { 1: 'Базовий', 2: 'Складний', 3: 'Експертний' };
    msg.innerHTML = `
        🎉 Рівень завершено!<br>
        <br>
        Перехід на ${lvl} рівень<br>
        (${levelNames[lvl]})
    `;
    
    document.body.appendChild(msg);
    
    setTimeout(() => {
        if (msg.parentNode) {
            msg.parentNode.removeChild(msg);
        }
    }, 3000);
}

function showWin() {
    const modal = document.getElementById('gameOverModal');
    const title = modal.querySelector('h2');
    const desc = modal.querySelector('p');
    const btn = modal.querySelector('.restartBtn');
    
    modal.style.borderColor = '#00ff00';
    modal.style.color = '#00ff00';
    
    title.textContent = '🎉 ВІТАЄМО!';
    title.style.color = '#00ff00';
    
    desc.textContent = 'Ви успішно пройшли всі рівні квізу з програмування!';
    
    btn.textContent = 'Грати знову';
    btn.style.borderColor = '#00ff00';
    btn.style.color = '#00ff00';
    btn.style.backgroundColor = 'rgba(0, 255, 0, 0.2)';
    
    modal.classList.add('show');
}

function showGameOver() {
    const modal = document.getElementById('gameOverModal');
    modal.classList.add('show');
}

function restart() {
    lvl = 1;
    correctCount = 0;
    progress = { 1: 0, 2: 0, 3: 0 };
    blocked = { 1: false, 2: true, 3: true };
    gameOver = false;
    
    // Remove old boards
    boards.forEach(group => {
        gsap.to(group.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.3,
            ease: "power2.in",
            onComplete: () => {
                world.remove(group);
            }
        });
    });
    
    setTimeout(() => {
        boards = [];
        makeBoards();
        
        boards.forEach((group, idx) => {
            group.scale.set(0, 0, 0);
            gsap.to(group.scale, {
                x: 1, y: 1, z: 1,
                duration: 0.8,
                delay: idx * 0.2,
                ease: "elastic.out(1, 0.5)"
            });
        });
    }, 400);
    
    // Reset UI
    document.getElementById('level1').className = 'levelBox active';
    document.getElementById('level2').className = 'levelBox blocked';
    document.getElementById('level3').className = 'levelBox blocked';
    
    const progressEl = document.getElementById('levelProgress');
    progressEl.textContent = 'Рівень 1: 0/3 питань';
    
    const modal = document.getElementById('gameOverModal');
    modal.classList.remove('show');
    
    // Reset modal styles
    modal.style.borderColor = '#ff0000';
    modal.style.color = '#ff0000';
    
    const title = modal.querySelector('h2');
    const desc = modal.querySelector('p');
    const btn = modal.querySelector('.restartBtn');
    
    title.textContent = '❌ Рівень провалено!';
    title.style.color = '#ff0000';
    desc.textContent = 'Ви дали неправильну відповідь.';
    btn.textContent = 'Почати спочатку';
    btn.style.borderColor = '#ff0000';
    btn.style.color = '#ff0000';
    btn.style.backgroundColor = 'rgba(255, 0, 0, 0.2)';
    
    gsap.to(cam.position, {
        z: 5,
        duration: 1,
        ease: "power2.out"
    });
    
    window.scrollTo(0, 0);
}