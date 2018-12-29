<template>
    <svg viewBox="0 -0.25 1 0.5" xmlns="http://www.w3.org/2000/svg">
        <polyline :points="graphPoints" fill="none" stroke="red" stroke-width="0.005" />
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
            phases: [ 0 ],
        }
    },
    computed: {
        graphPoints() {
            const graphs = []
            this.$props.graphs.forEach(config => {
                graphs.push(this.computePoints(config))
            });
            return graphs[0]
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
            const phase = (this.phases[0] + UPDATE_FREQ/1000 * this.$props.graphs[0].phaseSpeed*2*Math.PI) % (2*Math.PI)
            this.$set(this.phases, 0, phase)
        },
        computePoints(config) {
            let str = ""
            for (let x = 0; x <= WIDTH; x += (WIDTH/POINTS)) {
                let y = Math.sin(x*2*Math.PI/config.wavelength + this.phases[0]) * config.amplitude * ASPECT
                str += ` ${x},${y}`
            }
            return str
        }
    }
}
</script>
