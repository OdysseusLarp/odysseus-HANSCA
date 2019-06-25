<template>
  <v-ons-page>
    <toolbar-top></toolbar-top>
    <div style="text-align: center; margin-top: 50px;">
      <h2 class="title">Ship knowledge database</h2>
      <p v-if="connecting">Connecting...</p>
      <p v-else>Failed to connect to database.<br> Please try again later.</p>
    </div>
  </v-ons-page>
</template>

<style lang="scss" scoped>
.title {
  margin-bottom: 3em;
}
</style>

<script>
export default {
  data() {
    return {
      connecting: true
    }
  },
  created() {
    setTimeout(() => this.connecting = false, 3000)
  },
}
</script>
