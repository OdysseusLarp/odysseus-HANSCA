<template>
  <v-ons-page>
    <toolbar-top></toolbar-top>
    <div v-show="state === 'scanning'" class="game-selector">
      <h1>Select game</h1>
      <div class="game-selection-button-container">
        <v-ons-select id="skill-level" v-model="skillLevel">
          <option v-for="level in skillLevels" :value="level.value" :key="level.value">Difficulty: {{ level.label }}</option>
        </v-ons-select>
        <v-ons-button disabled @click="onGameSelected('phasesync')">Phase Sync</v-ons-button>
        <v-ons-button disabled @click="onGameSelected('manual')">Manual</v-ons-button>
        <v-ons-button disabled @click="onGameSelected('lightsout')">Lights Out</v-ons-button>
        <v-ons-button @click="onGameSelected('flappy')">Flappy Drone</v-ons-button>
        <v-ons-button disabled @click="onGameSelected('balance')">Value Balance</v-ons-button>
        <v-ons-button disabled @click="onGameSelected('nonogram')">Nonogram</v-ons-button>
        <v-ons-button @click="onGameSelected('snake')">Snake</v-ons-button>
      </div>
    </div>
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
import PhaseSyncGame from './games/PhaseSyncGame'
import ManualGame from './games/ManualGame'
import LightsOut from './games/LightsOut'
import FlappyDrone from './games/FlappyDrone.vue'
import ValueBalance from './games/ValueBalance.vue'
import Nonogram from './games/Nonogram.vue'
import Snake from './games/Snake.vue'
import { flappyConfig } from './game-test-configs/flappy';
import { snakeConfig } from './game-test-configs/snake';
import cloneDeep from "lodash-es";

const GameComponents = {
  phasesync: PhaseSyncGame,
  manual: ManualGame,
  lightsout: LightsOut,
  flappy: FlappyDrone,
  balance: ValueBalance,
  nonogram: Nonogram,
  snake: Snake,
}

const Games = {
  PhaseSync: 'phasesync',
  Manual: 'manual',
  LightsOut: 'lightsout',
  FlappyDrone: 'flappy',
  ValueBalance: 'balance',
  Nonogram: 'nonogram',
  Snake: 'snake',
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
      skillLevel: 'default',
      skillLevels: [
        { label: 'Default', value: 'default' },
        { label: 'Novice (hard)', value: 'skill:novice' },
        { label: 'Master (medium)', value: 'skill:master' },
        { label: 'Expert (easy)', value: 'skill:expert' },]
    }
  },
  methods: {
    async onGameSelected(gameType) {
      console.log("Launching game", gameType);
      switch (gameType) {
        case Games.PhaseSync:
          this.tag = 'game:phasesync'
          break
        case Games.Manual:
          this.tag = 'game:manual'
          break
        case Games.LightsOut:
          this.tag = 'game:lightsout'
          break
        case Games.FlappyDrone:
          this.tag = 'game:flappy'
          this.gameConfig = cloneDeep(flappyConfig);
          console.log("CONFIG SET TO FLABBY CONFIG", flappyConfig);
          break
        case Games.ValueBalance:
          this.tag = 'game:balance'
          break
        case Games.Nonogram:
          this.tag = 'game:nonogram'
          break
        case Games.Snake:
          this.tag = 'game:snake'
          this.gameConfig = cloneDeep(snakeConfig);
          break
        default:
          console.error(`Unknown game type: ${gameType}`)
          return
      }
      this.game = {};
      this.startGame();
    },
    async startGame() {
      const gameConfig = JSON.parse(JSON.stringify(this.gameConfig));
      const difficulty = this.skillLevel;

      let config;
      if (difficulty in gameConfig) {
        config = gameConfig[difficulty];
      } else {
        config = gameConfig.default;
        console.log('Using default config', config)
      }

      if (this.game.config) {
        config = { ...config, ...this.game.config }
      }
      this.config = config

      console.log('getting game component');
      if (config.game in GameComponents) {
        this.gameLoader = () => {
          this.component = GameComponents[config.game]
          this.startTime = Date.now()
        }
        let condition = true
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
      this.state = 'game';
    },
    success() {
      if (this.config.endDescription) {
        this.state = 'end';
      } else {
        this.$ons.notifications.alert('Game completed', { title: 'Game completed!', maskColor: 'rgba(0, 255, 0, 0.2)' })
        this.close();
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
  },
}
</script>
<style lang="scss" scoped>
p.italic {
  font-style: italic;
}
.game-selection-button-container {
  display: flex;
  flex-direction: column;
  flex-wrap: wrap;
  justify-content: center;

  > * {
    margin: 0.5em;
    max-width: 300px;
    text-align: center;
  }
}
</style>
