<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div class="container no-top-margin">
        <h1>MEDICAL SCANNERS</h1>
        <p v-if="isScientist">Medical scanners are capable of performing XRF scans to uncover details about artifacts.</p>
        <p v-if="isScientist" v-bind:class="{ 'has-id': isBigBatteryPluggedInMedbay === true, 'no-bio-id': isBigBatteryPluggedInMedbay === false }">The <strong>Futuro Fission Flux A550</strong> needs to be connected in the Medbay to enable XRF scans.</p>
        <p class="bio-id has-id" v-if="isMedic && bio_id">BIO ID OK</p>
        <p class="bio-id no-bio-id" v-else-if="isMedic && !standingInProgress && !tableInProgress">SCAN PATIENT BIO ID<span class="required">*</span></p>
        <p class="bio-id has-id" v-else-if="isScientist && catalog_id && isCatalogIdOk">ARTIFACT CATALOG ID OK</p>
        <p class="bio-id no-bio-id" v-else-if="isScientist && !standingInProgress && !tableInProgress">SCAN/ENTER ARTIFACT CATALOG ID<span class="required">*</span></p>
        <p v-if="isScientist" class="catalog-id-input-wrapper">
            <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
            <label for="catalog-id">ARTIFACT CATALOG ID<span class="required">*</span></label>
            <input v-model="catalog_id" type="text" id="catalog-id" @keyup="onCatalogIdKeyUp" @blur="validateForm" />
        </p>
        <label for="additional-type">SCAN TYPE<span class="required">*</span></label>
        <v-ons-select name="additional-type" class="type-select" v-model="additional_type" @change="validateForm" :disabled="standingInProgress || tableInProgress">
          <option v-for="option in typeOptions" :value="option.key" v-bind:key="option.key">
            {{ option.text }}
          </option>
        </v-ons-select>
        <label for="sample-description" class="label-description" v-if="additional_type === 'OTHER_SCAN'">DESCRIPTION<span class="required">*</span></label>
        <span class="subtitle" v-if="additional_type === 'OTHER_SCAN'">(Purpose of the scan)</span>
        <textarea v-model="description" id="sample-description" v-if="additional_type === 'OTHER_SCAN'" @keyup="validateForm" @blur="validateForm" :disabled="standingInProgress || tableInProgress" />
        <button v-bind:class="{ 'in-progress': isInUse() }" :disabled="isScannerDisabled()" type="button" class="button-standing-scanner" @click="startStandingScanner">
          {{ standingInProgress ? 'STANDING SCANNER IS SCANNING...' : 'START STANDING SCANNER' }}
        </button>
        <button v-bind:class="{ 'in-progress': isInUse() }" :disabled="isScannerDisabled()" type="button" class="button-table-scanner" @click="startTableScanner">
          {{ tableInProgress ? 'TABLE SCANNER IS SCANNING...' : 'START TABLE SCANNER' }}
        </button>
    </div>
  </v-ons-page>
</template>

