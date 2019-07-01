<template>
  <v-ons-page>
    <div style="text-align: center; margin-top: 50px;">
      <h1 v-if="config.gameTitle">{{config.gameTitle}}</h1>
      <p class="value">{{value}} {{config.unit}}</p>
      <div :class="{btn:true, selected: current[index]}" v-for="(value, index) in values" :key="index" @click="toggle(index)">{{index+1}}</div>
    </div>
  </v-ons-page>
</template>

<style>
.value {
  font-size: 300%;
}
.btn {
  display: inline-block;
  width: 50px;
  height: 35px;
  padding-top: 15px;
  margin: 10px;
  border-radius: 5px;
  border: 1px solid #eee;
  text-align: center;
}
.selected {
  background-color: yellow;
  color: #333;
}
</style>


<script>
export default {
  /*
     config: {
       "count": 5,
       "max": 15,
       "decimals": 1,
       "unit": "A"
     }
   */
  props: [ 'config' ],
  data() {
    return {
      values: [ ],
      startValue: 0,
      current: [ ],
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
  },
  created() {
    this.randomize()
  },
}
</script>
