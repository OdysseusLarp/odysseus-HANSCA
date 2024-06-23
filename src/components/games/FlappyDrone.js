import { patchBlob } from '../../blob'

class FlappyDrone {
  constructor(context, canvas, config, game, debug = false) {
    this.ctx = context
    this.cvs = canvas
    this.game = game

    this.drone = new Image()
    this.bg = new Image()
    this.fg = new Image()
    this.pipeNorth = new Image()
    this.pipeSouth = new Image()

    this.drone.src = 'images/flappy/drone.png'
    this.bg.src = 'images/flappy/bg.png'
    this.fg.src = 'images/flappy/fg.png'
    this.pipeNorth.src = 'images/flappy/pipeNorth.png'
    this.pipeSouth.src = 'images/flappy/pipeSouth.png'

    this.currentScore = 0

    this.gap = config.gap
    this.interval = config.interval
    this.bX = 10
    this.bY = 100
    this.gravity = config.gravity
    this.collision = false
    this.requiredScore = config.score
    console.log("FlappyDrone required score:", this.requiredScore)

    this.pipes = [{
      x: canvas.width,
      y: 0
    }]

    this.maxFps = 58; // Old HANSCA phones have 60Hz refresh rate, so we can't go higher than this
    this.lastFrameRenderedAt = Date.now();
    this.debug = debug;
    this.showFps = this.debug;
    this.frameRateCounter = 0;
    this.frameRateCountStartedAt = Date.now();
    this.fps = "";
  }

  calculateFPS() {
    this.frameRateCounter++
    if (Date.now() - this.frameRateCountStartedAt >= 1000) {
      this.fps = this.frameRateCounter
      this.frameRateCounter = 0
      this.frameRateCountStartedAt = Date.now()
    }
  }

  getGap() {
    return this.pipeNorth.height + this.gap
  }

  getHeight() {
    return this.cvs.height
  }

  fly() {
    this.bY -= 25
  }

  shouldRender() {
    const now = Date.now();
    const timeSinceLastFrame = now - this.lastFrameRenderedAt;
    const timeBetweenFrames = 1000 / this.maxFps;
    if (timeSinceLastFrame > timeBetweenFrames) {
      this.lastFrameRenderedAt = now - (timeSinceLastFrame % timeBetweenFrames);
      return true;
    }
    return false;
  }

  draw() {
    const go = () => {
      if (!this.shouldRender()) {
        requestAnimationFrame(go)
        return
      }

      this.drawBg()

      this.drawPipes()
  
      this.drawFg()
  
      this.drawDrone(this.bX, this.bY)
  
      this.bY += this.gravity

      this.drawScore()

      this.drawFps()

      if (this.checkComplete()) {
        this.game.$emit('gameSuccess')
      } else {
        if (!this.collision) requestAnimationFrame(go)
        else {
          let drones = this.game.drones.amount -1
          patchBlob('/data/misc', 'flappy_drone', { amount: drones })
          this.game.$emit('gameFail')
        }
      }
      this.calculateFPS()
    }

    go()
  }

  checkComplete() {
    return this.currentScore >= this.requiredScore
  }

  drawFps() {
    if (!this.showFps) {
      return;
    }
    this.ctx.fillStyle = '#fff'
    this.ctx.font = "20px verdana"
    this.ctx.fillText(`FPS: ${this.fps}`, 10, 40)
  }

  drawPipes() {
    for (let i = 0; i < this.pipes.length; i++) {
      this.drawPipeNorth(this.pipes[i].x, this.pipes[i].y)
      this.drawPipeSouth(this.pipes[i].x, this.pipes[i].y+this.getGap())
    
      this.pipes[i].x--

      if ( this.pipes[i]. x == this.interval ) {
        this.pipes.push({
          x: this.cvs.width,
          y: Math.floor(Math.random() * this.pipeNorth.height) - this.pipeNorth.height
        })
      }

      this.detectCollision(this.pipes[i].x, this.pipes[i].y)

      this.incrementScore(this.pipes[i].x)
    }
  }

  drawDrone(x = 0, y = 0) {
    this.ctx.drawImage(this.drone, x, y)
    if (this.debug) {
      this.drawDroneBorders()
    }
  }

  drawDroneBorders() {
    this.ctx.strokeStyle = 'red'
    this.ctx.strokeRect(this.bX, this.bY, this.drone.width, this.drone.height)
  }

  drawBg() {
    this.ctx.drawImage(this.bg, 0, 0)
  }

  drawFg() {
    this.ctx.drawImage(this.fg, 0, this.getHeight() - this.fg.height)
  }

  drawPipeNorth(x = 0, y = 0) {
    this.ctx.drawImage(this.pipeNorth, x, y)
  }

  drawPipeSouth(x = 0, y = 0) {
    this.ctx.drawImage(this.pipeSouth, x, y)
  }

  drawScore() {
    this.ctx.fillStyle = '#fff'
    this.ctx.font = "20px verdana"
    this.ctx.fillText(`Score: ${this.currentScore}`, 10, 20);
  }

  detectCollision(x, y) {
    if (this.bX + this.drone.width >= x && this.bX <= x + this.pipeNorth.width &&
    (this.bY <= y + this.pipeNorth.height || this.bY + this.drone.height >= y + this.getGap())
    || this.bY + this.drone.height >= this.cvs.height - this.fg.height) {
      this.collision = true
    }
  }

  incrementScore(x) {
    if (x === 5) {
      this.currentScore++
    }
  }
}

export default FlappyDrone
