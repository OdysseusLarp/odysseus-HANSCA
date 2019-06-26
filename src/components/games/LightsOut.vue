<template>
  <v-ons-page>
    <div style="text-align: center; margin-top: 50px;">
      <form name=lighttable>
        <table class="lighttable">
          <tr v-bind:key="i" v-for="(row, i) in lights">
            <td v-bind:key="j" v-for="(col, j) in row" :id="'cell' + i + j" @click="changeColor(i, j)" :class="{ lit: lights[i][j] }"> </td>
          </tr>
        </table>
      </form>

    </div>
  </v-ons-page>
</template>
<script>
export default {
  props: [ 'config' ],
  data() {
    return {
      lights: [ ],
    }
  },
  methods: {
    changeColor(row, col){
      this.toggle(row, col)
      this.lights = JSON.parse(JSON.stringify(this.lights))
      if (this.checkComplete()) {
        this.$emit('gameSuccess')
      }
    },
    toggle(row, col) {
      this.lights[row][col] = !this.lights[row][col]
      if(col % this.config.size !== 0) this.lights[row][col-1] = !this.lights[row][col-1]
      if ((col+1) % this.config.size !== 0) this.lights[row][col+1] = !this.lights[row][col+1]
      if (this.lights[row-1]) this.lights[row-1][col] = !this.lights[row-1][col]
      if (this.lights[row+1]) this.lights[row+1][col] = !this.lights[row+1][col]
    },
    randomize() {
      this.lights = Array.from(Array(this.config.size), (_, x) => Array.from(Array(this.config.size), (_, x) => 0))
      for(var i=0; i<this.config.random;i++) {
        this.toggle(Math.floor(Math.random()*this.config.size), Math.floor(Math.random()*this.config.size))
      }
      this.lights = JSON.parse(JSON.stringify(this.lights))
    },
    checkComplete() {
      let lights = this.lights.flat()
      console.log(lights)
      return lights.every(this.isLit)
    },
    isLit(value) {
      return value !== true
    },
  },
  created() {
    if (this.config.random > 0) {
      this.randomize()
    } else {
      this.lights = this.config.lights
    }
  },
}
</script>
<style>

table.lighttable {
  margin: 0 auto;
  border-collapse: collapse;
  font-size: 52px;
  background-color: black;
}
.lighttable tr td {
  width: 50px;
  height: 50px;
  border: 2px solid white;
}
.lit {
  background-color: yellow;
}
</style>
