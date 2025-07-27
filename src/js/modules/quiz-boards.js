// Quiz Boards Module - 3D quiz board creation and management

let boards = [];

function makeBoards() {
    const questions = quizData[lvl];
    
    questions.forEach((question, idx) => {
        const group = new THREE.Group();
        
        const side = idx % 2 === 0 ? -1 : 1;
        const xPos = side * 3;
        const zPos = -15 - (idx * 25);
        
        group.position.set(xPos, 3.5, zPos);
        
        // Create main board
        const boardGeo = new THREE.BoxGeometry(5, 6.5, 0.15);
        const boardMat = new THREE.MeshLambertMaterial({ 
            color: 0x001122,
            transparent: true,
            opacity: 0.95
        });
        const board = new THREE.Mesh(boardGeo, boardMat);
        group.add(board);
        
        // Create frame
        const frameGeo = new THREE.BoxGeometry(5.2, 6.7, 0.1);
        const frameMat = new THREE.MeshLambertMaterial({ color: 0x00ff00 });
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.z = -0.1;
        group.add(frame);
        
        // Create question text
        const textMesh = createQuestionText(question);
        textMesh.position.z = 0.08;
        group.add(textMesh);
        
        // Create answer buttons
        const buttons = createAnswerButtons(question, idx, group);
        
        // Set rotation based on side
        if (side < 0) {
            group.rotation.y = Math.PI / 2;
        } else {
            group.rotation.y = -Math.PI / 2;
        }
        
        group.userData = {
            qIdx: idx,
            active: false,
            side: side,
            textMesh: textMesh,
            board: board,
            frame: frame,
            buttons: buttons,
            answered: false,
            originalX: xPos,
            originalZ: zPos,
            originalRotY: side < 0 ? Math.PI / 2 : -Math.PI / 2
        };
        
        world.add(group);
        boards.push(group);
    });
}

function createQuestionText(question) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1400;
    canvas.height = 1500;
    
    // Background
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, 1400, 1500);
    
    // Border
    ctx.strokeStyle = '#00ff00';
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, 1370, 1470);
    
    // Title
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 90px Courier New';
    ctx.textAlign = 'center';
    ctx.fillText(question.title, 700, 120);
    
    // Line separator
    ctx.fillStyle = '#00ff00';
    ctx.fillRect(100, 160, 1200, 6);
    
    // Question text
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 65px Courier New';
    ctx.textAlign = 'center';
    
    const qText = question.code;
    const words = qText.split(' ');
    const lines = [];
    let currentLine = '';
    
    words.forEach(word => {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        if (testLine.length <= 18) {
            currentLine = testLine;
        } else {
            if (currentLine) lines.push(currentLine);
            currentLine = word;
        }
    });
    if (currentLine) lines.push(currentLine);
    
    lines.forEach((line, i) => {
        if (i < 4) {
            ctx.fillText(line, 700, 300 + i * 70);
        }
    });
    
    // Bottom separator
    ctx.fillRect(100, 750, 1200, 4);
    
    // Instruction text
    ctx.fillStyle = '#ffff00';
    ctx.font = 'bold 55px Courier New';
    ctx.fillText('Оберіть відповідь:', 700, 820);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    
    const textMat = new THREE.MeshBasicMaterial({ 
        map: texture,
        transparent: false
    });
    
    const textPlane = new THREE.PlaneGeometry(4.8, 6.2);
    return new THREE.Mesh(textPlane, textMat);
}

function createAnswerButtons(question, qIdx, group) {
    const buttons = [];
    
    question.answers.forEach((answer, ansIdx) => {
        const btnGroup = new THREE.Group();
        
        // Button mesh
        const btnGeo = new THREE.BoxGeometry(4.2, 0.8, 0.3);
        const btnMat = new THREE.MeshBasicMaterial({ color: 0x006600 });
        const btnMesh = new THREE.Mesh(btnGeo, btnMat);
        btnGroup.add(btnMesh);
        
        // Button text
        const btnTextMesh = createButtonText(answer, ansIdx);
        btnTextMesh.position.z = 0.16;
        btnGroup.add(btnTextMesh);
        
        // Position button
        const yPos = -0.5 - (ansIdx * 1.2);
        btnGroup.position.set(0, yPos, 0.4);
        
        // Set user data for interaction
        btnMesh.userData = {
            isBtn: true,
            qIdx: qIdx,
            ansIdx: ansIdx,
            btnGroup: btnGroup,
            btnMesh: btnMesh,
            textMesh: btnTextMesh,
            originalText: `${ansIdx + 1}. ${answer}`
        };
        
        group.add(btnGroup);
        buttons.push(btnMesh);
    });
    
    return buttons;
}

function createButtonText(answer, ansIdx) {
    const btnCanvas = document.createElement('canvas');
    const btnCtx = btnCanvas.getContext('2d');
    btnCanvas.width = 1200;
    btnCanvas.height = 300;
    
    // Background
    btnCtx.fillStyle = '#006600';
    btnCtx.fillRect(0, 0, 1200, 300);
    
    // Border
    btnCtx.strokeStyle = '#003300';
    btnCtx.lineWidth = 12;
    btnCtx.strokeRect(6, 6, 1188, 288);
    
    // Text
    btnCtx.fillStyle = '#ffffff';
    btnCtx.font = 'bold 70px Arial';
    btnCtx.textAlign = 'center';
    btnCtx.textBaseline = 'middle';
    
    const btnText = `${ansIdx + 1}. ${answer}`;
    
    // Adjust font size for long text
    if (btnText.length > 20) {
        btnCtx.font = 'bold 55px Arial';
    }
    if (btnText.length > 25) {
        btnCtx.font = 'bold 45px Arial';
    }
    
    btnCtx.fillText(btnText, 600, 150);
    
    const btnTexture = new THREE.CanvasTexture(btnCanvas);
    btnTexture.minFilter = THREE.LinearFilter;
    btnTexture.magFilter = THREE.LinearFilter;
    
    const btnTextMat = new THREE.MeshBasicMaterial({ 
        map: btnTexture,
        transparent: false
    });
    
    const btnTextGeo = new THREE.PlaneGeometry(4.1, 0.75);
    const textMesh = new THREE.Mesh(btnTextGeo, btnTextMat);
    
    // Store canvas and context for later updates
    textMesh.userData = {
        canvas: btnCanvas,
        ctx: btnCtx,
        texture: btnTexture,
        originalText: btnText
    };
    
    return textMesh;
}