<!-- Medic version of ScienceAnalysis.vue -->
<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top />
    <div class="container">
        <h1>TAKE A SAMPLE</h1>
        <p class="has-id" v-if="bio_id">BIO ID OK</p>
        <p class="no-bio-id" v-else>SCAN PATIENT BIO ID</p>
        <label for="sample-id">UNIQUE SAMPLE ID<span class="required">*</span></label>
        <input v-model="sample_id" type="text" id="sample-id" />
        <label for="additional-type">SAMPLE TYPE (BLOOD, SALIVA...)<span class="required">*</span></label>
        <input v-model="additional_type" type="text" id="additional-type" />
        <label for="sample-description">DESCRIPTION</label>
        <textarea v-model="description" id="sample-description" />
        <button type="button" @click="submitSample">
          SUBMIT FOR ANALYSIS
        </button>
    </div>
  </v-ons-page>
</template>
<script>
import { post } from 'axios';
import { startWatch, cancelWatch, hasNfc } from '../nfc'
import { get } from 'lodash';

export default {
  data() {
    return {
      bio_id: '',
      sample_id: '',
      description: '',
      additional_type: '',
    }
  },
  methods: {
    setBioId(message) {
      console.log('got message', message);
      if (message.startsWith('bio:')) {
          console.log('starts with bio');
          const id = message.split(':', 2)[1];
          this.bio_id = id;
          console.log('this bio id =>', this.bio_id);
      } else {
        this.$ons.notification.toast('Scanned tag is not a Bio ID', { timeout: 2500, animation: 'fall' });
      }
    },
    submitSample() {
      const data = {
        is_complete: false,
        is_analysed: false,
        author_id: this.$store.state.user.user.id,
        type: 'MEDIC',
        additional_type: this.additional_type,
        bio_id: this.bio_id,
        sample_id: this.sample_id,
        description: this.description,
      };
      if (!data.author_id || !data.additional_type || !data.bio_id || !data.sample_id)
        return this.$ons.notification.alert(
          'Make sure you fill in the required fields',
          { title: 'Error', maskColor: 'rgba(255, 0, 0, 0.2)' });
      post('/operation', data).then(res => {
        this.$ons.notification.alert('Sample sent for analysis', { title: 'Success!', maskColor: 'rgba(0, 255, 0, 0.2)' });
        this.clearFields();
      }).catch(err => {
        // No time to make error handling that makes sense, so behold:
        const msg = get(err, 'response.data.error');
        const mightBeBioIdError = msg.includes('operation_result_bio_id_foreign');

        this.$ons.notification.alert(
          mightBeBioIdError ?
            'Make sure that you have the correct patient Bio ID.' :
            'Could not submit sample for analysis.',
          { title: 'Error', maskColor: 'rgba(255, 0, 0, 0.2)' });
      })
    },
    clearFields() {
      this.bio_id = '';
      this.sample_id = '';
      this.description = '';
      this.additional_type = '';
    },
    show() {
      startWatch(this.setBioId)
    },
    hide() {
        cancelWatch()
    }
  },
}
</script>
<style lang="scss">
$gray: #171717;
$light-gray: #383838;
$orange: #f4a140;

p {
  font-weight: bold;
  margin-bottom: 40px;
}
.container {
  text-align: center;
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  padding-left: 5vw;
  padding-right: 5vw;
  padding-bottom: 3vh;
}
.required {
  color: $orange;
  padding-left: 5px;
}
h1 {
  padding-bottom: 1rem !important;
}
label {
  font-size: 1.2rem;
}
input, textarea {
  background: lighten($gray, 20);
  background-color: lighten($gray, 20);
  border: 1px solid lighten($gray, 25);
  font-size: 1.6rem;
  padding: 0.5rem;
  color: #fff;
  margin: 1rem;
  margin-top: 0.5rem;
}
input {
    text-align: center;
}
textarea {
  resize: none;
  min-height: 8rem;
  padding: 1rem;
}
button {
  background: darken($orange, 10);
  border: 0.1rem solid darken($orange, 25);
  font-size: 1.6rem;
  padding: 0.9rem;
  margin: 1rem;
  color: #fff;
  text-shadow: 0px 0px 3px rgba(0, 0, 0, .8);
}
</style>
