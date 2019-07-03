<template>
  <v-ons-page>
    <div style="text-align: center; margin-top: 50px;">
      <h1 v-if="config.gameTitle">{{config.gameTitle}}</h1>
      <p class="value">{{value}} {{config.unit}}</p>
      <div :class="{'btn-value':true, selected: current[index], hint}" v-for="(value, index) in values" :key="index" @click="toggle(index)">
        <div class="index">{{index+1}}</div>
        <div class="hint">{{value}} {{config.unit}}</div>
      </div>

      <div v-if="hintAvailable" style="margin-top: 3em">
        <v-ons-button modifier="quiet" @click="showHint">Show hint</v-ons-button>
      </div>

    </div>
  </v-ons-page>
</template>

<style>
.value {
  font-size: 300%;
}
.btn-value {
  display: inline-block;
  width: 50px;
  height: 35px;
  padding-top: 15px;
  margin: 10px;
  border-radius: 5px;
  border: 1px solid #eee;
  text-align: center;
}
.btn .hint {
  font-size: 70%;
  color: #777;
  visibility: hidden;
}
.btn.hint .hint {
  visibility: visible;
}
.selected {
  background-color: yellow;
  color: #333;
}
</style>


<script>
const HINT_DURATION = 20000

export default {
  /*
     config: {
       "count": 5,
       "max": 15,
       "decimals": 1,
       "unit": "A",
       "hintAfter": 120,  // seconds
     }
   */
  props: [ 'config' ],
  data() {
    return {
      values: [ ],
      startValue: 0,
      current: [ ],
      startAt: Date.now(),
      hint: false,
      hintAvailable: false,
    }
  },
  computed: {
    value() {
      let value = this.startValue
      for (let i = 0; i < this.values.length; i++) {
        if (this.current[i]) {
          value += this.values[i]
        }
      }
      return this.round(value)
    },
  },
  methods: {
    round(value) {
      const mul = Math.pow(10, (this.config.decimals || 0))
      return Math.round(value * mul) / mul
    },
    isZero(value) {
      return Math.abs(value) < 0.00001
    },
    randomize() {
      const rndValue = () => this.round(2*(Math.random() - 0.5) * this.config.max)
      this.values = Array(this.config.count).fill(0).map(rndValue)
      this.current = Array(this.config.count).fill(false)
      let startValue = 0
      while (this.isZero(startValue)) {
        startValue = 0
        for (const val of this.values) {
          if (Math.random() < 0.5) {
            startValue -= val
          }
        }
      }
      this.startValue = startValue
    },
    toggle(index) {
      this.current.splice(index, 1, !this.current[index])
      this.checkDone()
    },
    checkDone() {
      setTimeout(() => {
        if (this.isZero(this.value)) {
          this.$emit('gameSuccess')
        }
      }, 500)
    },
    showHint() {
      this.hint = true
      setTimeout(() => this.hint = false, HINT_DURATION)
    }
  },
  created() {
    this.randomize()
    if (this.config.hintAfter) {
      setTimeout(() => this.hintAvailable = true, this.config.hintAfter*1000)
    }
  },
}
</script>
