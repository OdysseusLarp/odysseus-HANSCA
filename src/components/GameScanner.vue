<template>
  <v-ons-page>
    <toolbar-top></toolbar-top>
    <!-- For wtf reason v-if causes a crash when changing state -->
    <div v-show="state == 'scanning'" style="text-align: center; margin-top: 50px;">
      <h2>Scanning...</h2>
      <p>Tag contents:</p>
      <v-ons-input placeholder="Tag contents" float v-model="tag"></v-ons-input>
      <v-ons-button @click="start">Start</v-ons-button>
    </div>
    <div></div>
    <div v-show="state == 'init'">
      <div class="desc">
        <h1 v-if="config.title">{{config.title}}</h1>
        <div v-html="config.initDescription"/>
      </div>
      <div class="center">
        <v-ons-button @click="proceed">Proceed</v-ons-button>
      </div>
    </div>
    <div></div>
    <div v-show="state == 'game'">
      <component :is="component" v-bind="{ config }" v-on:gameSuccess="success"></component>
    </div>
    <div></div>
    <div v-show="state == 'end'">
      <div class="desc">
        <h1 v-if="config.title">{{config.title}}</h1>
        <div v-html="config.endDescription"/>
      </div>
      <div class="center">
        <v-ons-button @click="close">Close</v-ons-button>
      </div>
    </div>
    <div v-show="state == 'notbroken'">
      <div class="desc">
        <h1 v-if="config.title">{{config.title}}</h1>
        <div v-html="config.notBrokenDescription || defaultNotBroken"/>
      </div>
      <div class="center">
        <v-ons-button @click="close">Close</v-ons-button>
      </div>
    </div>
  </v-ons-page>
</template>

<style lang="scss" scoped>
.desc {
  margin: 1em;
}
.center {
  text-align: center;
}
</style>

<script>
import { getBlob, patchBlob } from '../blob'
import PhaseSyncGame from './games/PhaseSyncGame'

const GAMES = {
  phasesync: PhaseSyncGame
}

// FIXME: Add NFC scanning functionality

export default {
  data() {
    return {
      tag: "",
      component: undefined,
      game: {},
      gameConfig: {},
      config: {},
      state: 'scanning',
      defaultNotBroken: 'The system is operating nominally'
    }
  },
  methods: {
    async start() {
      // Load the game configs into 'this'
      if (this.tag.startsWith('game:')) {
        const id = this.tag.split(':', 2)[1]
        this.game = await getBlob('game', id)
        if (!this.game.game_config) {
          console.error(`Game '${id}' did not contain game_config`)
          return
        }

        this.gameConfig = await getBlob('game_config', this.game.game_config)
        if (!this.gameConfig.default) {
          console.error(`Game config '${this.game.game_config}' did not contain default config`)
          return
        }
        this.startGame()
      } else {
        console.error(`Unknown tag: '${this.tag}`)
      }
    },
    startGame() {
      // Start the game
      let config = this.gameConfig.default  // Should choose config based on logged in user
      if (this.game.config) {
        config = { ...config, ...this.game.config }
      }
      this.config = config
      if (this.game.status !== 'broken') {
        this.state = 'notbroken'
        return
      }

      const gameComponent = GAMES[config.game]
      if (gameComponent) {
        this.component = gameComponent
        if (config.initDescription) {
          this.state = 'init'
        } else {
          this.state = 'game'
        }
      } else {
        console.log(`Game type '${config.game}' is unknown`)
      }
    },
    proceed() {
      this.state = 'game'
    },
    success() {
      patchBlob(this.game.type, this.game.id, { status: 'fixed' })
      if (this.config.endDescription) {
        this.state = 'end'
      } else {
        this.close()
      }
    },
    close() {
      this.$store.commit('navigator/pop')
    }
  },
  created() {
    if ('nfc' in navigator) {
      navigator.nfc.watch((message) => {
        message.records.forEach(function (record) {
          if (record.recordType == "text") {
            this.tag = record.data
          }
          navigator.nfc.cancelWatch()
        }, this)
      }, {mode: 'any'})
    }
  },
  components: {
  }
}
</script>
