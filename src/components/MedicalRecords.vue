<template>
  <v-ons-page>
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>MEDICAL SCAN</h1>
      <v-ons-search-input placeholder="Search" v-model="query"></v-ons-search-input>
			<v-ons-list class="autocomplete">
        <v-ons-list-item v-for="record in results" v-bind:key="record.id" @click="showRecord(record.id)">{{ record.name }}</v-ons-list-item>
			</v-ons-list>
      <div class="resultTextBox">
        <pre><vue-typer :text='resultText' :repeat="0" :type-delay="10"></vue-typer></pre>
      </div>
    </div>
  </v-ons-page>
</template>
<script>

import { getBlob, patchBlob } from '../blob'
import { startWatch, hasNfc } from '../nfc'
import { debounce, chunk } from 'lodash';

export default {
  data() {
    return {
      record: { },
      id: 0,
      query: '',
      results: [ ],
      resultText: 'Scan patient ID card or enter it manually.'
    }
  },
  methods: {
    showRecord() {
      const person = this.record;
      if (!person) return this.resultText = `Unknown scan target, scan not authorized.`;
      this.query = ''
      this.resultText = `Medical scan results:

  Age:                ${ 542 - person.birth_year }
  Fitness level:      ${ person.medical_fitness_level || 'Unknown' }
  Last fitness check: ${ person.medical_last_fitness_check || 'Unknown' }
  Blood type:         ${ person.blood_type || 'Unknown' }

  Medical records:

${ (this.record.entries || [])
  .filter(e => e.type === 'MEDICAL')
  .map(e => e.entry)
  .reduce((prev, cur) => {
      // The first medical entry is actually multiple entries split by two newlines, so split those
      // into individual entries and cut the line length to max X characters
      const split = cur.split('\n\n');
      const entryWithNewLines = split.map(entry => {
        return chunk(entry.split(''), 35).map(e => e.join('')).join('\n    ');
      });
    return [...prev, ...entryWithNewLines];
  }, [])
  .map(e => '   ' + e)
  .join('\n\n') }`
    },
    async getRecords(message) {
      if (message.startsWith('person:')) {
        this.id = message.split( ':', 2)[1]
        if (!this.id) return;
        this.record = await getBlob('/person', this.id)
        console.log(this.record)
        this.showRecord()
      }
    }
  },
  watch: {
    query: function(val) {
      if (!hasNfc()) this.debouncedGetRecords('person:' + val)
      if(val !== '' && Array.isArray(this.records)) this.results = this.records.filter(function (record) { let re = new RegExp(val, 'gi'); return (record.name.match(re)) })
      else this.results = [ ]
    },
  },
  created() {
    startWatch(this.getRecords)
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
