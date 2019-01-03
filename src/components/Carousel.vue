<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
    </v-ons-toolbar>

    <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
      :index.sync="carouselIndex"
    >
      <v-ons-carousel-item v-for="(value, key) in items" :style="{backgroundColor: value.color}">
        <div style="text-align: center; font-size: 30px; margin-top: 20px; color: #fff;">{{key}}</div>
        <div style="text-align: center; margin-top: 50px;">
          <span class="scan-item" v-for="tool in value.tools"><v-ons-icon @click="scan(tool)" :icon="'fa-' + tool" size="3x"></v-ons-icon></span>
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
import RadiationDetector from './RadiationDetector.vue'
import GameTest from './GameTest.vue'
import LightsOut from './LightsOut.vue'
export default {
  name: "Carousel",
  /* icons: 'magnet', 'id-card', 'car-battery', 'calculator', 'screwdriver', 'wrench'  */
  data() {
    return {
      carouselIndex: 0,
      items: {
        SCIENCE: {
          color: '#085078',
          tools: [ 'atom', 'dna', 'vial', 'flask', 'biohazard', 'chart-bar', 'eye-dropper', 'mortar-pestle', 'radiation', 'skull-crossbones', 'square-root-alt', 'temperature-high' ],
        },
        ENGINEERING: {
          color: '#373B44',
          tools: [ 'cogs', 'compass',  'microchip', 'globe', 'charging-station', 'hammer', 'project-diagram', 'rocket', 'ruler', 'satellite', 'sliders-h', 'tools' ],
        },
        MEDIC: {
          color: '#D38312',
          tools: [ 'medkit', 'microscope', 'syringe', 'diagnoses', 'x-ray', 'band-aid', 'brain', 'first-aid', 'heartbeat', 'notes-medical', 'pills', 'prescription-bottle' ]
        },
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
    scan(tool) {
      if (tool === 'radiation') {
        this.$store.commit('navigator/push', RadiationDetector)
      } else if (tool === 'project-diagram') {
        this.$store.commit('navigator/push', LightsOut)
      }  else {
        this.$store.commit('navigator/push', Scanner)
      }
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
