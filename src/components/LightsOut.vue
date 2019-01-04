<template>
  <v-ons-page>
    <toolbar-top/></toolbar-top>
    <div style="text-align: center; margin-top: 50px;">
      <form name=lighttable>
        <table class="lighttable">
          <tr v-for="(row, i) in lights">
            <td v-for="(col, j) in row" :id="'cell' + i + j" @click="changeColor(i, j)" :class="{ lit: lights[i][j] }"> </td>
          </tr>
        </table>
      </form>

    </div>
  </v-ons-page>
</template>
<script>
export default {
  data() {
    return {
      lights: [ ],
      size: 5
    }
  },
  methods: {
    changeColor(row, col){
      this.toggle(row, col)
      this.lights = JSON.parse(JSON.stringify(this.lights))
    },
    toggle(row, col) {
      this.lights[row][col] = !this.lights[row][col]
      if(col % this.size !== 0) this.lights[row][col-1] = !this.lights[row][col-1]
      if ((col+1) % this.size !== 0) this.lights[row][col+1] = !this.lights[row][col+1]
      if (this.lights[row-1]) this.lights[row-1][col] = !this.lights[row-1][col]
      if (this.lights[row+1]) this.lights[row+1][col] = !this.lights[row+1][col]
    },
  },
  created() {
    this.lights = Array.from(Array(this.size), (_, x) => Array.from(Array(this.size), (_, x) => 0))
    for(var i=0; i<10;i++) {
      this.toggle(Math.floor(Math.random()*this.size), Math.floor(Math.random()*this.size))
    }
    this.lights = JSON.parse(JSON.stringify(this.lights))
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
