<!-- Medic version of ScienceArtifactDetails.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>MEDICAL DETAILS</h1>
      <v-ons-search-input placeholder="Search" v-model="query" v-if="hasInput"></v-ons-search-input>
      <div class="resultTextBox">
        <pre><vue-typer :text='resultText' :repeat="0" :type-delay="10"></vue-typer></pre>
      </div>
    </div>
  </v-ons-page>
</template>
<script>

import { getBlob, patchBlob } from '../blob'
import { startWatch, cancelWatch, hasNfc } from '../nfc'
import { debounce } from 'lodash';
import { parseEntries } from '../helpers';

export default {
  data() {
    return {
      record: { },
      id: 0,
      query: '',
      results: [ ],
      resultText: 'Scan a patient ID card',
      hasInput: !hasNfc()
    }
  },
  methods: {
    showRecord() {
      const person = this.record;
      if (!person) return this.resultText = `Unknown person.

Ready to scan another patient ID card`;
      this.query = ''
      this.resultText = `Medical details:

  Age:                ${ 542 - person.birth_year }
  Fitness level:      ${ person.medical_fitness_level || 'Unknown' }
  Last fitness check: ${ person.medical_last_fitness_check || 'Unknown' }
  Blood type:         ${ person.blood_type || 'Unknown' }

  Medical records:

${ parseEntries(this.record.entries, 'MEDICAL') }


Ready to scan another patient ID card`
    },
    async getRecords(message) {
      if (message.startsWith('card:')) {
        this.id = message.split( ':', 2)[1]
        if (!this.id) return;
        this.record = await getBlob('/person/card', this.id)
        this.showRecord()
      } else {
        this.resultText = `This does not seem to be an ID card.


Scan a patient ID card`;
      }
    },
    show() {
      startWatch(this.getRecords)
    },
    hide() {
      cancelWatch()
    },
  },
  created() {
    this.debouncedGetRecords = debounce(this.getRecords, 1000);
  },
}
</script>
<style>
.result {
  text-align: center;
  display: inline-block;
  width: 80px;
  height: 80px;
}
.vue-typer .custom.char.typed { 
  color: #fff;
}
.resultTextBox {
  background-color: rgba( 0, 0, 0, 0.4);
  border: 1px solid #333;
  margin: 20px;
  padding: 10px; 
  text-align: left;
}
ons-list.autocomplete {
  position: absolute;
  width: 100%;
}
</style>
