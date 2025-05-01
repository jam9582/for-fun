const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton'); // "다시 시작" 버튼

let dinosaur;
let obstacles = [];
let score = 0;
let gameOver = false;

// 게임 초기 설정
function init() {
    dinosaur = new Dinosaur();
    obstacles = [];
    score = 0;
    gameOver = false;
    restartButton.style.display = 'none';
    requestAnimationFrame(gameLoop); 
}

// 게임 반복
function gameLoop() {
    if (!gameOver) {
        update(); 
        render(); 
        requestAnimationFrame(gameLoop); 
    } else {
        displayGameOver(); 
        restartButton.style.display = 'block'; 
    }
}

function update() {
    dinosaur.update(); 
    updateObstacles();
    checkCollisions(); 
    score++; 
}

function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // 화면 초기화
    dinosaur.render(); 
    renderObstacles();
    displayScore(); 
}

function updateObstacles() {
    // 매 프레임마다 랜덤하게 장애물 생성 여부를 결정
    if (Math.random() < 0.02) { // 2% 확률로 장애물 생성
        obstacles.push(new Obstacle());
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // 화면 밖으로 나간 장애물 제거
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
    });
}

function renderObstacles() {
    obstacles.forEach((obstacle) => obstacle.render());
}

// 충돌
function checkCollisions() {
    obstacles.forEach((obstacle) => {
        const buffer = 10; // 충돌 판정을 유하게 하기 위한 여유 범위

        if (
            dinosaur.x + buffer < obstacle.x + obstacle.width - buffer &&
            dinosaur.x + dinosaur.width - buffer > obstacle.x + buffer &&
            dinosaur.y + buffer < obstacle.y + obstacle.height - buffer &&
            dinosaur.y + dinosaur.height - buffer > obstacle.y + buffer
        ) {
            gameOver = true; // 충돌 시 게임 오버
        }
    });
}

// 점수 표시
function displayScore() {
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

// 게임 오버
function displayGameOver() {
    ctx.fillStyle = 'black';
    ctx.font = '40px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
}

// Dinosaur class
class Dinosaur {
    constructor() {
        this.x = 50;
        this.y = canvas.height - 50;
        this.width = 40;
        this.height = 40;
        this.velocityY = 0;
        this.gravity = 0.5 ; // 중력을 낮춰 점프 시간이 길어지도록 설정
        this.jumpStrength = 12; // 점프 강도
        this.jumpCount = 0; // 현재 점프 횟수
        this.maxJumps = 2; // 최대 점프 횟수
    }

    update() {
        this.velocityY += this.gravity; // 중력 적용
        this.y += this.velocityY; // y 위치 업데이트

        // 바닥에 착지하면 점프 상태 초기화
        if (this.y >= canvas.height - this.height) {
            this.y = canvas.height - this.height;
            this.velocityY = 0;
            this.jumpCount = 0; // 점프 횟수 초기화
        }
    }

    render() {
        ctx.fillStyle = 'green';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.velocityY = -this.jumpStrength; // 위로 점프
            this.jumpCount++; // 더블 점프~!!
        }
    }
}

// 장애물
class Obstacle {
    constructor() {
        this.width = 30; 
        this.height = 30; 
        this.x = canvas.width; // 화면 맨 오른쪽에서 시작
        this.y = canvas.height - this.height; // 바닥에 위치
        this.speed = 3; // 장애물 스피드
    }

    update() {
        this.x -= this.speed; // 왼쪽으로 장애물 이동
    }

    render() {
        ctx.fillStyle = 'red';
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 공룡 점프는 스페이스바
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space' && !gameOver) {
        dinosaur.jump();
    }
});

restartButton.addEventListener('click', () => {
    init();
});

// 게임 초기화
init();