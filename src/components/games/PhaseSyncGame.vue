<template>
    <div>
        <phase-sync-graph :class="['graph', success ? 'success':'']" :graphs="graphs"></phase-sync-graph>
        <div v-for="(t, index) in target" :key="index">
            <p>{{current[index]}} / {{target[index]}}</p>
            <v-ons-range v-model="current[index]" min="0" max="1" step="0.001" style="width: 100%"></v-ons-range>
        </div>
    </div>
</template>

<style scoped>
.graph {
    background-color: #ddd;
    border: 5px solid #f00;
}
.success {
    border-color: #0f0;
}
</style>


<script>
import PhaseSyncGraph from './PhaseSyncGraph'

const COLORS = [ "red", "green", "blue", "magenta", "cyan", "yellow" ]
// Delta below this limit is considered a phase lock
const DELTA_LIMIT = 0.02

export default {
    props: {
        "dimensions": Number
    },
    components: {
        PhaseSyncGraph
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

        for (var i = 0; i < this.dimensions; i++) {
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
            for (var j = 0; j < this.dimensions; j++) {
                if (i === j) {
                    coeff.push(1)
                } else {
                    coeff.push(0.2 + 0.2 * Math.random())
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
        }
    },
    computed: {
        delta() {
            const delta = []
            for (var i = 0; i < this.dimensions; i++) {
                delta.push(this.target[i] - this.current[i])
            }

            const result = []
            for (var i = 0; i < this.dimensions; i++) {
                let d = 0
                for (var j = 0; j < this.dimensions; j++) {
                    d += delta[j] * this.coefficients[i][j]
                }
                result.push(d)
            }
            return result
        },
        graphs() {
            const graphs = []
            for (var i = 0; i < this.dimensions; i++) {
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
        success() {
            for (var i = 0; i < this.dimensions; i++) {
                if (Math.abs(this.delta[i]) > DELTA_LIMIT) {
                    return false
                }
            }
            return true
        },
    }
}
</script>
