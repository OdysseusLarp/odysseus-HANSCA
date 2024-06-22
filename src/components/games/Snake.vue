<template>
  <v-ons-page>
    <div id="app" style="text-align: center;">
      <div class="info">Snake length: {{this.snake.maxCells}} / {{this.targetSnakeLength}}</div>
      <canvas width="288" height="480" ref="gameCanvas"></canvas>
    </div>
    <div class="arrow" style="text-align: center;">
      <div class="row">
        <div></div>
        <div><ons-button @click="up" class="arrow-btn"><ons-icon icon="arrow-up"></ons-icon></ons-button></div>
        <div></div>
      <div class="row">
        <ons-button @click="left" class="arrow-btn"><ons-icon icon="arrow-left"></ons-icon></ons-button>
        <ons-button @click="down" class="arrow-btn"><ons-icon icon="arrow-down"></ons-icon></ons-button>
        <ons-button @click="right" class="arrow-btn"><ons-icon icon="arrow-right"></ons-icon></ons-button>
      </div>
      </div>
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
      showFps: process.env.NODE_ENV !== 'production',
      frameRateCounter: 0,
      frameRateCountStartedAt: Date.now(),
      fps: ''
    };
  },
  mounted() {
    this.initGame();
    document.addEventListener('keydown', this.handleKeydown);
  },
  beforeDestroy() {
    document.removeEventListener('keydown', this.handleKeydown);
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
    resetGame() {
      this.snake.x = 160;
      this.snake.y = 160;
      this.snake.cells = [];
      this.snake.maxCells = 4;
      this.snake.dx = this.grid;
      this.snake.dy = 0;
      this.apple.x = this.getRandomInt(0, 18) * this.grid;
      this.apple.y = this.getRandomInt(0, 30) * this.grid;
    },
    getRandomInt(min, max) {
      return Math.floor(Math.random() * (max - min)) + min;
    },
    handleKeydown(e) {
      if (e.which === 37 && this.snake.dx === 0) {
        this.snake.dx = -this.grid;
        this.snake.dy = 0;
      } else if (e.which === 38 && this.snake.dy === 0) {
        this.snake.dy = -this.grid;
        this.snake.dx = 0;
      } else if (e.which === 39 && this.snake.dx === 0) {
        this.snake.dx = this.grid;
        this.snake.dy = 0;
      } else if (e.which === 40 && this.snake.dy === 0) {
        this.snake.dy = this.grid;
        this.snake.dx = 0;
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
      this.requestId = requestAnimationFrame(this.loop);
      if (++this.count < this.speed) {
        return;
      }
      this.calculateFPS();
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
          this.apple.x = this.getRandomInt(0, 18) * this.grid;
          this.apple.y = this.getRandomInt(0, 30) * this.grid;
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
    }
  }
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

.arrow-btn{
  width: 50px;
  height: 50px;
  margin-left: 4px;
  margin-right: 4px;
  margin-top: 8px;
  padding-top: 8px;
}
</style>
