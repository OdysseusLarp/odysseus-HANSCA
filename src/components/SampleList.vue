<template>
  <v-ons-page>
    <toolbar-top />
    <div class="container">
        <h1>VIEW SAMPLES</h1>
        <p class="description">All samples taken by medics and scientists are listed here.</p>
        <div v-for="sample in samples" v-bind:key="sample.id" class="sample-container">
          <h2>{{ sampleTypes.get(sample.additional_type) || sample.additional_type}}, {{ sample.sample_id }}</h2>
          <h3>Taken {{ sample.age }} ago by {{ sample.author.full_name }}</h3>
          <h3 v-if="sample.target">Sample of artifact {{ sample.target }}</h3>
          <p>
            <span v-if="sample.is_complete" class="is-completed">EVA has released the sample results to EOC Datahub.</span>
            <span v-else-if="sample.is_analysed" class="is-analyzed">Sample has been analyzed and is in queue for being processed by EVA.</span>
            <span v-else class="is-not-analyzed">Sample {{ sample.sample_id }} is waiting to be analyzed by {{ sample.type === 'SCIENCE' ? 'scientists' : 'medics or scientists' }}. Sample can be analyzed by using the HANSCA 'Analyze' function.</span>
          </p>
        </div>
    </div>
  </v-ons-page>
</template>
<script>
import axios from 'axios';
import { get } from 'lodash-es';
import { distanceInWordsToNow } from 'date-fns';

export default {
  data() {
    return {
      samples: [],
      sampleTypes: new Map([
        ['BLOOD_SAMPLE', 'Blood sample'],
        ['GENE_SAMPLE', 'Gene sample'],
        ['MATERIAL_SAMPLE', 'Material sample'],
        ['OTHER_SAMPLE', 'Other sample'],
        ['MICROSCOPE_SAMPLE', 'Microscopic analysis'],
        ['AGE', 'Radiocarbon dating'],
        ['HISTORY_SAMPLE', 'Historical analysis'],
        ['XRF_SAMPLE', 'X-Ray Fluorescence analysis'],
      ]),
      isMedic: false,
      isScientist: false,
    }
  },
  created() {
    this.fetchSamples();
    const groups = new Set(get(this.$store.state, 'user.user.groups', []));
    const isMedic = groups.has('role:medic');
    const isScientist = groups.has('role:science');
    this.isMedic = isMedic;
    this.isScientist = isScientist;
  },
  methods: {
    async fetchSamples() {
      await axios.get('/operation?include_complete=true&relations=true').then(res => {
        const data = res.data || [];
        this.samples = data
          .filter(operation => (operation.additional_type || '').match(/.*_SAMPLE$/) && !!operation.sample_id)
          .map(operation => {
            const op = { ...operation, age: distanceInWordsToNow(new Date(operation.created_at)) };
            if (operation.catalog_id) op.target = operation.catalog_id;
            return op;
          })
          .sort((a, b) => a.created_at < b.created_at ? 1 : -1);
      });
      console.log('got em samples', JSON.parse(JSON.stringify(this.samples)));
    },
  },
}
</script>
<style lang="scss" scoped>
$gray: #171717;
$light-gray: #383838;
$orange: #f4a140;
$green: rgb(88, 240, 88);
$red: rgb(228, 78, 78);

.container {
  text-align: center;
  margin-top: 0 !important;
  display: flex;
  flex-direction: column;
  padding-left: 5vw;
  padding-right: 5vw;
  padding-bottom: 3vh;
}
.sample-container {
  background-color: $light-gray;
  border: 1px solid $orange;
  padding: 1rem;
  padding-bottom: 0;
  margin-bottom: 1rem;
}
.description {
  margin-top: 0;
}
.is-completed {
  color: $green;
}
.is-analyzed {
  color: lighten($green, 20);
}
.is-not-analyzed {
  color: lighten($orange, 20);
}
h1 {
  margin-bottom: 1rem;
}
h2 {
  margin-top: 0;
  margin-bottom: 0;
  font-size: 1.6rem;
  color: $orange;
}
h3 {
  margin-top: 3px;
  margin-bottom: 0;
  font-size: 0.9rem;
}
</style>
