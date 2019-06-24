<template>
  <v-ons-page>
    <toolbar-top />
    <div class="container">
        <h1>MEDICAL SCANNERS</h1>
        <button :disabled="standingInProgress" type="button" class="button-standing-scanner" @click="startStandingScanner">
          {{ standingInProgress ? 'STANDING SCANNER IS SCANNING...' : 'START STANDING SCANNER' }}
        </button>
        <button :disabled="tableInProgress" type="button" class="button-table-scanner" @click="startTableScanner">
          {{ tableInProgress ? 'TABLE SCANNER IS SCANNING...' : 'START TABLE SCANNER' }}
        </button>
    </div>
  </v-ons-page>
</template>
<script>
import { post } from 'axios';

// Should get the channel config from backend /dmx/channels
// but aint nobody got time for that right now
const STANDING_SCANNER_DMX_CHANNEL = 163;
const TABLE_SCANNER_DMX_CHANNEL = 164;

const SCAN_DURATION = 30 * 1000;

export default {
  data() {
    return {
        tableInProgress: false,
        tableInProgressTimeout: null,
        standingInProgress: false,
        standingInProgressTimeout: null,
    }
  },
  methods: {
    startTableScanner() {
        if (this.tableInProgress) return;
        this.startScanner(TABLE_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.tableInProgress = true;
            this.tableInProgressTimeout = setTimeout(() => this.tableInProgress = false, SCAN_DURATION);
        });
    },
    startStandingScanner() {
        if (this.standingInProgress) return;
        this.startScanner(STANDING_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.standingInProgress = true;
            this.standingInProgressTimeout = setTimeout(() => this.standingInProgress = false, SCAN_DURATION);
        })
    },
    startScanner(channel) {
        console.log('Launching DMX', channel);
        return post(`/dmx/event/${channel}`).then(() => {
            this.$ons.notification.alert(
            'Scanner is initializing',
            { title: 'Initializing scanner...', maskColor: 'rgba(0, 255, 0, 0.2)' });
            return true;
        }).catch(() => {
            this.$ons.notification.alert(
            'Could not start the scanner',
            { title: 'Error', maskColor: 'rgba(255, 0, 0, 0.2)' });
            return false;
        });
    }
  },
  watch: {},
  created() {},
  destroyed() {
      clearTimeout(this.tableInProgress);
      clearTimeout(this.standingInProgress);
  }
}
</script>
<style lang="scss">
$gray: #171717;
$light-gray: #383838;
$orange: #f4a140;

button {
  background: darken($orange, 10);
  border: 0.1rem solid darken($orange, 25);
  font-size: 1.6rem;
  padding: 1.5rem 0.9rem;
  margin: 0.5rem;
  margin-top: 4rem;
  color: #fff;
  text-shadow: 0px 0px 3px rgba(0, 0, 0, .8);
}
button:disabled {
    background: darken($orange, 30);
    animation: scanner-blinker 2s linear infinite;
}

@keyframes scanner-blinker {
    50% {
        background: darken($orange, 20);
    }
}
</style>
