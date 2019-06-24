<template>
    <v-ons-toolbar>
      <div class="left"><v-ons-back-button v-if="showLogout" @click.prevent="back()"></v-ons-back-button></div>
      <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
    </v-ons-toolbar>
</template>
<script>
import Greeter from './Greeter.vue'
import { cancelWatch } from '../nfc'
export default {
  name: 'ToolbarTop',
  methods: {
    back() {
      cancelWatch()
      this.$store.commit('navigator/pop')
    },
    logout() {
      cancelWatch()
      this.$store.commit('user/logout')
      this.$store.commit('navigator/reset', Greeter)
    },
  },
  computed: {
    showLogout() {
      return this.$store.getters['navigator/current'] !== 'Carousel'
    }
  }
}
</script>

