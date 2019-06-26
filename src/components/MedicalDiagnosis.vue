<!-- Medic version of ScienceInspectObject.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>{{ this.title }}</h1>
      <v-ons-search-input placeholder="Search" v-model="query" v-if="hasInput" @keyup="e => debouncedGetRecords(e.target.value)"></v-ons-search-input>
      <div class="resultTextBox" v-if="state === 'results'">
        <pre><vue-typer :text="resultText" :repeat="0" :type-delay="10" v-if="resultText"></vue-typer></pre>
      </div>
      <div v-else-if="state === 'processing'" class="processing">
        <h2>Processing...</h2>
        <v-ons-progress-bar :value="dataProgress" secondary-value="100"></v-ons-progress-bar>
        <br>
        <v-ons-progress-bar :value="dataProgress1" secondary-value="100"></v-ons-progress-bar>
        <br>
        <v-ons-progress-bar :value="dataProgress2" secondary-value="100"></v-ons-progress-bar>
      </div>
      <div v-else>
        Unknown state
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
      hasInput: !hasNfc(),
      scanProgress: 0,
      dataProgress: 0,
      dataProgress1: 0,
      dataProgress2: 0,
      intervalID: 0,
      intervalID1: 0,
      intervalID2: 0,
      state: 'results',
    }
  },
  methods: {
    async getRecords(message) {
      if (this.state === 'processing') return;
      if (message.match(this.tagRegexp)) {
        axios.get(`/tag/${message}`)
          .then(res => {
            this.res = res;
            this.analyze();
          })
          .catch(e => this.resultText = this.tagNotFoundMessage);
      } else {
        this.resultText = this.invalidTagTypeMessage;
      }
    },
    showRecord() {
        this.resultText = chunk(get(this.res, 'data.description', this.tagNotFoundMessage).split(''), 40)
          .map(line => line.join(''))
          .join('\n') + '\n\nReady to scan another injury';
        this.state = 'results';
    },
    show() {
      startWatch(this.getRecords)
    },
    hide() {
      cancelWatch()
    },
    analyze() {
      this.state = 'processing';
      this.dataProgress = 0;
      this.dataProgress1 = 0;
      this.dataProgress2 = 0;
      const skillFactor = this.$store.state.user.skillFactor;
      const analyseBaseTime = this.$store.state.user.analyseBaseTime;
      console.log('using skill factor', skillFactor);
      this.intervalID = setInterval(() => {
        if (this.dataProgress === 100) {
          clearInterval(this.intervalID)
          return
        }
        this.dataProgress++
      }, 1 * analyseBaseTime * skillFactor)
      this.intervalID1 = setInterval(() => {
        if (this.dataProgress1 === 100) {
          clearInterval(this.intervalID1)
          return
        }
        this.dataProgress1++
      }, 2 * analyseBaseTime * skillFactor)
      this.intervalID2 = setInterval(() => {
        if (this.dataProgress2 === 100) {
          clearInterval(this.intervalID2)
          this.showRecord()
          return
        }
        this.dataProgress2++
      }, 3 * analyseBaseTime * skillFactor)
    },
  },
  created() {
    this.title = 'DIAGNOSE AN INJURY';
    this.resultText = 'Scan an injury';
    this.tagRegexp = /^medic:..*/;
    this.tagNotFoundMessage = 'This injury is unknown';
    this.invalidTagTypeMessage = 'This is not recognized as an injury\n\nScan an injury';
    this.debouncedGetRecords = debounce(this.getRecords, 1000);
  },
}
</script>
<style>
ons-progress-circular {
  width: 64px;
  height: 64px;
}
.progress-circular {
  width: 64px;
  height: 64px;
}
.processing {
  max-width: 100%;
  padding: 10px;
  margin-top: 20px;
}
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
