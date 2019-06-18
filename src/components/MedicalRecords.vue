<template>
  <v-ons-page>
    <toolbar-top/></toolbar-top>
    <div style="text-align: center; margin-top: 50px;">
      <v-ons-search-input placeholder="Search" v-model="query"></v-ons-search-input>
			<v-ons-list class="autocomplete">
        <v-ons-list-item v-for="record in results" @click="showRecord(record.id)">{{ record.name }}</v-ons-list-item>	
			</v-ons-list>
      <div class="resultTextBox">
        <pre><vue-typer :text='resultText' :repeat="0" :type-delay="10"></vue-typer></pre>
      </div>
    </div>
  </v-ons-page>
</template>
<script>

import { getBlob, patchBlob } from '../blob'
import { startWatch } from '../nfc'

export default {
  data() {
    return {
      record: { },
      id: 0,
      query: '',
      results: [ ],
      resultText: 'Input patient name or scan ID card.'
    }
  },
  methods: {
    showRecord() {
      this.query = ''
      this.resultText = `
      Name:        ${ this.record.first_name } ${ this.record.last_name }
      Age:         ${ this.record.age }
      Position:    ${ this.record.position }
      Home planet: ${ this.record.home_planet }
      Medical records:
      ${ this.record.medical }`
    },
    async getRecords(message) {
      message.records.forEach(function (record) {
        if (record.recordType == "text") {
          if (record.data.startsWith('person:')) {
            this.id = record.data.split( ':', 2)[1]
          }
        }
      }, this)
      this.record = await getBlob('/person', this.id)
      console.log(this.record)
      this.showRecord()
    }
  },
  watch: {
    query: function(val) {
      if(val !== '') this.results = this.records.filter(function (record) { let re = new RegExp(val, 'gi'); return (record.name.match(re)) })
      else this.results = [ ]
    },
  },
  created() {
    startWatch(this.getRecords)
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
