<!-- Medic version of ScienceArtifactDetails.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>MEDICAL DETAILS</h1>
      <v-ons-search-input placeholder="Search" v-model="query" v-if="hasInput" @keyup="e => debouncedGetRecords(e.target.value)"></v-ons-search-input>
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
      // resultText: 'Scan a patient ID card',
      resultText: `
The standard Lorem Ipsum passage, used since the 1500s

"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
Section 1.10.32 of "de Finibus Bonorum et Malorum", written by Cicero in 45 BC

"Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem. Ut enim ad minima veniam, quis nostrum exercitationem ullam corporis suscipit laboriosam, nisi ut aliquid ex ea commodi consequatur? Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae consequatur, vel illum qui dolorem eum fugiat quo voluptas nulla pariatur?"
1914 translation by H. Rackham
`,
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
    this.state = 'results';
    },
    async getRecords(message) {
      console.log('messa', message);
      if (this.state === 'processing') return;
      if (message.startsWith('card:')) {
        this.id = message.split( ':', 2)[1]
        if (!this.id) return;
        this.record = await getBlob('/person/card', this.id)
        if (this.record) {
          this.analyze();
        } else {
          this.showRecord();
        }
      } else {
        this.resultText = `This does not seem to be an ID card.


Scan a patient ID card`;
      }
    },
    analyze() {
      this.state = 'processing';
      this.dataProgress = 0;
      this.dataProgress1 = 0;
      this.dataProgress2 = 0;
      const skillFactor = this.$store.state.user.skillFactor;
      const analyseBaseTime = this.$store.state.user.analyseBaseTime;
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
.processing {
  max-width: 100%;
  padding: 10px;
  margin-top: 20px;
}
.progress-circular {
  width: 64px;
  height: 64px;
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
