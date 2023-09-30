<!-- Science version of MedicalRecords.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>SCAN ARTIFACT</h1>
      <v-ons-search-input placeholder="Search" v-model="query" v-if="showInput && state === 'results'" @keyup="e => debouncedGetRecords(e.target.value)"></v-ons-search-input>
      <div class="resultTextBox" v-if="state === 'results'">
        <p class="pre">{{ resultText }}</p>
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
import { debounce } from 'lodash';
import { parseEntries } from '../helpers';

export default {
  data() {
    return {
      record: { },
      id: 0,
      query: '',
      results: [ ],
      resultText: 'Ready to scan an artifact.',
      showInput: !hasNfc(),
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
    showRecord() {
      const artifact = this.record;
      if (!artifact) return this.resultText = `This artifact is unknown.`;
      this.query = ''
      this.resultText = `Artifact scan results:

  Name:               ${ artifact.name }
  Discovered by:      ${ artifact.discovered_by || 'Unknown' }
  Discovery time:     ${ artifact.discovered_at || 'Unknown' }
  Discovery location: ${ artifact.discovered_from || 'Unknown' }
  Artifact type:      ${ artifact.type || 'Unknown' }

  Additional entries:

${ parseEntries(this.record.entries) }

Ready to scan a new artifact.`
    this.state = 'results';
    },
    async show() {
      await startWatch(this.getRecords);
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
    async getRecords(message) {
      console.log('getrecords', message);
      if (this.state === 'processing') return;
      if (message.startsWith('artifact:')) {
        this.id = message.split( ':', 2)[1]
        if (!this.id) return;
        this.record = await getBlob('/science/artifact/catalog', this.id.toUpperCase())
        this.analyze();
      } else {
        this.resultText = `This does not seem to be an artifact.

Ready to scan an artifact.`
      }
    },
  },
  created() {
    this.debouncedGetRecords = debounce(this.getRecords, 1000);
  },
  async show() {
    await startWatch(this.getRecords);
  },
  hide() {
    cancelWatch()
  }
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
.pre {
 color: #fff;
 font-family: monospace;
 hyphens: auto;
 white-space: pre-wrap;       /* css-3 */
 white-space: -moz-pre-wrap;  /* Mozilla, since 1999 */
 white-space: -pre-wrap;      /* Opera 4-6 */
 white-space: -o-pre-wrap;    /* Opera 7 */
 word-wrap: break-word;       /* Internet Explorer 5.5+ */
 padding: 0;
 margin: 0;
}
.result {
  text-align: center;
  display: inline-block;
  width: 80px;
  height: 80px;
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
