<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
    </v-ons-toolbar>

    <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
      :index.sync="carouselIndex"
    >
      <v-ons-carousel-item v-for="(value, key) in items" :style="{backgroundColor: value}">
        <div style="text-align: center; font-size: 30px; margin-top: 20px; color: #fff;">{{key}}</div>
        <div style="text-align: center; margin-top: 50px;">
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-dna" size="3x"></v-ons-icon></span>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-vial" size="3x"></v-ons-icon></span>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-band-aid" size="3x"></v-ons-icon></span>
          <br>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-cogs" size="3x"></v-ons-icon></span>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-screwdriver" size="3x"></v-ons-icon></span>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-flask" size="3x"></v-ons-icon></span>
          <br>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-medkit" size="3x"></v-ons-icon></span>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-microscope" size="3x"></v-ons-icon></span>
          <span class="scan-item"><v-ons-icon @click="scan()" icon="fa-syringe" size="3x"></v-ons-icon></span>
        </div>
      </v-ons-carousel-item>
    </v-ons-carousel>

    <div :style="dots">
      <span :index="dotIndex - 1" v-for="dotIndex in Object.keys(items).length" :key="dotIndex" style="cursor: pointer" @click="carouselIndex = dotIndex - 1">
        {{ carouselIndex === dotIndex - 1 ? '\u25CF' : '\u25CB' }}
      </span>
    </div>
  </v-ons-page>
</template>
<script>
import Greeter from './Greeter.vue'
import Scanner from './Scanner.vue'
export default {
  name: "Carousel",
  data() {
    return {
      carouselIndex: 0,
      items: {
        SCIENCE: '#085078',
        ENGINEERING: '#373B44',
        MEDIC: '#D38312'
      },
      dots: {
        textAlign: 'center',
        fontSize: '30px',
        color: '#fff',
        position: 'absolute',
        bottom: '40px',
        left: 0,
        right: 0
      },
    }
  },
  methods: {
    logout() {
      this.$store.commit('navigator/push', Greeter)
    },
    scan() {
      this.$store.commit('navigator/push', Scanner)
    }
  }
}
</script>
<style>
.scan-item {
  display: inline-block;
  margin: 20px;
  width: 80px;
  height: 80px;
  text-align: center;
}
</style>
