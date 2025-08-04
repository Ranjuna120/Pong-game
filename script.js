// Enhanced Pong Game with improved features
class EnhancedPongGame {
    constructor() {
        this.canvas = document.getElementById('pongCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Game settings
        this.PADDLE_WIDTH = 15;
        this.PADDLE_HEIGHT = 100;
        this.BALL_RADIUS = 12;
        this.PLAYER_X = 20;
        this.AI_X = this.canvas.width - this.PLAYER_X - this.PADDLE_WIDTH;
        this.MAX_SCORE = 10;
        
        // Game state
        this.gameState = 'start'; // 'start', 'playing', 'paused', 'gameOver'
        this.difficulty = 'medium';
        this.keys = {};
        this.particles = [];
        
        // Difficulty settings
        this.difficultySettings = {
            easy: { aiSpeed: 3, ballSpeed: 4, aiAccuracy: 0.7 },
            medium: { aiSpeed: 4.5, ballSpeed: 6, aiAccuracy: 0.8 },
            hard: { aiSpeed: 6, ballSpeed: 8, aiAccuracy: 0.9 },
            insane: { aiSpeed: 8, ballSpeed: 10, aiAccuracy: 0.95 }
        };
        
        this.initGame();
        this.setupEventListeners();
        this.startGameLoop();
    }
    
    initGame() {
        // Reset game variables
        this.playerY = this.canvas.height / 2 - this.PADDLE_HEIGHT / 2;
        this.aiY = this.canvas.height / 2 - this.PADDLE_HEIGHT / 2;
        
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        
        const settings = this.difficultySettings[this.difficulty];
        this.ballSpeedX = settings.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ballSpeedY = settings.ballSpeed * 0.6 * (Math.random() > 0.5 ? 1 : -1);
        
        this.playerScore = 0;
        this.aiScore = 0;
        this.lastHitPaddle = null;
        
        // Update UI
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('ai-score').textContent = this.aiScore;
    }
    
    setupEventListeners() {
        // Mouse control
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.gameState !== 'playing') return;
            
            const rect = this.canvas.getBoundingClientRect();
            const mouseY = e.clientY - rect.top;
            this.playerY = mouseY - this.PADDLE_HEIGHT / 2;
            this.clampPlayerPaddle();
        });
        
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                this.togglePause();
            }
            
            if (e.key === 'Escape') {
                e.preventDefault();
                this.showExitDialog();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // UI controls
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('exit-btn').addEventListener('click', () => {
            this.showExitDialog();
        });
        
        document.getElementById('confirm-exit-btn').addEventListener('click', () => {
            this.exitGame();
        });
        
        document.getElementById('cancel-exit-btn').addEventListener('click', () => {
            this.cancelExit();
        });
        
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.difficulty = e.target.value;
            if (this.gameState === 'start') {
                this.initGame();
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('start-screen').classList.add('hidden');
        this.initGame();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
            document.getElementById('pause-screen').classList.remove('hidden');
        } else if (this.gameState === 'paused') {
            this.resumeGame();
        }
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pause-screen').classList.add('hidden');
    }
    
    restartGame() {
        this.gameState = 'start';
        document.getElementById('game-over-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        this.particles = [];
        this.initGame();
    }
    
    showExitDialog() {
        const previousState = this.gameState;
        this.gameState = 'exitDialog';
        this.previousGameState = previousState;
        document.getElementById('exit-screen').classList.remove('hidden');
    }
    
    cancelExit() {
        this.gameState = this.previousGameState || 'start';
        document.getElementById('exit-screen').classList.add('hidden');
    }
    
    exitGame() {
        // Create a farewell screen
        document.body.innerHTML = `
            <div style="
                display: flex;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: linear-gradient(135deg, #232946 0%, #121629 100%);
                color: #fff;
                font-family: Arial, sans-serif;
                text-align: center;
                flex-direction: column;
            ">
                <h1 style="font-size: 3rem; margin-bottom: 20px; color: #eebbc3;">👋 Thanks for Playing!</h1>
                <p style="font-size: 1.5rem; margin-bottom: 30px; color: #f6e7cb;">Hope you enjoyed the Enhanced Pong Game!</p>
                <p style="font-size: 1rem; color: #eebbc3; margin-bottom: 20px;">Refresh the page to play again</p>
                <button onclick="location.reload()" style="
                    background: linear-gradient(45deg, #eebbc3, #f6e7cb);
                    color: #232946;
                    border: none;
                    padding: 15px 30px;
                    font-size: 1.2rem;
                    font-weight: bold;
                    border-radius: 10px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                ">Play Again</button>
            </div>
        `;
    }
    
    handleKeyboardInput() {
        if (this.gameState !== 'playing') return;
        
        if (this.keys['ArrowUp']) {
            this.playerY -= 8;
        }
        if (this.keys['ArrowDown']) {
            this.playerY += 8;
        }
        
        this.clampPlayerPaddle();
    }
    
    clampPlayerPaddle() {
        if (this.playerY < 0) this.playerY = 0;
        if (this.playerY > this.canvas.height - this.PADDLE_HEIGHT) {
            this.playerY = this.canvas.height - this.PADDLE_HEIGHT;
        }
    }
    
    updateBall() {
        this.ballX += this.ballSpeedX;
        this.ballY += this.ballSpeedY;
        
        // Top and bottom wall collision
        if (this.ballY <= this.BALL_RADIUS) {
            this.ballY = this.BALL_RADIUS;
            this.ballSpeedY = -this.ballSpeedY;
            this.createParticles(this.ballX, this.ballY, '#eebbc3');
            this.playSound('wall');
        }
        
        if (this.ballY >= this.canvas.height - this.BALL_RADIUS) {
            this.ballY = this.canvas.height - this.BALL_RADIUS;
            this.ballSpeedY = -this.ballSpeedY;
            this.createParticles(this.ballX, this.ballY, '#eebbc3');
            this.playSound('wall');
        }
        
        // Player paddle collision
        if (this.ballX - this.BALL_RADIUS <= this.PLAYER_X + this.PADDLE_WIDTH &&
            this.ballX + this.BALL_RADIUS >= this.PLAYER_X &&
            this.ballY >= this.playerY &&
            this.ballY <= this.playerY + this.PADDLE_HEIGHT &&
            this.ballSpeedX < 0) {
            
            // Calculate hit position for angle variation
            const hitPos = (this.ballY - (this.playerY + this.PADDLE_HEIGHT / 2)) / (this.PADDLE_HEIGHT / 2);
            
            this.ballSpeedX = Math.abs(this.ballSpeedX) * 1.05;
            this.ballSpeedY = hitPos * 8;
            this.ballX = this.PLAYER_X + this.PADDLE_WIDTH + this.BALL_RADIUS;
            
            this.lastHitPaddle = 'player';
            this.createParticles(this.ballX, this.ballY, '#f6e7cb');
            this.playSound('paddle');
        }
        
        // AI paddle collision
        if (this.ballX + this.BALL_RADIUS >= this.AI_X &&
            this.ballX - this.BALL_RADIUS <= this.AI_X + this.PADDLE_WIDTH &&
            this.ballY >= this.aiY &&
            this.ballY <= this.aiY + this.PADDLE_HEIGHT &&
            this.ballSpeedX > 0) {
            
            const hitPos = (this.ballY - (this.aiY + this.PADDLE_HEIGHT / 2)) / (this.PADDLE_HEIGHT / 2);
            
            this.ballSpeedX = -Math.abs(this.ballSpeedX) * 1.05;
            this.ballSpeedY = hitPos * 8;
            this.ballX = this.AI_X - this.BALL_RADIUS;
            
            this.lastHitPaddle = 'ai';
            this.createParticles(this.ballX, this.ballY, '#eebbc3');
            this.playSound('paddle');
        }
        
        // Scoring
        if (this.ballX < 0) {
            this.aiScore++;
            this.updateScore();
            this.resetBall();
            this.playSound('score');
        }
        
        if (this.ballX > this.canvas.width) {
            this.playerScore++;
            this.updateScore();
            this.resetBall();
            this.playSound('score');
        }
        
        // Check for game over
        if (this.playerScore >= this.MAX_SCORE || this.aiScore >= this.MAX_SCORE) {
            this.gameOver();
        }
    }
    
    updateAI() {
        const settings = this.difficultySettings[this.difficulty];
        const aiCenter = this.aiY + this.PADDLE_HEIGHT / 2;
        const targetY = this.ballY;
        
        // Add some prediction based on ball direction
        let predictedY = targetY;
        if (this.ballSpeedX > 0) {
            const timeToReach = (this.AI_X - this.ballX) / this.ballSpeedX;
            predictedY = this.ballY + this.ballSpeedY * timeToReach;
        }
        
        // Add inaccuracy based on difficulty
        const accuracy = settings.aiAccuracy;
        const error = (1 - accuracy) * (Math.random() - 0.5) * this.PADDLE_HEIGHT;
        predictedY += error;
        
        const diff = predictedY - aiCenter;
        
        if (Math.abs(diff) > 10) {
            if (diff > 0) {
                this.aiY += settings.aiSpeed;
            } else {
                this.aiY -= settings.aiSpeed;
            }
        }
        
        // Clamp AI paddle
        if (this.aiY < 0) this.aiY = 0;
        if (this.aiY > this.canvas.height - this.PADDLE_HEIGHT) {
            this.aiY = this.canvas.height - this.PADDLE_HEIGHT;
        }
    }
    
    createParticles(x, y, color) {
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 30,
                maxLife: 30,
                color: color
            });
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            particle.life--;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    resetBall() {
        this.ballX = this.canvas.width / 2;
        this.ballY = this.canvas.height / 2;
        
        const settings = this.difficultySettings[this.difficulty];
        
        // Ball goes toward the player who didn't score
        if (this.lastHitPaddle === 'player') {
            this.ballSpeedX = settings.ballSpeed;
        } else {
            this.ballSpeedX = -settings.ballSpeed;
        }
        
        this.ballSpeedY = settings.ballSpeed * 0.6 * (Math.random() > 0.5 ? 1 : -1);
        
        // Add brief pause after scoring
        setTimeout(() => {
            // Ball is ready to move
        }, 1000);
    }
    
    updateScore() {
        document.getElementById('player-score').textContent = this.playerScore;
        document.getElementById('ai-score').textContent = this.aiScore;
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        const winner = this.playerScore >= this.MAX_SCORE ? 'Player' : 'AI';
        document.getElementById('winner-text').textContent = `🏆 ${winner} Wins!`;
        document.getElementById('final-score').textContent = 
            `Final Score: ${this.playerScore} - ${this.aiScore}`;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    playSound(type) {
        // Simple sound effects using Web Audio API
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        switch (type) {
            case 'paddle':
                oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(880, audioContext.currentTime + 0.1);
                break;
            case 'wall':
                oscillator.frequency.setValueAtTime(220, audioContext.currentTime);
                break;
            case 'score':
                oscillator.frequency.setValueAtTime(660, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(440, audioContext.currentTime + 0.3);
                break;
        }
        
        gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
    }
    
    update() {
        if (this.gameState !== 'playing') return;
        
        this.handleKeyboardInput();
        this.updateBall();
        this.updateAI();
        this.updateParticles();
    }
    
    draw() {
        // Clear canvas with gradient
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, this.canvas.width / 2
        );
        gradient.addColorStop(0, '#121629');
        gradient.addColorStop(1, '#0a0d1a');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw center line
        this.ctx.setLineDash([15, 15]);
        this.ctx.strokeStyle = 'rgba(238, 187, 195, 0.3)';
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.stroke();
        this.ctx.setLineDash([]);
        
        // Draw paddles with glow effect
        this.drawPaddleWithGlow(this.PLAYER_X, this.playerY, '#f6e7cb');
        this.drawPaddleWithGlow(this.AI_X, this.aiY, '#eebbc3');
        
        // Draw ball with glow effect
        this.drawBallWithGlow();
        
        // Draw particles
        this.drawParticles();
        
        // Draw score on canvas
        this.ctx.font = 'bold 48px Arial';
        this.ctx.textAlign = 'center';
        
        this.ctx.fillStyle = 'rgba(246, 231, 203, 0.8)';
        this.ctx.fillText(this.playerScore, this.canvas.width / 2 - 100, 80);
        
        this.ctx.fillStyle = 'rgba(238, 187, 195, 0.8)';
        this.ctx.fillText(this.aiScore, this.canvas.width / 2 + 100, 80);
    }
    
    drawPaddleWithGlow(x, y, color) {
        // Glow effect
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = color;
        
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x, y, this.PADDLE_WIDTH, this.PADDLE_HEIGHT);
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawBallWithGlow() {
        // Glow effect
        this.ctx.shadowBlur = 25;
        this.ctx.shadowColor = '#fffffe';
        
        this.ctx.beginPath();
        this.ctx.arc(this.ballX, this.ballY, this.BALL_RADIUS, 0, Math.PI * 2);
        this.ctx.fillStyle = '#fffffe';
        this.ctx.fill();
        
        // Inner highlight
        this.ctx.beginPath();
        this.ctx.arc(this.ballX - 3, this.ballY - 3, this.BALL_RADIUS * 0.3, 0, Math.PI * 2);
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.fill();
        
        // Reset shadow
        this.ctx.shadowBlur = 0;
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            const alpha = particle.life / particle.maxLife;
            this.ctx.globalAlpha = alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 3, 0, Math.PI * 2);
            this.ctx.fill();
        });
        this.ctx.globalAlpha = 1;
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.draw();
            requestAnimationFrame(gameLoop);
        };
        gameLoop();
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedPongGame();
});