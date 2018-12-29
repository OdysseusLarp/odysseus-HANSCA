<template>
    <svg viewBox="0 -0.25 1 0.5" xmlns="http://www.w3.org/2000/svg">
        <polyline v-for="(points, index) in graphPoints" :key="index" :points="points" fill="none" :stroke="$props.graphs[index].color" stroke-width="0.005" />
    </svg>
</template>

<script>
const WIDTH = 1
const POINTS = 75
const ASPECT = 0.25
const UPDATE_FREQ = 10 // ms

export default {
    props: [ 'graphs' ],
    data() {
        return {
            time: Date.now()/1000,
            phases: Array(this.$props.graphs.length).fill(0),
        }
    },
    computed: {
        graphPoints() {
            const graphs = []
            for (let i = 0; i < this.$props.graphs.length; i++) {
                graphs.push(this.computePoints(this.$props.graphs[i], i))
            }
            return graphs
        }
    },
    created () {
        this.timer = setInterval(this.update, UPDATE_FREQ)
    },
    beforeDestroy() {
        clearInterval(this.timer)
    },
    methods: {
        update() {
            for (let i=0; i < this.phases.length; i++) {
                const phase = (this.phases[i] + UPDATE_FREQ/1000 * this.$props.graphs[i].phaseSpeed*2*Math.PI) % (2*Math.PI)
                this.$set(this.phases, i, phase)
            }
        },
        computePoints(config, index) {
            let str = ""
            for (let x = 0; x <= WIDTH; x += (WIDTH/POINTS)) {
                let y = Math.sin(x*2*Math.PI/config.wavelength + this.phases[index]) * config.amplitude * ASPECT
                str += ` ${x},${y}`
            }
            return str
        }
    }
}
</script>
