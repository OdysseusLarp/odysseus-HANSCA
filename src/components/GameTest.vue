<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left"><v-ons-back-button @click.prevent="back()"></v-ons-back-button></div>
      <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
    </v-ons-toolbar>
    <phase-sync-game></phase-sync-game>
  </v-ons-page>
</template>

<script>
import PhaseSyncGame from './games/PhaseSyncGame.vue'
export default {
  components: {
    PhaseSyncGame
  },
  data() {
    return {
    }
  },
  methods: {
    back() {
      this.$store.commit('navigator/pop')
    },
    logout() {
      this.$store.commit('navigator/push', Greeter)
    },
  },
}
</script>

<style>
</style>
