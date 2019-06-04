import 'onsenui/css/onsenui.css'
import 'onsenui/css/dark-onsen-css-components.css'

import Vue from 'vue'
import Vuex from 'vuex'
import VueOnsen from 'vue-onsenui'

import App from './App.vue'
import store from './store.js'
import './axios-settings'

Vue.use(Vuex)
Vue.use(VueOnsen)

import VueTyper from 'vue-typer'
Vue.use(VueTyper)

Vue.config.productionTip = false

import ToolbarTop from './components/ToolbarTop.vue'
Vue.component('toolbar-top', ToolbarTop)


new Vue({
  render: h => h(App),
  store: new Vuex.Store(store),
  beforeCreate() {
    Vue.prototype.md = this.$ons.platform.isAndroid();
	}
}).$mount('#app')
