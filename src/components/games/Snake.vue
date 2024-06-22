<template>
  <v-ons-page>
    <div id="app" style="text-align: center;">
      <div class="info">Snake length: {{this.snake.maxCells}} / {{this.targetSnakeLength}}</div>
      <canvas width="400" height="700" ref="gameCanvas"></canvas>
    </div>
  </v-ons-page>
</template>

<script>
export default {
  name: 'Snake',
  props: [ 'config' ],
  data() {
    return {
      speed: this.config.speed, // 12 is ok bigger the slower
      targetSnakeLength: this.config.targetSnakeLength,
      grid: 16,
      count: 0,
      snake: {
        x: 160,
        y: 160,
        dx: 16,
        dy: 0,
        cells: [],
        maxCells: 4
      },
      apple: {
        x: 320,
        y: 320
      },
      requestId: null,
      debug: process.env.NODE_ENV !== 'production',
      frameRateCounter: 0,
      frameRateCountStartedAt: Date.now(),
      fps: '',
      maxFps: 90,
      lastFrameRenderedAt: Date.now(),
      // Support for touch controls (swipe)
      touchStartX: 0,
      touchStartY: 0,
      touchEndX: 0,
      touchEndY: 0,
    };
  },
  computed: {
    showFps() {
      return this.debug;
    }
  },
  mounted() {
    this.initGame();
    document.addEventListener('keydown', this.handleKeydown);
    document.addEventListener('touchstart', this.handleTouchStart);
    document.addEventListener('touchmove', this.handleTouchMove);
    document.addEventListener('touchend', this.handleTouchEnd);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
    document.removeEventListener('touchstart', this.handleTouchStart);
    document.removeEventListener('touchmove', this.handleTouchMove);
    document.removeEventListener('touchend', this.handleTouchEnd);
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
  },
  methods: {
    initGame() {
      this.resetGame();
      this.requestId = requestAnimationFrame(this.loop);
    },
    calculateFPS() {
      this.frameRateCounter++
      if (Date.now() - this.frameRateCountStartedAt >= 1000) {
        this.fps = this.frameRateCounter
        this.frameRateCounter = 0
        this.frameRateCountStartedAt = Date.now()
      }
    },
   shouldRender() {
    const now = Date.now();
    const timeSinceLastFrame = now - this.lastFrameRenderedAt;
    const timeBetweenFrames = 1000 / this.maxFps;
    if (timeSinceLastFrame > timeBetweenFrames) {
      this.lastFrameRenderedAt = now - (timeSinceLastFrame % timeBetweenFrames);
      return true;
    }
    return false;
   },
    resetGame() {
      this.snake.x = 160;
      this.snake.y = 160;
      this.snake.cells = [];
      this.snake.maxCells = 4;
      this.snake.dx = this.grid;
      this.snake.dy = 0;

      const applePosition = this.getFreeApplePosition();
      this.apple.x = applePosition.x;
      this.apple.y = applePosition.y;
    },
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
    getFreeApplePosition() {
      let x = this.getRandomInt(0, 18) * this.grid;
      let y = this.getRandomInt(0, 30) * this.grid;
      while (this.snake.cells.some(cell => cell.x === x && cell.y === y)) {
        x = this.getRandomInt(0, 18) * this.grid;
        y = this.getRandomInt(0, 30) * this.grid;
      }
      return { x, y };
    },
    handleKeydown(e) {
      switch (e.key) {
        case 'ArrowLeft':
          this.left();
          break;
        case 'ArrowUp':
          this.up();
          break;
        case 'ArrowRight':
          this.right();
          break;
        case 'ArrowDown':
          this.down();
          break;
        default:
          break;
      }
    },
    up() {
      if (this.snake.dy === 0) {
        this.snake.dy = -this.grid;
        this.snake.dx = 0;
      }
    },
    down() {
      if (this.snake.dy === 0) {
        this.snake.dy = this.grid;
        this.snake.dx = 0;
      }
    },
    left() {
      if (this.snake.dx === 0) {
        this.snake.dx = -this.grid;
        this.snake.dy = 0;
      }
    },
    right() {
      if (this.snake.dx === 0) {
        this.snake.dx = this.grid;
        this.snake.dy = 0;
      }
    },
    loop() {
      if (!this.shouldRender()) {
        this.requestId = requestAnimationFrame(this.loop);
        return;
      }

      this.calculateFPS();

      this.requestId = requestAnimationFrame(this.loop);
      if (++this.count < this.speed) {
        return;
      }
      this.count = 0;
      const canvas = this.$refs.gameCanvas;
      const context = canvas.getContext('2d');
      context.clearRect(0, 0, canvas.width, canvas.height);

      this.snake.x += this.snake.dx;
      this.snake.y += this.snake.dy;

      if (this.snake.x < 0) {
        this.snake.x = canvas.width - this.grid;
      } else if (this.snake.x >= canvas.width) {
        this.snake.x = 0;
      }

      if (this.snake.y < 0) {
        this.snake.y = canvas.height - this.grid;
      } else if (this.snake.y >= canvas.height) {
        this.snake.y = 0;
      }

      this.snake.cells.unshift({ x: this.snake.x, y: this.snake.y });
      if (this.snake.cells.length > this.snake.maxCells) {
        this.snake.cells.pop();
      }

      context.fillStyle = 'red';
      context.fillRect(this.apple.x, this.apple.y, this.grid - 1, this.grid - 1);

      context.fillStyle = '#c26c0a';
      this.snake.cells.forEach((cell, index) => {
        context.fillRect(cell.x, cell.y, this.grid - 1, this.grid - 1);

        if (cell.x === this.apple.x && cell.y === this.apple.y) {
          this.snake.maxCells++;
          if (this.snake.maxCells === this.targetSnakeLength) {
            this.$emit('gameSuccess');
          }
          const applePosition = this.getFreeApplePosition();
          this.apple.x = applePosition.x;
          this.apple.y = applePosition.y;
        }

        for (let i = index + 1; i < this.snake.cells.length; i++) {
          if (cell.x === this.snake.cells[i].x && cell.y === this.snake.cells[i].y) {
            this.resetGame();
          }
        }
      });

      if (this.showFps) {
        context.fillStyle = '#fff';
        context.font = '20px verdana';
        context.fillText(`FPS: ${this.fps}`, 10, 20);
      }
    },
    handleTouchStart(e) {
      this.touchStartX = e.touches[0].clientX;
      this.touchStartY = e.touches[0].clientY;
    },
    handleTouchMove(e) {
      this.touchEndX = e.touches[0].clientX;
      this.touchEndY = e.touches[0].clientY;
    },
    handleTouchEnd() {
      const deltaX = this.touchEndX - this.touchStartX;
      const deltaY = this.touchEndY - this.touchStartY;

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Horizontal swipe
        if (deltaX > 0) {
          // Swipe Right
          this.right();
        } else {
          // Swipe Left
          this.left();
        }
      } else {
        // Vertical swipe
        if (deltaY > 0) {
          // Swipe Down
          this.down();
        } else {
          // Swipe Up
          this.up();
        }
      }
    },
  },
};
</script>

<style scoped>
html, body {
  height: 100%;
  margin: 0;
}

body {
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

canvas {
  border: 1px solid white;
}

.info {
  padding-top: 10px;
  margin-bottom: 10px;
}
</style>
