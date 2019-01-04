<template>
  <v-ons-page>
    <toolbar-top/></toolbar-top>
    <div style="text-align: center;">
      <canvas ref="flappy" width="480" height="640"></canvas>
    </div>
  </v-ons-page>
</template>
<script>
import FlappyDrone from './games/FlappyDrone'
export default {
  name: 'FlappyDrone',
  mounted() {
    const cvs = this.$refs.flappy
    const ctx = cvs.getContext('2d')
    const flappy = new FlappyDrone(ctx, cvs)
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
