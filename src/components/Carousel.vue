<template>
  <v-ons-page>
    <toolbar-top/></toolbar-top>
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
import Scanner from './Scanner.vue'
import GameScanner from './GameScanner'
import RadiationDetector from './RadiationDetector.vue'
import GameTest from './GameTest.vue'
import LightsOut from './LightsOut.vue'
import MedicalRecords from './MedicalRecords.vue'
import MedicalDiagnosis from './MedicalDiagnosis.vue'
import MedicalSample from './MedicalSample.vue'
import MedicalScanner from './MedicalScanner.vue'
import ScienceArtifactDetails from './ScienceArtifactDetails.vue'
import ScienceInspectObject from './ScienceInspectObject.vue'
import FlappyDrone from './FlappyDrone.vue'
import Locator from './Locator.vue'

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
          tools: [ 'cogs', 'compass', 'microchip', 'globe', 'charging-station', 'hammer', 'project-diagram', 'rocket', 'ruler', 'satellite', 'sliders-h', 'tools' ],
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
    scan(tool) {
      if (tool === 'radiation') {
        this.$store.commit('navigator/push', RadiationDetector)
      } else if (tool === 'atom') {
        this.$store.commit('navigator/push', GameScanner)
      } else if (tool === 'dna') {
        this.$store.commit('navigator/push', ScienceArtifactDetails)
      } else if (tool === 'vial') {
        this.$store.commit('navigator/push', ScienceInspectObject)
      } else if (tool === 'project-diagram') {
        this.$store.commit('navigator/push', LightsOut)
      } else if (tool === 'chart-bar') {
        this.$store.commit('navigator/push', GameTest)
      } else if (tool === 'notes-medical') {
        this.$store.commit('navigator/push', MedicalRecords)
      } else if (tool === 'microscope') {
        this.$store.commit('navigator/push', MedicalScanner)
      } else if (tool === 'pills') {
        this.$store.commit('navigator/push', MedicalDiagnosis);
      } else if (tool === 'prescription-bottle' || tool === 'medkit') {
        this.$store.commit('navigator/push', MedicalSample);
      } else if (tool === 'satellite') {
        this.$store.commit('navigator/push', FlappyDrone)
      } else if (tool === 'compass') {
        this.$store.commit('navigator/push', Locator)
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
