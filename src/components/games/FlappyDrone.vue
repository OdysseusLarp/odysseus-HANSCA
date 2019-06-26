<template>
  <v-ons-page>
    <div style="text-align: center;">
      <canvas ref="flappy" width="480" height="640"></canvas>
    </div>
  </v-ons-page>
</template>
<script>
import FlappyDrone from './FlappyDrone'
export default {
  name: 'FlappyDrone',
  props: [ 'config' ],
  mounted() {
    const cvs = this.$refs.flappy
    const ctx = cvs.getContext('2d')
    const flappy = new FlappyDrone(ctx, cvs, this.config, this)
    setTimeout(() => {
      flappy.draw()
    }, 0)
    document.addEventListener('touchstart', (e) => {
      flappy.fly()
      e.preventDefault()
    })
    document.addEventListener('keydown', (e) => {
      flappy.fly()
      e.preventDefault()
    })
  },
}
</script>
<style>

</style>