<script>
import axios from 'axios';
import { get } from 'lodash-es';
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
        catalog_id: '', // Target artifact Catalog ID
        isCatalogIdOk: false,
        additional_type: 'XRAY_SCAN',
        errorMessage: '',
        isValid: true,
        isMedic: false,
        isScientist: false,
        description: '',
        typeOptions: [],
        bigBatteryPollInterval: null,
        isBigBatteryPluggedInMedbay: null,
    }
  },
  created() {
    const groups = new Set(get(this.$store.state, 'user.user.groups', []));
    const isMedic = groups.has('role:medic');
    const isScientist = groups.has('role:science');
    this.isMedic = isMedic;
    this.isScientist = isScientist;
    if (isScientist) {
        this.setupBigBatteryPolling();
        this.typeOptions = [
            { key: 'XRF_SCAN', text: 'XRF Scan' }
        ];
        this.additional_type = 'XRF_SCAN';
    } else {
        this.typeOptions = [
            { key: 'XRAY_SCAN', text: 'X-Ray scan' },
            { key: 'OTHER_SCAN', text: 'Other scan' },
        ];
        this.additional_type = 'XRAY_SCAN';
    }
  },
  beforeDestroy() {
    clearInterval(this.bigBatteryPollInterval);
  },
  methods: {
    isInUse() {
        return this.tableInProgress || this.standingInProgress;
    },
    isScannerDisabled() {
        const isInUse = this.isInUse();
        const isInvalid = !this.isValid;
        const hasNoId = !(this.bio_id || this.catalog_id);
        const xrfBigBatteryMissing = this.isScientist && this.additional_type === 'XRF_SCAN' && !this.isBigBatteryPluggedInMedbay;
        return isInUse || isInvalid || hasNoId || xrfBigBatteryMissing;
    },
    // No socket.io in HANSCA so let's go with polling
    async setupBigBatteryPolling() {
        const POLL_INTERVAL = 1000 * 5;

        this.isBigBatteryPluggedInMedbay = await this.fetchIsBigBatteryPluggedInMedbay();

        clearInterval(this.bigBatteryPollInterval);
        this.bigBatteryPollInterval = setInterval(async () => {
            const isPluggedIn = await this.fetchIsBigBatteryPluggedInMedbay();
            if (isPluggedIn !== this.isBigBatteryPluggedInMedbay) {
                this.isBigBatteryPluggedInMedbay = isPluggedIn;
            }
        }, POLL_INTERVAL);
    },
    async onCatalogIdKeyUp(evt) {
        if (evt && evt.key === 'Enter' && evt.target) {
            evt.target.blur();
        }
    },
    async validateForm(evt) {
        this.errorMessage = '';
        if (evt && evt.key === 'Enter' && evt.target) {
            evt.target.blur();
        }
        let id, isCatalogIdValid;
        if (this.isMedic) id = this.bio_id;
        else if (this.isScientist) {
            id = this.catalog_id;
            if (id) await this.fetchArtifactByCatalogId().then(res => isCatalogIdValid = !!res.data);
            if (id && !isCatalogIdValid) {
                this.errorMessage = 'Artifact not found in EOC Datahub';
                this.isCatalogIdOk = false;
            } else if (isCatalogIdValid) {
                this.isCatalogIdOk = true;
            }
        }
        const description = this.description.trim();
        this.isValid = id && this.additional_type && (this.additional_type !== 'OTHER_SCAN' || description);
    },
    fetchArtifactByCatalogId() {
        return axios.get(`/science/artifact/catalog/${this.catalog_id.trim().toUpperCase()}`);
    },
    async fetchIsBigBatteryPluggedInMedbay() {
        const { data } = await axios.get('/data/box/bigbattery');
        const BigBatteryLocation = {
            NONE: 0,
            ENGINEERING: 1,
            MEDBAY: 2,
            SCIENCE: 3,
            FIGHTER1: 4,
            FIGHTER2: 5,
            FIGHTER3: 6,
        };
        return data && data.connected_position === BigBatteryLocation.MEDBAY;
    },
    startTableScanner() {
        if (this.tableInProgress) return;
        this.tableInProgress = true;
        this.startScanner(TABLE_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.postOperationResults('TABLE_SCANNER');
            this.tableInProgress = true;
            this.tableInProgressTimeout = setTimeout(() => this.clearScanning(), TABLE_SCANNER_DURATION);
        }).catch(err => {
            console.log('error starting scanner', err);
            this.tableInProgress = false;
        })
    },
    startStandingScanner() {
        if (this.standingInProgress) return;
        this.standingInProgress = true;
        this.startScanner(STANDING_SCANNER_DMX_CHANNEL).then(success => {
            if (!success) return;
            this.postOperationResults('STANDING_SCANNER');
            this.standingInProgress = true;
            this.standingInProgressTimeout = setTimeout(() => this.clearScanning(), STANDING_SCANNER_DURATION);
        }).catch(err => {
            console.log('error starting scanner', err);
            this.tableInProgress = false;
        })
    },
    clearScanning() {
        this.standingInProgress = false;
        this.tableInProgress = false;
        this.bio_id = '';
        this.catalog_id = '';
        this.isCatalogIdOk = false;
        this.additional_type = 'XRAY_SCAN';
        this.description = '';
        this.validateForm();
        this.$ons.notification.toast(`Scan complete, results sent to EVA`, { timeout: 2500, animation: 'fall' })
    },
    startScanner(channel) {
        return axios.post(`/dmx/event/${channel}`).then(() => {
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
        if (!(this.bio_id || this.catalog_id)) {
            console.log('no bio_id or catalog_id, not submitting the operation result');
            return;
        }
        let type;
        if (this.isMedic) {
            type = 'MEDIC';
        } else if (this.isScientist) {
            type = 'SCIENCE';
        }
        const data = {
            is_complete: false,
            is_analysed: true, // Scan results do not need to be analysed by players
            author_id: this.$store.state.user.user.id,
            type,
            additional_type: this.additional_type,
      };
      if (this.isMedic) {
        data.bio_id = this.bio_id;
      } else if (this.isScientist) {
        data.catalog_id = this.catalog_id.trim().toUpperCase();
      }
      const description = this.description.trim();
      if (description) {
        data.description = description;
      }
      axios.post('/operation', data).then(res => {
          console.log('created operation result for the scan', data);
      }).catch(err => {
          console.log('failed to create operation result for the scan', err);
      });
    },
    readNfcTag(message) {
        if (message.startsWith('bio:') && this.isMedic) {
            const id = message.split(':', 2)[1];
            this.bio_id = id;
            this.validateForm();
        } else if(message.startsWith('artifact:') && this.isScientist) {
            const id = message.split(':', 2)[1];
            this.catalog_id = id;
            this.validateForm();
        } else {
            let wantedIdType;
            if (this.isMedic) wantedIdType = 'a Bio ID';
            else if (this.isScientist) wantedIdType = 'an Artifact Catalog ID';
            this.$ons.notification.toast(`Scanned tag is not ${wantedIdType}`, { timeout: 2500, animation: 'fall' });
        }
    },
    async show() {
        await startWatch(this.readNfcTag);
    },
    hide() {
        cancelWatch()
    }
  },
  watch: {},
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

.required {
  color: $orange;
  padding-left: 5px;
}

.container {
  text-align: center;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  padding-left: 5vw;
  padding-right: 5vw;
  padding-bottom: 3vh;
}

.catalog-id-input-wrapper {
  display: flex;
  flex-direction: column;
  margin-top: 0;
}

.error-message {
    color: rgb(228, 78, 78);
    margin-bottom: 12px;
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
    color: rgb(132, 241, 132);
}
.no-bio-id {
    color: rgb(238, 125, 125);
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
option {
  background: lighten($gray, 45);
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
