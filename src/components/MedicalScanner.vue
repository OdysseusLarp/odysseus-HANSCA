<!-- Medical version of ScienceScanner.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div class="container">
        <h1>MEDICAL SCANNERS</h1>
        <p class="has-id" v-if="bio_id">BIO ID OK</p>
        <p class="no-bio-id" v-else-if="!standingInProgress && !tableInProgress">SCAN PATIENT BIO ID</p>
        <button :disabled="standingInProgress || tableInProgress" type="button" class="button-standing-scanner" @click="startStandingScanner">
          {{ standingInProgress ? 'STANDING SCANNER IS SCANNING...' : 'START STANDING SCANNER' }}
        </button>
        <button :disabled="tableInProgress || standingInProgress" type="button" class="button-table-scanner" @click="startTableScanner">
          {{ tableInProgress ? 'TABLE SCANNER IS SCANNING...' : 'START TABLE SCANNER' }}
        </button>
    </div>
  </v-ons-page>
</template>
<script>
import { post } from 'axios';
import { startWatch, cancelWatch, hasNfc } from '../nfc'

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
        hasInput: !hasNfc(),
        bio_id: '', // Target person Bio ID
    }
  },
  methods: {
    startTableScanner() {
        if (this.tableInProgress) return;
        this.startScanner(TABLE_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.postOperationResults('TABLE_SCANNER');
            this.tableInProgress = true;
            this.tableInProgressTimeout = setTimeout(() => this.clearScanning(), SCAN_DURATION);
        });
    },
    startStandingScanner() {
        if (this.standingInProgress) return;
        this.startScanner(STANDING_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.postOperationResults('STANDING_SCANNER');
            this.standingInProgress = true;
            this.standingInProgressTimeout = setTimeout(() => this.clearScanning(), SCAN_DURATION);
        })
    },
    clearScanning() {
        this.standingInProgress = false;
        this.tableInProgress = false;
        this.bio_id = '';
    },
    startScanner(channel) {
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
    },
    postOperationResults(scannerType) {
        if (!this.bio_id) {
            console.log('no bio_id, not submitting the operation result');
            return;
        }
        const data = {
            is_complete: false,
            is_analysed: false,
            author_id: this.$store.state.user.user.id,
            type: 'MEDIC',
            additional_type: scannerType,
            bio_id: this.bio_id,
      };
      post('/operation', data).then(res => {
          console.log('created operation result for the scan', data);
      }).catch(err => {
          console.log('failed to create operation result for the scan', err);
      });
    },
    setBioId(message) {
        console.log('got message', message);
        if (message.startsWith('bio:')) {
            console.log('starts with bio');
            const id = message.split(':', 2)[1];
            this.bio_id = id;
            console.log('this bio id =>', this.bio_id);
        } else {
            this.$ons.notification.toast('Scanned tag is not a Bio ID', { timeout: 2500, animation: 'fall' });
        }
    },
    show() {
        startWatch(this.setBioId)
    },
    hide() {
        cancelWatch()
    }
  },
  watch: {},
  created() {},
  destroyed() {
      clearTimeout(this.tableInProgress);
      clearTimeout(this.standingInProgress);
  },
}
</script>
<style lang="scss">
$gray: #171717;
$light-gray: #383838;
$orange: #f4a140;

.has-id {
    color: rgb(88, 240, 88);
}
.no-bio-id {
    color: rgb(228, 78, 78);
}

button {
  background: darken($orange, 10);
  border: 0.1rem solid darken($orange, 25);
  font-size: 1.6rem;
  padding: 1.5rem 0.9rem;
  margin: 0.5rem;
  color: #fff;
  margin-top: 2rem;
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
