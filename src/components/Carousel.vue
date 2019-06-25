<template>
  <v-ons-page>
    <toolbar-top />
    <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
      :index.sync="carouselIndex"
    >
      <v-ons-carousel-item v-for="page in pages" v-bind:key="page.id" :style="{backgroundColor: page.color}">
        <div style="text-align: center; font-size: 30px; margin-top: 20px; color: #fff;">{{page.title}}</div>
        <div style="text-align: center; margin-top: 50px;">
          <span class="scan-item" v-for="tool in page.tools" v-bind:key="tool.title">
            <v-ons-icon @click="scan(tool)" :icon="'fa-' + tool.icon" size="3x"></v-ons-icon><br>
            <span class="scan-title">{{tool.title}}</span>
          </span>
        </div>
      </v-ons-carousel-item>
    </v-ons-carousel>

    <div :style="dots">
      <span :index="dotIndex - 1" v-for="dotIndex in Object.keys(pages).length" :key="dotIndex" style="cursor: pointer" @click="carouselIndex = dotIndex - 1">
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
import ScienceAnalysis from './ScienceAnalysis.vue'
import ScienceScanner from './ScienceScanner.vue'
import FlappyDrone from './FlappyDrone.vue'
import Locator from './Locator.vue'

const PAGES = [
  {
    id: 'science',
    title: 'Science',
    role: 'role:science',
    color: '#085078',
    tools: [
      {
        icon: 'searchengin',
        title: 'Scan artifact',
        page: ScienceArtifactDetails,
      },
      {
        icon: 'futbol',
        title: 'Inspect object',
        page: ScienceInspectObject,
      },
      {
        icon: 'puzzle-piece',
        title: 'Analyze',
        page: ScienceAnalysis,
      },
      {
        icon: 'cash-register',
        title: 'Operate scanners',
        page: ScienceScanner,
      },
    ],
  },
  {
    id: 'engineering',
    title: 'Engineering',
    role: 'role:engineer',
    color: '#373B44',
    tools: [
      {
        icon: 'tools',
        title: 'Repair system',
        page: GameScanner,
      },
    ],
  },
  {
    id: 'medic',
    title: 'Medic',
    role: 'role:medic',
    color: '#D38312',
    tools: [
      {
        icon: 'diagnoses',
        title: 'Medical scan',
        page: MedicalRecords,
      },
      {
        icon: 'user-injured',
        title: 'Diagnose injury',
        page: MedicalDiagnosis,
      },
      {
        icon: 'vial',
        title: 'Take sample',
        page: MedicalSample,
      },
      {
        icon: 'cash-register',
        title: 'Operate scanners',
        page: MedicalScanner,
      },
    ],
  }
]

export default {
  name: "Carousel",
  /* icons: 'magnet', 'id-card', 'car-battery', 'calculator', 'screwdriver', 'wrench'  */
  data() {
    const groups = this.$store.state.user.user.groups;
    const pages = PAGES.filter(page => groups.includes(page.role))

    return {
      carouselIndex: 0,
      pages,
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
      this.$store.commit('navigator/push', tool.page)
    }
  }
}
</script>
<style>
.scan-item {
  display: inline-block;
  margin: 20px;
  width: 80px;
  height: 100px;
  text-align: center;
  overflow: hidden;
}
.scan-title {
  display: inline-block;
  margin-top: 0.8em;
}
</style>
