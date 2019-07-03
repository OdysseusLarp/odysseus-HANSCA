<!-- Medical version of ScienceScanner.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div class="container no-top-margin">
        <h1>MEDICAL SCANNERS</h1>
        <p class="bio-id has-id" v-if="bio_id">BIO ID OK</p>
        <p class="bio-id no-bio-id" v-else-if="!standingInProgress && !tableInProgress">SCAN PATIENT BIO ID<span class="required">*</span></p>
        <label for="additional-type">SCAN TYPE<span class="required">*</span></label>
        <v-ons-select name="additional-type" class="type-select" v-model="additional_type" @change="validateForm" :disabled="standingInProgress || tableInProgress">
          <option v-for="option in typeOptions" :value="option.key" v-bind:key="option.key">
            {{ option.text }}
          </option>
        </v-ons-select>
        <label for="sample-description" class="label-description" v-if="additional_type === 'OTHER_SCAN'">DESCRIPTION<span class="required">*</span></label>
        <span class="subtitle" v-if="additional_type === 'OTHER_SCAN'">(What area your scan is targeting)</span>
        <textarea v-model="description" id="sample-description" v-if="additional_type === 'OTHER_SCAN'" @keyup="validateForm" :disabled="standingInProgress || tableInProgress" />
        <button v-bind:class="{ 'in-progress': standingInProgress || tableInProgress }" :disabled="standingInProgress || tableInProgress || !isValid || !bio_id" type="button" class="button-standing-scanner" @click="startStandingScanner">
          {{ standingInProgress ? 'STANDING SCANNER IS SCANNING...' : 'START STANDING SCANNER' }}
        </button>
        <button v-bind:class="{ 'in-progress': standingInProgress || tableInProgress }" :disabled="tableInProgress || standingInProgress || !isValid || !bio_id" type="button" class="button-table-scanner" @click="startTableScanner">
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

const TABLE_SCANNER_DURATION = 42 * 1000;
const STANDING_SCANNER_DURATION = 30 * 1000;

export default {
  data() {
    return {
        tableInProgress: false,
        tableInProgressTimeout: null,
        standingInProgress: false,
        standingInProgressTimeout: null,
        hasInput: !hasNfc(),
        bio_id: '', // Target person Bio ID
        additional_type: 'XRAY_SCAN',
        isValid: true,
        description: '',
        typeOptions: [
            { key: 'XRAY_SCAN', text: 'X-Ray scan' },
            { key: 'OTHER_SCAN', text: 'Other scan' },
        ],
    }
  },
  created() {
      console.log('scanners in progress?', this.tableInProgress, this.standingInProgress);
  },
  methods: {
    validateForm(evt) {
        if (evt && evt.key === 'Enter' && evt.target) {
            evt.target.blur();
        }
        const description = this.description.trim();
        this.isValid = this.bio_id && this.additional_type && (this.additional_type !== 'OTHER_SCAN' || description);
    },
    startTableScanner() {
        if (this.tableInProgress) return;
        this.startScanner(TABLE_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.postOperationResults('TABLE_SCANNER');
            this.tableInProgress = true;
            this.tableInProgressTimeout = setTimeout(() => this.clearScanning(), TABLE_SCANNER_DURATION);
        });
    },
    startStandingScanner() {
        if (this.standingInProgress) return;
        this.startScanner(STANDING_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.postOperationResults('STANDING_SCANNER');
            this.standingInProgress = true;
            this.standingInProgressTimeout = setTimeout(() => this.clearScanning(), STANDING_SCANNER_DURATION);
        })
    },
    clearScanning() {
        this.standingInProgress = false;
        this.tableInProgress = false;
        this.bio_id = '';
        this.additional_type = 'XRAY_SCAN';
        this.description = '';
        this.validateForm();
        this.$ons.notification.toast(`Scan complete, results sent to EVA`, { timeout: 2500, animation: 'fall' })
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
            is_analysed: true, // Scan results do not need to be analysed by players
            author_id: this.$store.state.user.user.id,
            type: 'MEDIC',
            additional_type: this.additional_type,
            bio_id: this.bio_id,
      };
      const description = this.description.trim();
      if (description) data.description = description;
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
            this.validateForm();
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
<style lang="scss" scoped>
$gray: #171717;
$light-gray: #383838;
$orange: #f4a140;

.container {
  text-align: center;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  padding-left: 5vw;
  padding-right: 5vw;
  padding-bottom: 3vh;
}

.bio-id {
  padding-top: 0;
  margin-top: 0;
  font-size: 1.2rem;
  margin-bottom: 20px;
}

.label-description {
    margin-top: 20px;
}

v-ons-select {
    margin-bottom: 20px;
}

.has-id {
    color: rgb(88, 240, 88);
}
.no-bio-id {
    color: rgb(228, 78, 78);
}

.subtitle {
    font-size: 0.75rem;
}

.container.no-top-margin {
    margin-top: 0 !important;
}

input, textarea, .type-select {
  background: lighten($gray, 20);
  background-color: lighten($gray, 20);
  border: 1px solid lighten($gray, 25);
  font-size: 1.6rem;
  padding: 0.5rem;
  color: #fff;
  margin: 1rem;
  margin-top: 0.5rem;
}
.type-select {
  text-align: center;
}
textarea {
  resize: none;
  min-height: 8rem;
  padding: 1rem;
}

button {
  background: darken($orange, 10);
  border: 0.1rem solid darken($orange, 25);
  font-size: 1.3rem;
  margin: 0.5rem;
  color: #fff;
  margin-top: 1rem;
  text-shadow: 0px 0px 3px rgba(0, 0, 0, .8);
  padding: 15px;
}
button:disabled {
    background: darken($orange, 30);
}

@keyframes scanner-blinker {
    50% {
        background: darken($orange, 20);
    }
}

.in-progress {
    background: darken($orange, 30);
    animation: scanner-blinker 2s linear infinite;
}
</style>
