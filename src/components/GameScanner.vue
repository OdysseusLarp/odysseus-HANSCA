<template>
  <v-ons-page @show="show" @hide="hide">
    <toolbar-top></toolbar-top>
    <!-- For wtf reason v-if causes a crash when changing state -->
    <div v-show="state == 'scanning'" style="text-align: center; margin-top: 50px;">
      <h2 @click="countDebug">Scanning...</h2>
      <p class="italic">[Scan an engineering task NFC tag]</p>
      <div v-if="debug">
        <p>Tag contents:</p>
        <v-ons-input placeholder="Tag contents" float v-model="tag"></v-ons-input>
        <v-ons-button @click="start">Start</v-ons-button>
      </div>
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
      <component :is="component" v-bind="{ config }" v-on:gameSuccess="success" v-on:gameFail="fail"></component>
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
    <div v-show="state == 'fail'">
      <div class="desc">
        <h1 v-if="config.title">{{config.title}}</h1>
        <div v-html="config.failDescription"/>
      </div>
      <div class="center">
        <v-ons-button @click="close">Close</v-ons-button>
      </div>
    </div>
    <div v-show="state == 'preFail'">
      <div class="desc">
        <h1 v-if="config.title">{{config.title}}</h1>
        <div v-html="config.preFailDescription"/>
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
import ManualGame from './games/ManualGame'
import LightsOut from './games/LightsOut'
import FlappyDrone from './games/FlappyDrone.vue'
import ValueBalance from './games/ValueBalance.vue'
import Nonogram from './games/Nonogram.vue'
import Snake from './games/Snake.vue'
import { startWatch, cancelWatch } from '../nfc';

const GAMES = {
  phasesync: PhaseSyncGame,
  manual: ManualGame,
  lightsout: LightsOut,
  flappy: FlappyDrone,
  balance: ValueBalance,
  nonogram: Nonogram,
  snake: Snake,
}

export default {
  data() {
    return {
      tag: "",
      component: undefined,
      game: {},
      gameConfig: {},
      config: {},
      state: 'scanning',
      defaultNotBroken: 'The system is operating normally',
      debug: false,
      debugCount: 0,
      gameLoader: () => undefined,
      startTime: 0,
    }
  },
  methods: {
    async start() {
      // Load the game configs into 'this'
      localStorage.setItem('game-tag', this.tag)
      if (this.tag.startsWith('game:')) {
        const id = this.tag.split(':', 2)[1]
        this.game = await getBlob('/data/game', id)
        if (!this.game.game_config) {
          console.error(`Game '${id}' did not contain game_config`)
          return
        }

        this.gameConfig = await getBlob('/data/game_config', this.game.game_config)
        if (!this.gameConfig.default) {
          console.error(`Game config '${this.game.game_config}' did not contain default config`)
          return
        }
        this.startGame()
      } else {
        console.error(`Unknown tag: '${this.tag}`)
      }
    },
    async startGame() {
      // Start the game
      
      // Find proper config for the user
      const groups = this.$store.state.user.user.groups;
      const roleForConfig = groups.find(g => g in this.gameConfig)
      let config
      if (roleForConfig) {
        config = this.gameConfig[roleForConfig]
        console.log('Using config for role ' + roleForConfig, config)
      } else {
        config = this.gameConfig.default
        console.log('Using default config', config)
      }

      if (this.game.config) {
        config = { ...config, ...this.game.config }
      }
      this.config = config
      if (this.game.status !== 'broken') {
        this.state = 'notbroken'
        return
      }

      console.log('getting game component');
      if (config.game in GAMES) {
        cancelWatch()
        this.gameLoader = () => {
          this.component = GAMES[config.game]
          this.startTime = Date.now()
          patchBlob('/data/' + this.game.type, this.game.id, { game_start: new Date().toISOString() })
        }
        let condition = true
        if (this.config.preCondition) {
          condition = await this.checkPreCondition()
        }
        if (condition) {
          if (config.initDescription) {
            this.state = 'init'
          } else {
            this.state = 'game'
            this.gameLoader();
            this.gameLoader = () => undefined;
          }
        }else {
          this.state = 'preFail'
        }
      } else {
        console.log(`Game type '${config.game}' is unknown`)
      }
    },
    proceed() {
      if (typeof this.gameLoader === 'function') {
        this.gameLoader();
        this.gameLoader = () => undefined;
      }
      this.state = 'game'
    },
    success() {
      const duration = Date.now() - this.startTime
      patchBlob('/data/' + this.game.type, this.game.id, { status: 'fixed', game_duration: Math.floor(duration/1000) })
      if (this.config.endDescription) {
        this.state = 'end'
      } else {
        this.close()
      }
    },
    fail() {
      if (this.config.failDescription) {
        this.state = 'fail'
      } else {
        this.close()
      }
    },
    close() {
      this.$store.commit('navigator/pop')
    },
    countDebug() {
      if (!this.debug) {
        this.debugCount++
        if (this.debugCount >= 5) {
          this.debug = true
          this.tag = localStorage.getItem('game-tag') || 'game:impulse_C1'
        }
      }
    },
    handleTag(message) {
      this.tag = message
      this.start()
    },
    async show() {
      await startWatch(this.handleTag);
    },
    hide() {
      cancelWatch()
    },
    async checkPreCondition() {
      this.conditionData = await getBlob(this.config.preCondition, '')
      console.log('precon data', this.conditionData)
      return (this.conditionData.amount > 0)

    },
  },
}
</script>
<style lang="scss" scoped>
p.italic {
  font-style: italic;
}
</style>
