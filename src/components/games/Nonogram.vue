<template>
  <v-ons-page>
    <div id="app">
      <div class="info">Strikes: {{this.strikes}} / {{this.maxStrikes}} </div>
      <div id="canvas-container" style="text-align: center;"></div>
      <div class="reset">
        <v-ons-button @click="resetGame">Reset</v-ons-button>
      </div>
    </div>
  </v-ons-page>
</template>

<script>
import p5 from 'p5';

export default {
  name: 'Nonogram',
  props: [ 'config' ],
  data() {
    return {
      objectiveFrequency: 0.6,
      gridWidth: this.config.gridWidth,
      gridHeight: this.config.gridHeight,
      cellSize: 50,
      grid: [],
      maxStrikes: this.config.maxStrikes,
      strikes: 0,
      centerTranslation: 0,
      gameIsOver: false,
      topNums: [],
      sideNums: [],
      p5Instance: null,
    };
  },
  methods: {
    make2DGrid() {
      let output = [];
      for (let i = 0; i < this.gridWidth; i++) {
          output[i] = [];
      }
      return output;
    },
    loopGrid(callback) {
      for (let i = 0; i < this.gridWidth; i++) {
        for (let j = 0; j < this.gridHeight; j++) {
          callback(i, j);
        }
      }
    },
    formatArray(cellArr) {
      const arr = cellArr.map(i => i.isObjective);
      const result = [];
      let localSum = 0;
      for (let i = 0; i < arr.length; i++) {
        if (arr[i]) {
          localSum++;
          if (!arr[i + 1]) {
            result.push(localSum);
            localSum = 0;
          }
        }
      }
      return result.join('-');
    },
    strike() {
      this.strikes++;
      if (this.strikes >= this.maxStrikes) {
        setTimeout(this.lose(), 100);
      }
    },
    win() {
      this.gameIsOver = true;
      this.$emit('gameSuccess');
    },
    lose() {
      this.gameIsOver = true;
      this.resetGame();
    },
    getClickedCell(mouseX, mouseY) {
      if (
        mouseX > this.centerTranslation + this.cellSize + this.gridWidth * this.cellSize ||
        mouseX < this.centerTranslation + this.cellSize
      )
        return null;

      if (mouseY > (this.gridHeight + 1) * this.cellSize || mouseY < this.cellSize) return null;

      if (this.gameIsOver) return null;

      return this.grid[Math.floor((mouseX - (this.centerTranslation + this.cellSize)) / this.cellSize)][
        Math.floor((mouseY - this.cellSize) / this.cellSize)
      ];
    },
    setupP5() {
      if (this.p5Instance) {
        this.p5Instance.remove();
      }

      const vm = this;
      this.p5Instance = new p5(function(p) {
        p.setup = function() {
          vm.grid = vm.make2DGrid();
          const canvas = p.createCanvas(350, 450);
          canvas.parent('canvas-container');

          vm.loopGrid((x, y) => {
            vm.grid[x][y] = new Cell(x, y, vm.cellSize, vm);
          });

          vm.topNums = vm.grid.map(col => [vm.formatArray(col), col[0].xPx]);

          vm.sideNums = [];
          for (let i = 0; i < vm.gridHeight; i++) {
            const row = vm.grid.map(col => col[i]);
            vm.sideNums.push([vm.formatArray(row), row[0].yPx]);
          }

          vm.centerTranslation = (p.width - (vm.gridWidth + 1) * vm.cellSize) / 2;
        };

        p.draw = function() {
          p.background("#262626");

          p.translate(vm.centerTranslation, 0);
          p.translate(vm.cellSize, vm.cellSize);

          p.fill('white');
          p.textSize(15);
          p.stroke(4);
          for (let num of vm.topNums) {
            if (num[0].length === 5){
              p.text(num[0], num[1]+6, -10);
            } else if (num[0].length === 3) {
              p.text(num[0], num[1]+12, -10);
            } else if (num[0].length === 1) {
              p.text(num[0], num[1]+20, -10);
            } else {
              p.text(0, num[1]+20, -10)
            }
          }

          for (let num of vm.sideNums) {
            if (num[0].length === 5) {
              p.text(num[0], 0 - vm.cellSize, num[1] + vm.cellSize / 2 + 6);
            } else if (num[0].length === 3) {
              p.text(num[0], 0 - vm.cellSize + 12, num[1] + vm.cellSize / 2 + 6);
            } else if (num[0].length === 1) {
              p.text(num[0], 0 - vm.cellSize + 24, num[1] + vm.cellSize / 2 + 6);
            } else {
              p.text(0, 0 - vm.cellSize + 24, num[1] + vm.cellSize / 2 + 6);
            }
          }
          p.stroke('black');

          vm.loopGrid((x, y) => {
            vm.grid[x][y].show(p);
          });
        };

        p.mouseReleased = function() {
          const clickedOn = vm.getClickedCell(p.mouseX, p.mouseY);
          if (!clickedOn) return;

          if (p.mouseButton === p.LEFT) {
            clickedOn.onLeftClick(vm);
          }
        };

        document.addEventListener('contextmenu', event => event.preventDefault());
      }, document.getElementById('canvas-container'));
    },
    resetGame() {
      this.strikes = 0;
      this.gameIsOver = false;
      this.setupP5();
    },
  },
  mounted() {
    this.setupP5();
  },
  beforeDestroy() {
    if (this.p5Instance) {
      this.p5Instance.remove();
      this.p5Instance = null;
    }
  },
};

