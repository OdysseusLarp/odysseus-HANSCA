<template>
  <v-ons-page>
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
      bioId: ""
    }
  },
  methods: {
    push() {
      setTimeout(() => { 
        this.$store.commit('navigator/push', Carousel) 
      }, 300)
      cancelWatch()
    },
    async nfcLogin(message) {
      if(message.startsWith( 'bio:')) {
        const id = message.split(':', 2)[1]
        const user = await getBlob('/person/bio', id)
        this.$store.commit('user/login', user)
        cancelWatch()
        this.push()
      }
    },
    async submit() {
      try {
        const user = await getBlob('/person/bio', this.bioId.toUpperCase())
        console.log("Committing user:", user)
        this.$store.commit('user/login', user)
        cancelWatch()
        this.push()
      } catch (e) {
        // no-op
      }
      this.bioId = ""
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
.bioid {
  margin-top: 4em;
}
.submit {
  margin-top: 1em;
}
</style>
