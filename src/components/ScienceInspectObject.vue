<!-- Science version of MedicalDiagnosis.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>{{ this.title }}</h1>
      <v-ons-search-input placeholder="Search" v-model="query" v-if="hasInput"></v-ons-search-input>
      <div class="resultTextBox">
        <pre><vue-typer :text="resultText" :repeat="0" :type-delay="10" v-if="resultText"></vue-typer></pre>
      </div>
    </div>
  </v-ons-page>
</template>
<script>

import { getBlob, patchBlob } from '../blob'
import { startWatch, cancelWatch, hasNfc } from '../nfc'
import { debounce, get, chunk } from 'lodash';
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
      hasInput: !hasNfc()
    }
  },
  methods: {
    async getRecords(message) {
      if (message.match(this.tagRegexp)) {
        const res = await axios.get(`/tag/${message}`).catch(() => {
          this.resultText = this.tagNotFoundMessage;
        });
        this.resultText = chunk(get(res, 'data.description', this.tagNotFoundMessage).split(''), 40)
          .map(line => line.join(''))
          .join('\n') + '\n\nReady to scan another object';
      } else {
        this.resultText = this.invalidTagTypeMessage;
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
    this.title = 'INSPECT OBJECT';
    this.resultText = 'Ready to scan an object';
    this.tagRegexp = /^science:..*/;
    this.tagNotFoundMessage = 'This object is unknown';
    this.invalidTagTypeMessage = 'This is not recognized as an object\n\nReady to scan an object';
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
