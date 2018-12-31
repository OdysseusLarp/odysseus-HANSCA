<template>
    <svg viewBox="0 -0.25 1 0.5">
        <!--
            Using SVG filters to create a yellow glow/blur effect would be cool,
            but applying the filter doesn't work (and causes lines to disappear).
            May be something with quoting?  style="filter:url(&quot;#glow&quot)"
		<defs>
			<filter id="glow">
				<fegaussianblur class="blur" result="coloredBlur" stddeviation="0.05"></fegaussianblur>
				<femerge>
					<femergenode in="coloredBlur"></femergenode>
                    <femergenode in="coloredBlur"></femergenode>
                    <femergenode in="coloredBlur"></femergenode>
					<femergenode in="coloredBlur"></femergenode>
                    <femergenode in="coloredBlur"></femergenode>
                    <femergenode in="coloredBlur"></femergenode>
					<femergenode in="SourceGraphic"></femergenode>
				</femerge>
			</filter>
		</defs>
            :style="graphs[index].lock ? 'filter: url(#glow)' : ''"
        -->
        <g v-for="(points, index) in graphPoints" :key="index">
            <polyline
                v-if="$props.graphs[index].lock"
                :points="points"
                fill="none"
                stroke="yellow"
                stroke-opacity="0.7"
                stroke-width="0.008" />
            <polyline
                :points="points"
                fill="none"
                :stroke="$props.graphs[index].color"
                stroke-width="0.005" />
        </g>
    </svg>
</template>

<script>
const WIDTH = 1
// How many points is rendered in one graph
const POINTS = 75
// Viewport aspect ratio (also in viewBox)
const ASPECT = 0.25
const UPDATE_FREQ = 40 // ms
// How fast does phase move to zero when in phase lock
const SPEED_LOCK_SHIFT_SPEED = 0.5

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
                const speed = this.$props.graphs[i].phaseSpeed
                let phase = this.phases[i]
                if (this.$props.graphs[i].lock) {
                    if (phase > Math.PI) {
                        phase -= 2 * Math.PI
                    }
                    if (phase > SPEED_LOCK_SHIFT_SPEED) {
                        phase -= SPEED_LOCK_SHIFT_SPEED
                    } else if (phase < -SPEED_LOCK_SHIFT_SPEED) {
                        phase += SPEED_LOCK_SHIFT_SPEED
                    } else {
                        phase = (Math.random() - 0.5) * 0.15
                    }
                } else {
                    phase += UPDATE_FREQ/1000 * speed*2*Math.PI
                }
                phase = phase % (2*Math.PI)
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
