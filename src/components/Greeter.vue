<template>
  <v-ons-page @click="push()">
    <v-ons-ripple color='#D38312' background='#373B44'>
      <div class="greeter">
          <h1>HANSCA</h1>
          <h3>The Standard Universal Hand Scanner</h3>
</div>
    </v-ons-ripple>
  </v-ons-page>
</template>

<script>
import Carousel from './Carousel.vue'
import { startWatch, cancelWatch } from '../nfc'
export default {
  name: "greeter",
  methods: {
    push() {
      setTimeout(() => { 
        this.$store.commit('navigator/push', Carousel) 
      }, 300)
      cancelWatch()
    },
    nfcLogin() {
      cancelWatch()
      this.push()
    }
  },
  created() {
    startWatch(this.nfcLogin)
  },
}
</script>
<style>
.greeter {
  width: 100%;
  height: 100%;
  vertical-align: middle;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.greeter h1 {
  color: #D38312;
}
</style>
