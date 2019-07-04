<template>
  <v-ons-page>
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <div v-if="state == 'scanning'">
        <h2>Scanning...</h2>
      <v-ons-progress-bar indeterminate></v-ons-progress-bar>
      </div>
      <div v-if="state == 'processing'">
        <h2>Prosessing...</h2>
      <v-ons-progress-bar :value="dataProgress" secondary-value="100"></v-ons-progress-bar>
      <br>
      <v-ons-progress-bar :value="dataProgress1" secondary-value="100"></v-ons-progress-bar>
      <br>
      <v-ons-progress-bar :value="dataProgress2" secondary-value="100"></v-ons-progress-bar>
      </div>
      <div v-if="state == 'results'">
        <h2>Results</h2>
        <span class="result" v-for="(result, index) in results" v-bind:key="index">
          <v-ons-progress-circular :value="result.value" :secondary-value="result.max" @click.prevent="setResultText(index)"></v-ons-progress-circular>
          <span class="percent">{{ result.value }}%</span>
        </span>
        <div class="resultTextBox">
          <p class="pre">{{ resultText }}</p>
        </div>
    </div>
      <v-ons-bottom-toolbar transparent>
        <v-ons-button modifier="outline" style="margin: 6px 0" @click="scan()">Scan</v-ons-button>
      </v-ons-bottom-toolbar>
    </div>
  </v-ons-page>
</template>
<script>
export default {
  data() {
    return {
      scanProgress: 0,
      dataProgress: 0,
      dataProgress1: 0,
      dataProgress2: 0,
      intervalID: 0,
      intervalID1: 0,
      intervalID2: 0,
      state: '',
      results: [
        { value: 0, intervalID: 0, data: 45, max: 90, text: "Test results:\nCompleted\t 100%\nProbability\t92%\nCoherence\t -10%\nCorrelation\t82%\nInterference\t5%" },
        { value: 0, intervalID: 0, data: 60, max: 70, text: "Test results:\nCompleted\t 100%\nProbability\t79%\nCoherence\t -19%\nCorrelation\t76%\nInterference\t2%" },
        { value: 0, intervalID: 0, data: 70, max: 100, text: "Test results:\nCompleted\t 100%\nProbability\t86%\nCoherence\t   3%\nCorrelation\t90%\nInterference\t6%" },
        { value: 0, intervalID: 0, data: 20, max: 50, text: "Test results:\nCompleted\t 100%\nProbability\t89%\nCoherence\t -13%\nCorrelation\t80%\nInterference\t3%" },
        { value: 0, intervalID: 0, data: 55, max: 80, text: "Test results:\nCompleted\t 100%\nProbability\t60%\nCoherence\t  -6%\nCorrelation\t88%\nInterference\t7%" },
      ],
      resultText: 'Click on the results to see details'
    }
  },
  methods: {
    scan() {
      Object.assign(this.$data, this.$options.data())
      this.state = 'scanning'
      // FIXME: Use methods in nfc.js
      if ('nfc' in navigator) {
        navigator.nfc.watch((message) => {
          this.processMessage(message)
        }, {mode: 'any'})
      } else {
        this.intervalID = setInterval(() => {
          if (this.scanProgress === 100) {
            clearInterval(this.intervalID)
            this.state = 'processing'
            this.analyze()
            return
          }
          this.scanProgress++
        }, 40)
      }
    },
    processMessage(msg) {
      navigator.nfc.cancelWatch()
      this.state = 'processing'
      this.analyze()
    },
    analyze() {
      this.intervalID = setInterval(() => {
        if (this.dataProgress === 100) {
          clearInterval(this.intervalID)
          return
        }
        this.dataProgress++
      }, 60)
      this.intervalID1 = setInterval(() => {
        if (this.dataProgress1 === 100) {
          clearInterval(this.intervalID1)
          return
        }
        this.dataProgress1++
      }, 40)

      this.intervalID2 = setInterval(() => {
        if (this.dataProgress2 === 100) {
          clearInterval(this.intervalID2)
          this.state = 'results'
          this.showResults()
          return
        }
        this.dataProgress2++
      }, 90)
    },
    showResults() {
      this.results.forEach((result, index)=> { 
        result.intervalID = setInterval(() => {
          if (result.value === result.data) {
            clearInterval(result.intervalID)
            return
          }
          result.value++
        }, 20)
      })
    },
    setResultText(index) {
      this.resultText = this.results[index].text
      console.log(this.resultText)
    },
  },
}
</script>
<style>
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
ons-progress-circular {
  width: 64px;
  height: 64px;
}
.progress-circular {
  width: 64px;
  height: 64px;
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
</style>
