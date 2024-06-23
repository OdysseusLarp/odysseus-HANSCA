<template>
  <v-ons-page>
    <div style="text-align: center;">
      <canvas ref="flappy" width="480" height="640"></canvas>
    </div>
  </v-ons-page>
</template>
<script>
import FlappyDrone from './FlappyDrone'
import { getBlob } from '../../blob'

export default {
  name: 'FlappyDrone',
  props: [ 'config' ],
  data() {
    return {
      drones: 0
    }
  },
  mounted() {
    const cvs = this.$refs.flappy
    const ctx = cvs.getContext('2d')

    const groups = this.$store.state.user.user.groups || [];
    const isGm = groups.includes('role:admin');
    const debug = process.env.NODE_ENV === 'development' || isGm;

    const flappy = new FlappyDrone(ctx, cvs, this.config, this, debug)
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
  created() {
    this.getDrones()
  },
  methods: {
    async getDrones() {
      this.drones = await getBlob('/data/misc/flappy_drone', '')
    }
  },
}
</script>
<style>

</style>
