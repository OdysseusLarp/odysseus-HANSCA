<!-- Science version of MedicalScanner.vue -->
<template>
  <v-ons-page>
    <toolbar-top />
    <div class="container">
        <h1>MEDICAL SCANNERS</h1>
        <p>Medical scanners might reveal something about artifacts too.</p>
        <label for="artifact-id">ARTIFACT CATALOG ID<span class="required">*</span></label>
        <input v-model="catalog_id" type="text" id="artifact-id" />
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
        catalog_id: '', // Artifact Catalog ID
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
        this.catalog_id = '';
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
        if (!this.catalog_id) {
            console.log('no catalog_id, not submitting the operation result');
            return;
        }
        const data = {
            is_complete: false,
            is_analysed: false,
            author_id: this.$store.state.user.user.id,
            type: 'SCIENCE',
            additional_type: scannerType,
            catalog_id: this.catalog_id,
      };
      post('/operation', data).then(res => {
          console.log('created operation result for the scan', data);
      }).catch(err => {
          console.log('failed to create operation result for the scan', err);
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
<style lang="scss" scoped>
$gray: #171717;
$light-gray: #383838;
$orange: #f4a140;

input {
  background: lighten($gray, 20);
  background-color: lighten($gray, 20);
  border: 1px solid lighten($gray, 25);
  font-size: 1.6rem;
  padding: 0.5rem;
  color: #fff;
  margin: 1rem;
  margin-top: 0.5rem;
  text-align: center;
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
