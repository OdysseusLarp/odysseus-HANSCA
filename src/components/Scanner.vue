<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left"><v-ons-back-button @click.prevent="back()"></v-ons-back-button></div>
      <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
    </v-ons-toolbar>
    <div style="text-align: center; margin-top: 50px;">
      <div v-if="state == 'scanning'">
        <h2>Scanning...</h2>
      <v-ons-progress-bar indeterminate></v-ons-progress-bar>
      </div>
      <div v-if="state == 'processing'">
        <h2>Prosessing...</h2>
      <v-ons-progress-bar :value="dataProgress" secondary-value="100"></v-ons-progress-bar>
      <br>
      <v-ons-progress-bar :value="dataProgress1" secondary-value="100"></v-ons-progress-bar>
      <br>
      <v-ons-progress-bar :value="dataProgress2" secondary-value="100"></v-ons-progress-bar>
      </div>
    <div v-if="state == 'results'">
        <h2>Results</h2>
      <v-ons-progress-circular value="-20" secondary-value="70"></v-ons-progress-circular>
      <v-ons-progress-circular value="90" secondary-value="100"></v-ons-progress-circular>
      <v-ons-progress-circular value="40" secondary-value="80"></v-ons-progress-circular>
      <v-ons-progress-circular value="50" secondary-value="60"></v-ons-progress-circular>
      <v-ons-progress-circular value="60" secondary-value="80"></v-ons-progress-circular>
    </div>
      <v-ons-bottom-toolbar transparent>
        <v-ons-button modifier="outline" style="margin: 6px 0" @click="scan()">Scan</v-ons-button>
      </v-ons-bottom-toolbar>
    </div>
  </v-ons-page>
</template>
<script>
export default {
  data() {
    return {
      scanProgress: 0,
      dataProgress: 0,
      dataProgress1: 0,
      dataProgress2: 0,
      intervalID: 0,
      intervalID1: 0,
      intervalID2: 0,
      state: ''
    }
  },
  methods: {
    back() {
      this.$store.commit('navigator/pop')
    },
    scan() {
      this.state = 'scanning'
      this.scanProgress = 0
      this.dataProgress = 0
      this.dataProgress1 = 0
      this.dataProgress2 = 0
      this.intervalID = setInterval(() => {
        if (this.scanProgress === 100) {
          clearInterval(this.intervalID)
          this.state = 'processing'
          this.analyze()
          return
        }
        this.scanProgress++
      }, 40)
    },
    analyze() {
      this.intervalID = setInterval(() => {
        if (this.dataProgress === 100) {
          clearInterval(this.intervalID)
          return
        }
        this.dataProgress++
      }, 60)
      this.intervalID1 = setInterval(() => {
        if (this.dataProgress1 === 100) {
          clearInterval(this.intervalID1)
          return
        }
        this.dataProgress1++
      }, 40)

      this.intervalID2 = setInterval(() => {
        if (this.dataProgress2 === 100) {
          clearInterval(this.intervalID2)
          this.state = 'results'
          return
        }
        this.dataProgress2++
      }, 90)

    }

  }
}
</script>
<style>
ons-progress-circular {
  width: 64px;
  height: 64px;
}
.progress-circular {
  width: 64px;
  height: 64px;
}
</style>
