<template>
  <v-ons-page>
    <toolbar-top />
    <v-ons-carousel fullscreen swipeable auto-scroll overscrollable
      :index.sync="carouselIndex"
    >
      <v-ons-carousel-item v-for="page in pages" v-bind:key="page.id" :style="{backgroundColor: page.color}">
        <div style="text-align: center; font-size: 30px; margin-top: 20px; color: #fff;">{{page.title}}</div>
        <div style="text-align: center; margin-top: 50px;" class="item-container">
          <span class="scan-item" v-for="tool in page.tools" @click="scan(tool)" v-bind:key="tool.title">
            <v-ons-icon :icon="'fa-' + tool.icon" size="3x"></v-ons-icon><br>
            <span class="scan-title">{{tool.title}}</span>
          </span>
        </div>
      </v-ons-carousel-item>
    </v-ons-carousel>

    <div :style="dots" v-if="Object.keys(pages).length > 1">
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
import MedicalRecords from './MedicalRecords.vue'
import MedicalDiagnosis from './MedicalDiagnosis.vue'
import MedicalSample from './MedicalSample.vue'
import MedicalScanner from './MedicalScanner.vue'
import ScienceArtifactDetails from './ScienceArtifactDetails.vue'
import ScienceInspectObject from './ScienceInspectObject.vue'
import EngineeringScanObject from './EngineeringScanObject.vue'
import Locator from './Locator.vue'

const PAGES = [
  {
    id: 'science',
    title: 'HANSCA / SCIENCE',
    role: 'role:science',
    color: '#085078',
    tools: [
      {
        icon: 'searchengin',
        title: 'Artifact details',
        page: ScienceArtifactDetails,
      },
      {
        icon: 'futbol',
        title: 'Scan object',
        page: ScienceInspectObject,
      },
      {
        icon: 'vial',
        title: 'Take sample',
        page: MedicalSample,
      },
      {
        icon: 'cash-register',
        title: 'XRF Scan',
        page: MedicalScanner,
      },
    ],
  },
  {
    id: 'engineering',
    title: 'HANSCA / ENGINEERING',
    role: 'role:engineer',
    color: '#373B44',
    tools: [
      {
        icon: 'tools',
        title: 'Repair system',
        page: GameScanner,
      },
      {
        icon: 'futbol',
        title: 'Scan object',
        page: EngineeringScanObject,
      },
    ],
  },
  {
    id: 'medic',
    title: 'HANSCA / MEDIC',
    role: 'role:medic',
    color: '#D38312',
    tools: [
      {
        icon: 'diagnoses',
        title: 'Medical details',
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
  },
  {
    id: 'admin',
    title: 'Off-game admin',
    role: 'role:admin',
    color: '#9c4e4e',
    tools: [
      {
        icon: 'atom',
        title: 'Radiation detector',
        page: RadiationDetector,
      },
      {
        icon: 'atom',
        title: 'Phase sync game test',
        page: GameTest,
      },
      {
        icon: 'atom',
        title: 'Locator',
        page: Locator,
      },
      {
        icon: 'atom',
        title: 'Scanner',
        page: Scanner,
      },
    ],
  },
]

export default {
  name: "Carousel",
  /* icons: 'magnet', 'id-card', 'car-battery', 'calculator', 'screwdriver', 'wrench'  */
  data() {
    const user = this.$store.state.user.user;
    const groups = user.groups;
    const pages = PAGES.filter(page => groups.includes(page.role))
    if (pages.length == 0) {
      this.$store.commit('navigator/reset')
      return this.$ons.notification.alert(
          `${user.full_name}, you are not authorized to use any HANSCA features.`,
        { title: 'Unauthorized', maskColor: 'rgba(255, 0, 0, 0.2)' });
    }
    this.$ons.notification.toast(`Welcome to HANSCA, ${user.full_name}!`, { timeout: 2500, animation: 'fall' })
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
<style lang="scss">
.scan-item {
  display: inline-block;
  width: 30%;
  margin: 10px;
  padding: 20px;
  text-align: center;
  overflow: hidden;
}
.scan-title {
  display: inline-block;
  margin-top: 0.8em;
}
</style>
