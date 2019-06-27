<template>
  <v-ons-page @show="show" @hide="hide">
    <div class="greeter">
        <h1>HANSCA</h1>
        <h3>The Standard Universal Hand Scanner</h3>
        <p class="bioid">Bio ID:</p>
        <v-ons-input v-model="bioId"></v-ons-input>
        <v-ons-button class="submit" @click="submit">Submit</v-ons-button>
        <p class="version">Version {{version}}</p>
    </div>
  </v-ons-page>
</template>

<script>
import Carousel from './Carousel.vue'
import { startWatch, cancelWatch } from '../nfc'
import { getBlob, patchBlob } from '../blob'

export default {
  name: "greeter",
  data() {
    return {
      bioId: '',
      version: '627.1710',  // <month><day>.<hour><minute>
    }
  },
  created() {
    getBlob('/data/misc', 'hansca').then(res => {
      const analyseBaseTime = res.data.analyseBaseTime;
      this.$store.commit('user/analyseBaseTime', analyseBaseTime || 90);
    }).catch(err => {
      console.log('could not get hansca config from backend', err);
    });
  },
  methods: {
    nfcLogin(message) {
      if(message.startsWith('bio:')) {
        const id = message.split(':', 2)[1]
        this.login(id)
      } else {
        this.$ons.notification.toast('Scanned tag is not a Bio ID', { timeout: 2500, animation: 'fall' })
      }
    },
    submit() {
      this.login(this.bioId)
    },
    async login(bioId) {
      try {
        const user = await getBlob('/person/bio', bioId.toLowerCase());
        if (!user) throw new Error('user is null');
        console.log("Committing user:", user)
        this.$store.commit('user/login', user)

        // User skill level, so that things that take time can be defined for novices
        // and then multiplied by user.skillFactor to make it faster for more skilled characters
        const isExpert = user.groups.includes('skill:expert');
        const isMaster = user.groups.includes('skill:master');
        this.$store.commit('user/skillFactor', isExpert ? 0.33 : isMaster ? 0.66 : 1);

        this.$store.commit('navigator/push', Carousel)
      } catch (e) {
        console.log("User login error", e)
        this.$ons.notification.alert(
          'Authorization to ship server failed',
        { title: 'Error', maskColor: 'rgba(255, 0, 0, 0.2)' });
      }
      this.bioId = ""
    },
    show() {
      startWatch(this.nfcLogin)
    },
    hide() {
      cancelWatch()
    },
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
.bioid {
  margin-top: 4em;
}
.submit {
  margin-top: 1em;
}
.version {
  margin-top: 5em;
  color: #444;
}
</style>
