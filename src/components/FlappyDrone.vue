<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left"><v-ons-back-button @click.prevent="back()"></v-ons-back-button></div>
      <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
    </v-ons-toolbar>
    <div style="text-align: center;">
      <canvas ref="flappy" width="480" height="640"></canvas>
    </div>
  </v-ons-page>
</template>
<script>
import Greeter from './Greeter.vue'
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
  methods: {
    back() {
      this.$store.commit('navigator/pop')
    },
      logout() {
        this.$store.commit('navigator/push', Greeter)
      },
  },
}
</script>
<style>

</style>
