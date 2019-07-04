<!-- Science version of MedicalSample.vue -->
<template>
  <v-ons-page>
    <toolbar-top />
    <div class="container">
        <h1>ANALYZE SAMPLE</h1>
        <label for="sample-id">SELECT SAMPLE TO ANALYZE<span class="required">*</span></label>
        <v-ons-select name="sample-id" class="type-select" v-model="operation_id" @change="validateForm" v-if="unanalyzedSamples.length">
          <option v-for="option in unanalyzedSamples" :value="option.key" v-bind:key="option.key">
            {{ option.text }}
          </option>
        </v-ons-select>
        <div v-else><span>
          There are currently no samples waiting to be analyzed.</span>
        </div>
        <button type="button" @click="markAnalysisDone" :disabled="!isValid || isSubmitting">
          SUBMIT TO EVA FOR ANALYSIS
        </button>
    </div>
  </v-ons-page>
</template>
<script>
import axios from 'axios';
import { get } from 'lodash';

export default {
  data() {
    return {
      operation_id: '',
      unanalyzedSamples: [],
      isValid: false,
      isSubmitting: false,
      isMedic: false,
      isScientist: false,
    }
  },
  created() {
    this.fetchUnanalyzedSamples();
    const groups = new Set(get(this.$store.state, 'user.user.groups', []));
    const isMedic = groups.has('role:medic');
    const isScientist = groups.has('role:science');
    this.isMedic = isMedic;
    this.isScientist = isScientist;
  },
  methods: {
    validateForm(evt) {
      this.isValid = !!this.operation_id;
    },
    markAnalysisDone() {
      if (this.isSubmitting) return;
      this.isSubmitting = true;
      const data = { is_analysed: true };
      axios.put(`/operation/${this.operation_id}`, data).then(res => {
        this.$ons.notification.alert('Analysis submitted to EVA for processing', { title: 'Success!', maskColor: 'rgba(0, 255, 0, 0.2)' });
        this.clearFields();
        this.isSubmitting = false;
      }).catch(err => {
        // No time to make error handling that makes sense, so behold:
        this.$ons.notification.alert(
            'Failed to submit analysis',
          { title: 'Error', maskColor: 'rgba(255, 0, 0, 0.2)' });
        this.isSubmitting = false;
      });
    },
    clearFields() {
      this.operation_id = '';
      this.fetchUnanalyzedSamples();
    },
    async fetchUnanalyzedSamples() {
      const sampleTypes = new Map([
        ['BLOOD_SAMPLE', 'Blood sample'],
        ['GENE_SAMPLE', 'Gene sample'],
        ['MATERIAL_SAMPLE', 'Material sample'],
        ['OTHER_SAMPLE', 'Other sample'],
      ]);
      await axios.get('/operation').then(res => {
        const data = res.data || [];
        this.unanalyzedSamples = data.filter(operation => {
          // Filter out non-samples and analysed operations
          return (operation.additional_type || '').match(/.*_SAMPLE/) && !operation.is_analysed;
         }).filter(operation => {
          // Let medics only analyze samples of type MEDIC
          return this.isMedic ? operation.type === 'MEDIC' : true;
         }).map(operation => {
           const text = `${operation.sample_id} (${sampleTypes.get(operation.additional_type)})`;
           return { key: operation.id, text };
        });
      });
      this.validateForm();
    },
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
.required {
  color: $orange;
  padding-left: 5px;
}
h1 {
  padding-bottom: 1rem !important;
  margin-bottom: 1rem;
}
label {
  font-size: 1.2rem;
}
input, textarea {
  background: lighten($gray, 20);
  background-color: lighten($gray, 20);
  border: 1px solid lighten($gray, 25);
  font-size: 1.6rem;
  padding: 0.5rem;
  color: #fff;
  margin: 1rem;
  margin-top: 0.5rem;
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
  margin-top: 40px !important;
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
