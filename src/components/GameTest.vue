<template>
    <v-ons-page>
        <v-ons-toolbar>
            <div class="left"><v-ons-back-button @click.prevent="back()"></v-ons-back-button></div>
            <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
        </v-ons-toolbar>
        <div class="content">
            <p>Phase sync game:</p>
            <div v-if="!playing">
                <p>Dimensions: {{config.dimensions}}</p>
                <v-ons-range v-model="config.dimensions" min="1" max="6" step="1" style="width: 100%"></v-ons-range>
                <p>Difficulty: {{config.difficulty}}</p>
                <v-ons-range v-model="config.difficulty" min="0" max="2" step="0.01" style="width: 100%"></v-ons-range>
                <p>Duration (secs): {{config.duration}}</p>
                <v-ons-range v-model="config.duration" min="0" max="300" step="1" style="width: 100%"></v-ons-range>
                <v-ons-button @click="start">Start</v-ons-button>
            </div>
            <div v-if="playing">
                <phase-sync-game :config="config"></phase-sync-game>
            </div>
        </div>
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
            playing: false,
            finished: false,
            startTime: 0,
            totalTime: 0,
            config: {
                dimensions: 2,
                difficulty: 0.2,
                duration: 1,
            }
        }
    },
    methods: {
        back() {
            this.$store.commit('navigator/pop')
        },
        logout() {
            this.$store.commit('navigator/push', Greeter)
        },
        start() {
            this.playing = true
            this.startTime = Date.now()
        }
    },
}
</script>

<style>
</style>
