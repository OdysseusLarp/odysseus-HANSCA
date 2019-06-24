<template>
  <v-ons-page>
    <toolbar-top/></toolbar-top>
    <div style="text-align: center; margin-top: 50px;">
      <v-ons-search-input placeholder="Search" v-model="query"></v-ons-search-input>
			<v-ons-list class="autocomplete">
        <v-ons-list-item v-for="record in results" @click="showRecord(record.id)">{{ record.name }}</v-ons-list-item>	
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
      record: { },
      id: 0,
      query: '',
      results: [ ],
      resultText: 'Scan the injury',
      diagnosis: null,
    }
  },
  methods: {
    async getRecords(message) {
      console.log('getRecords', message);
      if (message.match(/^DIAGNOSIS:..*/)) {
        const res = await axios.get(`/tag/${message}`);
        this.resultText = get(res, 'data.description', 'This injury is unknown');
      } else {
        this.resultText = 'This is not recognized as an injury\n\nScan the injury';
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
