<template>
    <div>
        <phase-sync-graph :class="['graph', locked ? 'locked':'']" :graphs="graphs"></phase-sync-graph>
        <v-ons-progress-bar :class="['progress', success ? 'success':'']" :value="100 * time / config.duration"></v-ons-progress-bar>
        <div v-for="(t, index) in target" :key="index">
            <p :style="`color: ${colors[index]}`">{{current[index]}} / {{target[index]}}</p>
            <v-ons-range v-model="current[index]" min="0" max="1" step="0.001" style="width: 100%"></v-ons-range>
        </div>
    </div>
</template>

<style>
.graph {
    background-color: #ddd;
    border: 5px solid #f00;
}
.locked {
    border-color: #0f0;
}
.progress .progress-bar {
    height: 10px;
    background-color: #555;
}
.progress.success .progress-bar__primary {
    background-color: #0f0;
}
</style>


<script>
import PhaseSyncGraph from './PhaseSyncGraph'

const COLORS = [ "red", "green", "blue", "magenta", "cyan", "yellow" ]
// Delta below this limit is considered a phase lock
const DELTA_LIMIT = 0.02
// How often progress is checked
const PROGRESS_CHECK_FREQ = 100 // ms

export default {
    props: [ 'config' ],
    components: {
        PhaseSyncGraph
    },
    created () {
        this.timer = setInterval(this.update, PROGRESS_CHECK_FREQ)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    data() {
        const target = []
        const current = []
        const amplitudeBase = []
        const amplitudeCoefficient = []
        const wavelengthBase = []
        const phaseSpeedCoefficient = []
        const coefficients = []

        const targetWavelength = 0.25 + 0.5 * Math.random()

        for (var i = 0; i < this.config.dimensions; i++) {
            let t = Math.random()
            let c = Math.random()
            while (Math.abs(t-c) < 0.15) {
                c = Math.random()
            }
            target.push(t)
            current.push(c)
            amplitudeBase.push(0.65 + 0.1 * Math.random())
            amplitudeCoefficient.push(0.1 * Math.random())
            wavelengthBase.push(targetWavelength)
            phaseSpeedCoefficient.push((7 + 6 * Math.random()) * Math.sign(Math.random()-0.5))

            const coeff = []
            for (var j = 0; j < this.config.dimensions; j++) {
                if (i === j) {
                    coeff.push(1)
                } else {
                    coeff.push(this.config.difficulty * (0.5 + 0.5 * Math.random()))
                }
            }
            coefficients.push(coeff)
        }
        console.log("amplitudeBase", amplitudeBase)
        console.log("amplitudeCoefficient", amplitudeCoefficient)
        console.log("wavelengthBase", wavelengthBase)
        console.log("phaseSpeedCoefficient", phaseSpeedCoefficient)

        return {
            target,
            current,
            amplitudeBase,
            amplitudeCoefficient,
            wavelengthBase,
            phaseSpeedCoefficient,
            coefficients,
            time: 0,
            success: false,
            colors: COLORS,
        }
    },
    computed: {
        delta() {
            const delta = []
            for (var i = 0; i < this.config.dimensions; i++) {
                delta.push(this.target[i] - this.current[i])
            }

            const result = []
            for (var i = 0; i < this.config.dimensions; i++) {
                let d = 0
                for (var j = 0; j < this.config.dimensions; j++) {
                    d += delta[j] * this.coefficients[i][j]
                }
                result.push(d)
            }
            return result
        },
        graphs() {
            const graphs = []
            for (var i = 0; i < this.config.dimensions; i++) {
                const delta = this.delta[i]
                const amplitude = this.amplitudeBase[i] + delta * this.amplitudeCoefficient[i]
                const wavelength = this.wavelengthBase[i] * Math.max(1 + delta, 0.1)
                const phaseSpeed = delta * this.phaseSpeedCoefficient[i]
                const lock = (Math.abs(delta) <= DELTA_LIMIT)
                graphs.push({
                    color: COLORS[i],
                        amplitude,
                        wavelength,
                        phaseSpeed,
                        lock,
                })
            }
            return graphs
        },
        locked() {
            for (var i = 0; i < this.config.dimensions; i++) {
                if (Math.abs(this.delta[i]) > DELTA_LIMIT) {
                    return false
                }
            }
            return true
        },
    },
    methods: {
        update() {
            if (!this.success) {
                if (this.config.drift) {
                    const targets = []
                    const mul = this.config.drift * PROGRESS_CHECK_FREQ / 1000
                    this.target = this.target.map(t => Math.min(Math.max(t + (Math.random()*2-1)*mul, 0), 1))
                }
                if (this.locked  && Math.random() < 0.5) {
                    this.time = Math.min(this.time + 2 * PROGRESS_CHECK_FREQ / 1000, this.config.duration)
                    if (this.time >= this.config.duration) {
                        this.success = true
                        setTimeout(() => this.$emit('gameSuccess'), 500)
                    }
                }
            }
        }
    }
}
</script>
