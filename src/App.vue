<template>
  <v-ons-navigator swipeable swipe-target-width="50px"
    :page-stack="pageStack"
    :pop-page="storePop"
    :options="options"
  ></v-ons-navigator>
</template>

<script>
import Greeter from './components/Greeter.vue'
import Carousel from './components/Carousel.vue'
import Scanner from './components/Scanner.vue'

export default {
  beforeCreate() {
    this.$store.commit('navigator/push', Greeter)
  },
	computed: {
    pageStack() {
      return this.$store.state.navigator.stack
    },
    options() {
      return this.$store.state.navigator.options
    },
  },
  methods: {
    storePop() {
      this.$store.commit('navigator/pop')
    },
  },
  components: { Greeter, Carousel, Scanner }
}
</script>

<style>
#app {
}
</style>
