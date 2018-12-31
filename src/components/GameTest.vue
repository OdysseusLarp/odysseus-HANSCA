<template>
    <v-ons-page>
        <v-ons-toolbar>
            <div class="left"><v-ons-back-button @click.prevent="back()"></v-ons-back-button></div>
            <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
        </v-ons-toolbar>
        <div class="content">
            <p>
                Phase sync game:
                <span v-if="finished">Success! Took {{totalTime}} seconds.</span>
            </p>
            <div v-if="!playing">
                <p>Dimensions: {{config.dimensions}}</p>
                <p>How many sliders / graphs there are</p>
                <v-ons-range v-model="config.dimensions" min="1" max="6" step="1" style="width: 100%"></v-ons-range>
                <p>Difficulty: {{config.difficulty}}</p>
                <p>How much the sliders affect other graphs. 0.2 is good, larger values harder. (No impact for 1 dimension)</p>
                <v-ons-range v-model="config.difficulty" min="0" max="2" step="0.01" style="width: 100%"></v-ons-range>
                <p>Duration (secs): {{config.duration}}</p>
                <p>How long the lock must be held to complete. 1-3 secs for a "one-off" game, longer useful with drift.</p>
                <v-ons-range v-model="config.duration" min="1" max="60" step="1" style="width: 100%"></v-ons-range>
                <p>Drift: {{config.drift}}</p>
                <p>How much target values drift. Good values 0-0.15</p>
                <v-ons-range v-model="config.drift" min="0" max="0.3" step="0.001" style="width: 100%"></v-ons-range>
                <p></p>
                <v-ons-button @click="start">Start</v-ons-button>
            </div>
            <div v-if="playing">
                <phase-sync-game :config="config" @gameSuccess="gameSuccess"></phase-sync-game>
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
                drift: 0,
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
        },
        gameSuccess() {
            this.finished = true
            this.totalTime = Math.round((Date.now() - this.startTime)/1000)
        }
    },
}
</script>

<style>
</style>
