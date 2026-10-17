const canvas = document.getElementById("pong");
const ctx = canvas.getContext('2d');
const pPoints = document.querySelector('.stats #points');
const ePoints = document.querySelector('.stats #enemyPoints');

const sounds = {
  hit: "sfx/hit.wav",
  win: "sfx/win.mp3",
  loss: "sfx/loss.mp3",
};

function playSound(filePath) {
  const audio = new Audio(filePath);
  audio.play().catch(() => {
  });
}

let playerScore = 0;
let enemyScore = 0;

const multiplier = 1.10;

const pPaddle = {
    x: 0,
    y: canvas.height / 2,
    speed: 5,
    width: 10,
    height: 90
}

const ePaddle = {
    x: canvas.width - 10,
    y: canvas.height / 2,
    speed: 5,
    width: 10,
    height: 90
}


const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    vx: 3.5,
    vy: 3.2,
    radius: 11
}

const keys = {};

window.addEventListener("keydown", e => { keys[e.key] = true });
window.addEventListener("keyup", e => { keys[e.key] = false });

function isColliding(b, p) {
    return (
        b.x + b.radius > p.x &&
        b.x - b.radius < p.x + p.width &&
        b.y + b.radius > p.y &&
        b.y - b.radius < p.y + p.height
    );
}

function resetBall(towardLeft) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.vx = towardLeft ? -2.5 : 2.5;
    ball.vy = (Math.random() > 0.5 ? 1 : -1) * (1.5 + Math.random() * 1.5);
}

function clampSpeed() {
    const MAX = 12;
    ball.vx = Math.max(-MAX, Math.min(MAX, ball.vx));
    ball.vy = Math.max(-MAX, Math.min(MAX, ball.vy));
}

function logic() {
    ball.x += ball.vx;
    ball.y += ball.vy;

    if (ball.y - ball.radius < 0) {
        ball.y = ball.radius;
        ball.vy *= -1;
    }
    if (ball.y + ball.radius > canvas.height) {
        ball.y = canvas.height - ball.radius;
        ball.vy *= -1;
    }

    if (ball.x - ball.radius > canvas.width) {
        playerScore++;
        pPoints.textContent = playerScore;
        playSound(sounds.win);
        resetBall(true);
    }

    if (ball.x + ball.radius < 0) {
        enemyScore++;
        ePoints.textContent = enemyScore;
        playSound(sounds.loss);
        resetBall(false);
    }

    // pPaddle Movment

    if (keys["ArrowDown"] || keys['s']) pPaddle.y += pPaddle.speed;
    if (keys["ArrowUp"] || keys['w']) pPaddle.y -= pPaddle.speed;

    // pPaddle Constraints
    if (pPaddle.y < 0) pPaddle.y = 0;
    if (pPaddle.y + pPaddle.height > canvas.height) pPaddle.y = canvas.height - pPaddle.height;

    // pPaddle hit
    if (isColliding(ball, pPaddle)) {
        let hitPos = (ball.y - (pPaddle.y + pPaddle.height / 2)) / (pPaddle.height / 2);

        ball.vy = hitPos * 5;
        ball.vx *= -1;
        ball.vy *= multiplier;
        ball.vx *= multiplier;
        clampSpeed();
        ball.x = pPaddle.x + pPaddle.width + ball.radius
        playSound(sounds.hit);
    }

    // ePaddle Movment "ai"
    const paddleCenter = ePaddle.y + ePaddle.height / 2;
    const distance = ball.y - paddleCenter;

    if (Math.abs(distance) > ePaddle.speed) {
        if (distance > 0) ePaddle.y += ePaddle.speed;
        else ePaddle.y -= ePaddle.speed;
    } else {
        ePaddle.y += distance;
    }

    // ePaddle Constraints
    if (ePaddle.y < 0) ePaddle.y = 0;
    if (ePaddle.y + ePaddle.height > canvas.height) ePaddle.y = canvas.height - ePaddle.height;

    // ePaddle hit
    if (isColliding(ball, ePaddle)) {
        let hitPos = (ball.y - (ePaddle.y + ePaddle.height / 2)) / (ePaddle.height / 2);

        ball.vy = hitPos * 5;
        ball.vx *= -1;
        ball.vy *= multiplier;
        ball.vx *= multiplier;
        clampSpeed();
        ball.x = ePaddle.x - ball.radius;
        playSound(sounds.hit);
    }

}


function render() {
    ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ==Ball==
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();

    // ==Player Paddle==
    ctx.fillStyle = "white"
    ctx.fillRect(pPaddle.x, pPaddle.y, pPaddle.width, pPaddle.height);

    // ==Enemy Paddle==
    ctx.fillStyle = "white"
    ctx.fillRect(ePaddle.x, ePaddle.y, ePaddle.width, ePaddle.height);

    // ==MidLine==
    ctx.beginPath()
    ctx.setLineDash([15, 20]);
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 4
    ctx.stroke();
    ctx.closePath();
    ctx.setLineDash([]);

    // ==Center Circle==
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 50 , 0, Math.PI * 2);
    ctx.setLineDash([15, 20]);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 4
    ctx.stroke();
    ctx.setLineDash([]);
}


function loop() {
    logic();
    render();
    requestAnimationFrame(loop);
}

loop();
