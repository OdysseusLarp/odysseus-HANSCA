<!-- Medic version of ScienceAnalysis.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div class="container no-top-margin">
        <h1>TAKE A SAMPLE</h1>
        <p class="bio-id has-id" v-if="isMedic && bio_id">BIO ID OK</p>
        <p class="bio-id no-bio-id" v-else-if="isMedic">SCAN PATIENT BIO ID<span class="required">*</span></p>
        <p class="bio-id has-id" v-else-if="isScientist && catalog_id && isCatalogIdOk">ARTIFACT CATALOG ID OK</p>
        <p class="bio-id no-bio-id" v-else-if="isScientist">SCAN/ENTER ARTIFACT CATALOG ID<span class="required">*</span></p>
        <div v-if="isScientist" class="catalog-id-input-wrapper">
            <span v-if="errorMessage" class="error-message">{{ errorMessage }}</span>
            <label for="catalog-id">ARTIFACT CATALOG ID<span class="required">*</span></label>
            <input v-model="catalog_id" type="text" id="catalog-id" @keyup="onCatalogIdKeyUp" @blur="validateForm" />
        </div>
        <label for="sample-id">UNIQUE SAMPLE ID<span class="required">*</span></label>
        <input v-model="sample_id" type="text" id="sample-id" @keyup="validateForm" @blur="validateForm" />
        <label for="additional-type">SAMPLE TYPE<span class="required">*</span></label>
        <v-ons-select name="additional-type" class="type-select" v-model="additional_type" @change="validateForm">
          <option v-for="option in typeOptions" :value="option.key" v-bind:key="option.key">
            {{ option.text }}
          </option>
        </v-ons-select>
        <label for="sample-description" v-if="additional_type === 'OTHER_SAMPLE'">DESCRIPTION<span class="required">*</span></label>
        <textarea v-model="description" id="sample-description" v-if="additional_type === 'OTHER_SAMPLE'" @keyup="validateForm" placeholder="Describe the sample you are taking"/>
        <button type="button" @click="submitSample" :disabled="!isValid || isSubmitting">
          TAKE SAMPLE
        </button>
    </div>
  </v-ons-page>
</template>
<script>
import axios from 'axios';
import { startWatch, cancelWatch } from '../nfc'
import { get, memoize } from 'lodash-es';

const fetchArtifactByCatalogId = memoize((catalogId) => {
  return axios.get(`/science/artifact/catalog/${catalogId.trim().toUpperCase()}`);
});