class Cell {
  isCorrect = false;
  isIncorrect = false;
  constructor(x, y, d, vm) {
    this.isObjective = Math.random(1) < vm.objectiveFrequency;
    this.x = x;
    this.y = y;
    this.d = d;
    this.r = d / 2;
    this.xPx = x * d;
    this.yPx = y * d;
  }

  show(p) {
    if (this.x % 2 === 1 && this.y % 2 === 1) {
      p.fill(170);
    } else if (this.x % 2 === 1 || this.y % 2 === 1) {
      p.fill(185);
    } else {
      p.fill(200);
    }
    p.rect(this.xPx, this.yPx, this.d, this.d);

    if (this.isCorrect) {
      p.noStroke();
      p.fill('blue');
      p.ellipse(this.xPx + this.r, this.yPx + this.r, this.r);
    } else if (this.isIncorrect) {
      p.stroke('red');
      p.strokeWeight(8);
      p.line(this.xPx + this.d * 0.25, this.yPx + this.d * 0.25, this.xPx + this.d * 0.75, this.yPx + this.d * 0.75);
      p.line(this.xPx + this.d * 0.75, this.yPx + this.d * 0.25, this.xPx + this.d * 0.25, this.yPx + this.d * 0.75);
    }
    p.stroke('black');
    p.strokeWeight(1);
  }

  onLeftClick(vm) {
    if (this.isObjective === true) {
      this.isCorrect = true;

      let won = true;
      vm.loopGrid((x, y) => {
        if (vm.grid[x][y].isObjective && !vm.grid[x][y].isCorrect) {
          won = false;
        }
      });

      if (won) {
        vm.gameIsOver = true;
        setTimeout(() => vm.win(), 100);
      }
    } else if ( this.isIncorrect === false && this.isObjective === false ) {
      this.isIncorrect = true;
      vm.strike();
    }
  }

}
</script>

<style scoped>
#app {
  margin: 0;
  background: hsl(0, 0%, 15%);
  color: white;
  text-align: center;
}
canvas {
  display: block;
  margin: auto;
  margin-top: 5vh;
}
.reset {
  margin-top: 20px;
  padding-bottom: 20px;
}
.info {
  padding-top: 10px;
  margin-bottom: 10px;
}
</style>