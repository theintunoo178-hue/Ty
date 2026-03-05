const canvas = document.getElementById('snookerCanvas');
const ctx = canvas.getContext('2d');
const resetBtn = document.getElementById('resetBtn');
const statusText = document.getElementById('status');

canvas.width = 800;
canvas.height = 400;

let balls = [];
let isPlayerTurn = true;
let isMoving = false;

class Ball {
    constructor(x, y, color, isCue = false) {
        this.x = x; this.y = y;
        this.color = color;
        this.isCue = isCue;
        this.radius = 12;
        this.vx = 0; this.vy = 0;
        this.friction = 0.98;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        // 3D Lighting Effect
        let grad = ctx.createRadialGradient(this.x-3, this.y-3, 2, this.x, this.y, this.radius);
        grad.addColorStop(0, 'white');
        grad.addColorStop(1, this.color);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= this.friction;
        this.vy *= this.friction;

        // Wall Bounce
        if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.vx *= -1;
        if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.vy *= -1;

        if (Math.abs(this.vx) < 0.1) this.vx = 0;
        if (Math.abs(this.vy) < 0.1) this.vy = 0;
    }
}

function initGame() {
    balls = [];
    // Cue Ball
    balls.push(new Ball(150, 200, '#ffffff', true));
    // Red Balls (Triangle pattern)
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j <= i; j++) {
            balls.push(new Ball(500 + i * 25, 175 + j * 25 - (i * 12), '#d32f2f'));
        }
    }
    isPlayerTurn = true;
    statusText.innerText = "သင့်အလှည့်: ဘောလုံးကို ချိန်ပြီး ရိုက်ပါ";
}

function update() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let moving = false;

    balls.forEach(ball => {
        ball.update();
        ball.draw();
        if (ball.vx !== 0 || ball.vy !== 0) moving = true;
    });

    // Check Collisions
    for (let i = 0; i < balls.length; i++) {
        for (let j = i + 1; j < balls.length; j++) {
            let dx = balls[j].x - balls[i].x;
            let dy = balls[j].y - balls[i].y;
            let dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < balls[i].radius * 2) {
                // Simple collision physics
                let angle = Math.atan2(dy, dx);
                let speed1 = Math.sqrt(balls[i].vx2 + balls[i].vy2);
                balls[i].vx = -Math.cos(angle) * speed1;
                balls[j].vx = Math.cos(angle) * speed1;
            }
        }
    }

    if (isMoving && !moving) {
        isMoving = false;
        isPlayerTurn = !isPlayerTurn;
        if (!isPlayerTurn) setTimeout(aiPlay, 1000);
        else statusText.innerText = "သင့်အလှည့်: ဘောလုံးကို ချိန်ပြီး ရိုက်ပါ";
    }
    isMoving = moving;
    requestAnimationFrame(update);
}

// AI logic
function aiPlay() {
    statusText.innerText = "AI စဉ်းစားနေသည်...";
    const cueBall = balls[0];
    const targetBall = balls[1]; // အနီးဆုံးဘောလုံးကို ပစ်မှတ်ထားခြင်း
    
    let dx = targetBall.x - cueBall.x;
    let dy = targetBall.y - cueBall.y;
    let angle = Math.atan2(dy, dx);
    
    cueBall.vx = Math.cos(angle) * 15;
    cueBall.vy = Math.sin(angle) * 15;
    statusText.innerText = "AI ရိုက်လိုက်ပြီ!";
}

canvas.addEventListener('mousedown', (e) => {
    if (!isPlayerTurn || isMoving) return;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    let dx = mouseX - balls[0].x;
    let dy = mouseY - balls[0].y;
    let angle = Math.atan2(dy, dx);
    
    balls[0].vx = Math.cos(angle) * 15;
    balls[0].vy = Math.sin(angle) * 15;
});

resetBtn.addEventListener('click', initGame);
initGame();
update();
