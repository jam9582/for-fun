const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const restartButton = document.getElementById('restartButton'); // "다시 시작" 버튼

let dinosaur;
let obstacles = [];
let score = 0;
let gameOver = false;

let obstacleSpeed = 0.001; // 장애물 초기 속도
const speedIncrement = 0.005; // 속도 증가율

// 배경 이미지 관련 변수
const backgroundImage = new Image();
backgroundImage.src = 'images/background.png'; // 배경 이미지 경로
let backgroundX = 0; // 배경의 x 좌표
const backgroundSpeed = 1; // 배경 이동 속도

function renderBackground() {
    ctx.globalAlpha = 0.5; // 투명도 설정 (0.0: 완전 투명, 1.0: 완전 불투명)

    // 배경 이미지를 두 번 그려 무한 반복 효과
    ctx.drawImage(backgroundImage, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(backgroundImage, backgroundX + canvas.width, 0, canvas.width, canvas.height);

    // 배경 이동
    backgroundX -= backgroundSpeed;

    // 배경이 화면 밖으로 나가면 초기화
    if (backgroundX <= -canvas.width) {
        backgroundX += canvas.width; // 공백 없이 이어지도록 설정
    }

    ctx.globalAlpha = 1.0; // 투명도 초기화 (다른 요소에 영향을 주지 않도록)
}

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
    renderBackground(); // 배경 그리기
    dinosaur.render(); // 공룡 그리기
    renderObstacles(); // 장애물 그리기
    displayScore(); // 점수 표시
}

function updateObstacles() {
    const minDistance = 200; // 장애물 간 최소 거리

    // 마지막 장애물의 x 좌표 확인
    const lastObstacle = obstacles[obstacles.length - 1];
    if (!lastObstacle || lastObstacle.x < canvas.width - minDistance) {
        if (Math.random() < 0.02) { // 2% 확률로 장애물 생성
            obstacles.push(new Obstacle());
        }
    }

    obstacles.forEach((obstacle, index) => {
        obstacle.update();

        // 화면 밖으로 나간 장애물 제거
        if (obstacle.x + obstacle.width < 0) {
            obstacles.splice(index, 1);
        }
    });

    // 시간이 지날수록 장애물 속도 증가
    obstacleSpeed += speedIncrement;
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
        this.gravity = 0.5; // 중력
        this.jumpStrength = 12; // 점프 강도
        this.jumpCount = 0; // 현재 점프 횟수
        this.maxJumps = 2; // 최대 점프 횟수

        // 이미지 로드
        this.image = new Image();
        this.image.src = 'images/dinosaur.png'; // 바닥에 있을 때 이미지
        this.jumpImage = new Image();
        this.jumpImage.src = 'images/dinosaurJump.png'; // 점프 중일 때 이미지
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
        // 점프 중인지 확인하여 이미지 선택
        if (this.y < canvas.height - this.height) {
            ctx.drawImage(this.jumpImage, this.x, this.y, this.width, this.height);
        } else {
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    }

    jump() {
        if (this.jumpCount < this.maxJumps) {
            this.velocityY = -this.jumpStrength; // 위로 점프
            this.jumpCount++; // 점프 횟수 증가
        }
    }
}

// 장애물
class Obstacle {
    constructor() {
        this.type = Math.random() < 0.5 ? 'sprout' : 'flower'; // 50% 확률로 sprout 또는 flower 선택
        this.width = 40; // 기본 너비
        this.height = this.type === 'sprout' ? 30 : 60; // sprout는 키 1, flower는 키 2
        this.x = canvas.width; // 화면 맨 오른쪽에서 시작
        this.y = canvas.height - this.height; // 바닥에 위치
        this.image = new Image();

        if (this.type === 'sprout') {
            this.image.src = 'images/sprout.png'; // 새싹 이미지
        } else {
            this.image.src = 'images/flower.png'; // 꽃 이미지
        }
    }

    update() {
        this.x -= obstacleSpeed; // 전역 속도를 사용하여 장애물 이동
    }

    render() {
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
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