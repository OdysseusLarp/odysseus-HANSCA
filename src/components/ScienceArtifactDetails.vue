<!-- Science version of MedicalRecords.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div style="text-align: center; margin-top: 50px;">
      <h1>SCAN ARTIFACT</h1>
      <v-ons-search-input placeholder="Search" v-model="query" v-if="showInput"></v-ons-search-input>
      <div class="resultTextBox">
        <pre><vue-typer :text='resultText' :repeat="0" :type-delay="10"></vue-typer></pre>
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
      showInput: !hasNfc()
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
    },
    async getRecords(message) {
      if (message.startsWith('artifact:')) {
        this.id = message.split( ':', 2)[1]
        if (!this.id) return;
        this.record = await getBlob('/science/artifact/catalog', this.id.toUpperCase())
        this.showRecord()
      } else {
        this.resultText = `This does not seem to be an artifact.

Ready to scan an artifact.`
      }
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
  show() {
    startWatch(this.getRecords)
  },
  hide() {
    cancelWatch()
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
