<template>
  <v-ons-page @show="show" @hide="hide">
    <div class="greeter">
        <h1>HANSCA</h1>
        <h3>The Standard Universal Hand Scanner</h3>
        <p class="bioid">Bio ID:</p>
        <v-ons-input v-model="bioId"></v-ons-input>
        <v-ons-button class="submit" @click="submit">Submit</v-ons-button>
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
      bioId: "",
    }
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
        const user = await getBlob('/person/bio', bioId.toUpperCase());
        console.log("Committing user:", user)
        this.$store.commit('user/login', user)
        this.$store.commit('navigator/push', Carousel)
        this.$ons.notification.toast(`Welcome to HANSCA, ${user.full_name}!`, { timeout: 2500, animation: 'fall' })
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
</style>