export default {
  data() {
    return {
      bio_id: '',
      catalog_id: '',
      sample_id: '',
      description: '',
      additional_type: '',
      errorMessage: '',
      isMedic: false,
      isScientist: false,
      isValid: false,
      isSubmitting: false,
      isCatalogIdOk: false,
      typeOptions: []
    }
  },
  created() {
    const groups = new Set(get(this.$store.state, 'user.user.groups', []));
    const isMedic = groups.has('role:medic');
    const isScientist = groups.has('role:science');
    if (isMedic) {
      this.typeOptions.push({ key: 'BLOOD_SAMPLE', text: 'Blood sample' });
      this.typeOptions.push({ key: 'GENE_SAMPLE', text: 'Gene sample' });
      this.additional_type = 'BLOOD_SAMPLE';
    } else if (isScientist) {
      this.typeOptions.push({ key: 'MATERIAL_SAMPLE', text: 'Material sample' });
      this.typeOptions.push({ key: 'MICROSCOPE_SAMPLE', text: 'Microscopic analysis' });
      this.typeOptions.push({ key: 'AGE', text: 'Radiocarbon dating' });
      // TODO: Use scanner for this
      // this.typeOptions.push({ key: 'XRF_SAMPLE', text: 'X-Ray Fluorescence analysis' });
      this.typeOptions.push({ key: 'HISTORY_SAMPLE', text: 'Historical analysis' });
      this.additional_type = 'MATERIAL_SAMPLE';
    }
    this.typeOptions.push({ key: 'OTHER_SAMPLE', text: 'Other sample' });
    this.isMedic = isMedic;
    this.isScientist = isScientist;
  },
  methods: {
    async onCatalogIdKeyUp(evt) {
      if (evt && evt.key === 'Enter' && evt.target) {
          evt.target.blur();
      }
    },
    setBioId(message) {
      if (this.isMedic && message.startsWith('bio:')) {
          const id = message.split(':', 2)[1];
          this.bio_id = id;
          this.validateForm();
      } else if (this.isScientist && message.startsWith('artifact:')) {
          const id = message.split(':', 2)[1];
          this.catalog_id = id;
          this.validateForm();
      } else {
        let wantedId;
        if (this.isMedic) wantedId = 'a Bio ID';
        else if (this.isScientist) wantedId = 'an Artifact Catalog ID';
        this.$ons.notification.toast(`Scanned tag is not ${wantedId}`, { timeout: 2500, animation: 'fall' });
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
          if (id) {
            const artifact = await fetchArtifactByCatalogId(this.catalog_id);
            isCatalogIdValid = Boolean(artifact);
          }
          if (id && !isCatalogIdValid) {
              this.errorMessage = 'Artifact not found in EOC Datahub';
              this.isCatalogIdOk = false;
          } else if (isCatalogIdValid) {
              this.isCatalogIdOk = true;
          }
      }
      const description = this.description.trim();
      this.isValid = id && this.sample_id && this.additional_type && (this.additional_type !== 'OTHER_SAMPLE' || description)
    },
    submitSample() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      let type;
      if (this.isMedic) type = 'MEDIC';
      else if (this.isScientist) type = 'SCIENCE';
      const data = {
        is_complete: false,
        is_analysed: false,
        author_id: this.$store.state.user.user.id,
        type,
        additional_type: this.additional_type,
        sample_id: this.sample_id,
      };
      if (this.isMedic) data.bio_id = this.bio_id;
      else if (this.isScientist) data.catalog_id = this.catalog_id.trim().toUpperCase();
      if (this.description) data.description = this.description.trim();
      axios.post('/operation', data).then(res => {
        this.$ons.notification.alert('Sample submitted for analysis. Results available within 20 minutes.', { title: 'Sample submitted', maskColor: 'rgba(0, 255, 0, 0.2)' });
        this.clearFields();
        this.isSubmitting = false;
      }).catch(err => {
        // No time to make error handling that makes sense, so behold:
        console.log('got error', err);
        this.$ons.notification.alert(
          'Could not submit sample for analysis. Make sure that the sample ID is unique.',
          { title: 'Error', maskColor: 'rgba(255, 0, 0, 0.2)' });
        this.isSubmitting = false;
      });
    },
    clearFields() {
      this.bio_id = '';
      this.sample_id = '';
      this.description = '';
      this.additional_type = '';
      this.isCatalogIdOk = false;
      this.validateForm();
    },
    async show() {
      await startWatch(this.setBioId);
    },
    hide() {
        cancelWatch()
    }
  },
}
</script>
<style lang="scss" scoped>
$gray: #171717;
$light-gray: #383838;
$orange: #f4a140;

.has-id {
    color: rgb(88, 240, 88);
}
.no-bio-id {
    color: rgb(228, 78, 78);
}

.bio-id {
  padding-top: 0;
  margin-top: 0;
  font-size: 1.2rem;
}

p {
  font-weight: bold;
  margin-bottom: 40px;
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
.container {
  text-align: center;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  padding-left: 5vw;
  padding-right: 5vw;
  padding-bottom: 3vh;
}
.container.no-top-margin {
    margin-top: 0 !important;
}
.required {
  color: $orange;
  padding-left: 5px;
}
h1 {
  padding-bottom: 1rem !important;
}
label {
  font-size: 1.2rem;
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
input {
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
  font-size: 1.6rem;
  padding: 0.9rem;
  margin: 1rem;
  color: #fff;
  text-shadow: 0px 0px 3px rgba(0, 0, 0, .8);
}
button:disabled {
    background: darken($orange, 30);
}
</style>
