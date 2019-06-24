<!-- Science version of MedicalDiagnosis.vue -->
<template>
  <v-ons-page>
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>{{ this.title }}</h1>
      <v-ons-search-input placeholder="Search" v-model="query"></v-ons-search-input>
			<v-ons-list class="autocomplete">
        <v-ons-list-item v-for="record in results" v-bind:key="record.id" @click="showRecord(record.id)">{{ record.name }}</v-ons-list-item>
			</v-ons-list>
      <div class="resultTextBox">
        <pre><vue-typer :text="resultText" :repeat="0" :type-delay="10" v-if="resultText"></vue-typer></pre>
      </div>
    </div>
  </v-ons-page>
</template>
<script>

import { getBlob, patchBlob } from '../blob'
import { startWatch, hasNfc } from '../nfc'
import { debounce, get } from 'lodash';
import axios from 'axios';

export default {
  data() {
    return {
      record: {},
      id: 0,
      query: '',
      results: [ ],
      resultText: '',
      diagnosis: null,
      title: '',
      tagRegexp: '',
      invalidTagTypeMessage: '',
      tagNotFoundMessage: '',
    }
  },
  methods: {
    async getRecords(message) {
      if (message.match(this.tagRegexp)) {
        const res = await axios.get(`/tag/${message}`).catch(() => {
          this.resultText = this.tagNotFoundMessage;
        });
        this.resultText = get(res, 'data.description', this.tagNotFoundMessage);
      } else {
        this.resultText = this.invalidTagTypeMessage;
      }
    },
  },
  watch: {
    query: function(val) {
      if (!hasNfc()) this.debouncedGetRecords(val)
      if(val !== '' && this.records) this.results = this.records.filter(function (record) { let re = new RegExp(val, 'gi'); return (record.name.match(re)) })
      else this.results = [ ]
    },
  },
  created() {
    this.title = 'INSPECT OBJECT';
    this.resultText = 'Scan the object';
    this.tagRegexp = /^SCIENCE:..*/;
    this.tagNotFoundMessage = 'This object is unknown';
    this.invalidTagTypeMessage = 'This is not recognized as an object\n\nScan the object';
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
