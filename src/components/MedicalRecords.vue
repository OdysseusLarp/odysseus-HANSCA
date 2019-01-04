<template>
  <v-ons-page>
    <v-ons-toolbar>
      <div class="left"><v-ons-back-button @click.prevent="back()"></v-ons-back-button></div>
      <div class="right"><ons-toolbar-button @click="logout()"><v-ons-icon icon="fa-sign-out-alt"></v-ons-icon></ons-toolbar-button></div>
    </v-ons-toolbar>
    <div style="text-align: center; margin-top: 50px;">
      <v-ons-search-input placeholder="Search" v-model="query"></v-ons-search-input>
			<v-ons-list class="autocomplete">
        <v-ons-list-item v-for="record in results" @click="showRecord(record.id)">{{ record.name }}</v-ons-list-item>	
			</v-ons-list>
      <div class="resultTextBox">
        <pre><vue-typer :text='resultText' :repeat="0" :type-delay="15"></vue-typer></pre>
      </div>
    </div>
  </v-ons-page>
</template>
<script>
import Greeter from './Greeter.vue'
export default {
  data() {
    return {
      records: [
        { id: 0, name: 'Kathryn Janeway', age: 41, position: 'Captain', medical: `
        Problems
        
        DIABETES MELLITUS (ICD-250.)
        HYPERTENSION, BENIGN ESSENTIAL (ICD-401.1)

        Medications
        
        PRINIVIL TABS 20 MG (LISINOPRIL) 1 po qd
        Last Refill: #30 x 2 : Carl Savem MD (08/27/2410)
        HUMULIN INJ 70/30 (INSULIN REG & ISOPHANE (HUMAN)) 20 units ac breakfast
        Last Refill: #600 u x 0 : Carl Savem MD (08/27/2410)` },
        { id: 1, name: 'Malcolm Reynolds', age: 38, position: 'Captain', medical: `
        Problems
      
        DEPRESSION (ICD-311)

        Medications
      
        PROZAC CAPS 10 MG (FLUOXETINE HCL) 1 po qd
      
        Last Refill: #30 x 2 : Carl Savem MD (06/17/2410)` },
        { id: 2, name: 'William Adama', age: 51, position: 'Commander', medical: `
        Problems
        
        HYPERTENSION, BENIGN ESSENTIAL (ICD-401.1)
        DEPRESSION (ICD-311)
        RETINOPATHY, DIABETIC (ICD-362.0)
        POLYNEUROPATHY IN DIABETES (ICD-357.2)

        Medications
        
        HYTRIN CAP 5MG (TERAZOSIN HCL) 1 po qd
        Last Refill: #30 x 0 : Carl Savem (10/27/2410)
        PRINIVIL TABS 20 MG (LISINOPRIL) 1 po qd
        Last Refill: #30 x 2 : Carl Savem MD (10/27/2410)
        PROZAC CAPS 10 MG (FLUOXETINE HCL) 1 po qd
        Last Refill: #30 x 2 : Carl Savem MD (10/27/2410)` },
        { id: 3, name: 'Susan Ivanova', age: 45, position: 'Lieutenant Commander', medical: "" },
        { id: 4, name: 'Turanga Leela', age: 32, position: 'Pilot', medical: "" },
        { id: 5, name: 'David Bowman', age: 36, position: 'Doctor', medical: "" },
        { id: 6, name: 'Zaphod Beeblebrox', age: 32, position: 'Ex-Galactic President', medical: "" },
        { id: 7, name: 'Wilhuff Tarkin', age: 57, position: 'Admiral', medical: "" },
      ],
      query: '',
      results: [ ],
      resultText: ' '
    }
  },
  methods: {
    back() {
      this.$store.commit('navigator/pop')
    },
    scan() {
      Object.assign(this.$data, this.$options.data())
      this.state = 'scanning'
      if ('nfc' in navigator) {
        navigator.nfc.watch((message) => {
          this.processMessage(message)
        }, {mode: 'any'})
      }
    },
    showRecord(id) {
      let record = this.records.find((record) => { return (id === record.id)})
      this.query = ''
      this.resultText = `
      Name:     ${ record.name }
      Age:      ${ record.age }
      Position: ${ record.position }
      Medical records:
      ${ record.medical }`
    },
    logout() {
      this.$store.commit('navigator/push', Greeter)
    },
  },
  watch: {
    query: function(val) {
      if(val !== '') this.results = this.records.filter(function (record) { let re = new RegExp(val, 'gi'); return (record.name.match(re)) })
      else this.results = [ ]
    },
  },
  created() {
    if ('nfc' in navigator) {
      navigator.nfc.watch((message) => {
        this.showRecord(this.records[Math.floor(Math.random() * this.records.length)].id)
      }, {mode: 'any'})
    }
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
