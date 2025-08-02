const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game settings
const PADDLE_WIDTH = 12;
const PADDLE_HEIGHT = 80;
const BALL_RADIUS = 10;
const PLAYER_X = 15;
const AI_X = canvas.width - PLAYER_X - PADDLE_WIDTH;

let playerY = canvas.height / 2 - PADDLE_HEIGHT / 2;
let aiY = canvas.height / 2 - PADDLE_HEIGHT / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 2.5;

let playerScore = 0;
let aiScore = 0;

// Mouse control for player's paddle
canvas.addEventListener('mousemove', function(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    playerY = mouseY - PADDLE_HEIGHT / 2;

    // Clamp paddle within bounds
    if (playerY < 0) playerY = 0;
    if (playerY > canvas.height - PADDLE_HEIGHT) playerY = canvas.height - PADDLE_HEIGHT;
});

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    // Ball movement
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Top and bottom wall collision
    if (ballY < BALL_RADIUS) {
        ballY = BALL_RADIUS;
        ballSpeedY = -ballSpeedY;
    }
    if (ballY > canvas.height - BALL_RADIUS) {
        ballY = canvas.height - BALL_RADIUS;
        ballSpeedY = -ballSpeedY;
    }

    // Player paddle collision
    if (
        ballX - BALL_RADIUS < PLAYER_X + PADDLE_WIDTH &&
        ballY > playerY &&
        ballY < playerY + PADDLE_HEIGHT
    ) {
        ballX = PLAYER_X + PADDLE_WIDTH + BALL_RADIUS;
        ballSpeedX = -ballSpeedX;
        // Add some randomness to bounce angle
        ballSpeedY += (Math.random() - 0.5) * 2;
    }

    // AI paddle collision
    if (
        ballX + BALL_RADIUS > AI_X &&
        ballY > aiY &&
        ballY < aiY + PADDLE_HEIGHT
    ) {
        ballX = AI_X - BALL_RADIUS;
        ballSpeedX = -ballSpeedX;
        ballSpeedY += (Math.random() - 0.5) * 2;
    }

    // Score check
    if (ballX < 0) {
        aiScore++;
        resetBall();
    }
    if (ballX > canvas.width) {
        playerScore++;
        resetBall();
    }

    // Simple AI: follow the ball
    let aiCenter = aiY + PADDLE_HEIGHT / 2;
    if (aiCenter < ballY - 15) {
        aiY += 4;
    } else if (aiCenter > ballY + 15) {
        aiY -= 4;
    }
    // Clamp AI paddle within bounds
    if (aiY < 0) aiY = 0;
    if (aiY > canvas.height - PADDLE_HEIGHT) aiY = canvas.height - PADDLE_HEIGHT;
}

// Draw everything
function draw() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.setLineDash([10, 15]);
    ctx.strokeStyle = "#eebbc3";
    ctx.beginPath();
    ctx.moveTo(canvas.width/2, 0);
    ctx.lineTo(canvas.width/2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw paddles
    ctx.fillStyle = "#eebbc3";
    ctx.fillRect(PLAYER_X, playerY, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.fillStyle = "#f6e7cb";
    ctx.fillRect(AI_X, aiY, PADDLE_WIDTH, PADDLE_HEIGHT);

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, BALL_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = "#fffffe";
    ctx.fill();
    ctx.closePath();

    // Draw scores
    ctx.font = "32px Arial";
    ctx.fillStyle = "#eebbc3";
    ctx.fillText(playerScore, canvas.width/2 - 60, 50);
    ctx.fillStyle = "#f6e7cb";
    ctx.fillText(aiScore, canvas.width/2 + 35, 50);
}

// Reset ball to center
function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    // Randomize direction
    ballSpeedX = (Math.random() > 0.5 ? 5 : -5);
    ballSpeedY = (Math.random() > 0.5 ? 2.5 : -2.5);
}

gameLoop();