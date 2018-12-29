<template>
    <div>
        <phase-sync-graph style="background-color: #ddd" :graphs="graphs"></phase-sync-graph>
        <p>amplitude: {{graphs[0].amplitude}}</p>
        <v-ons-range v-model="graphs[0].amplitude" min="0" max="2" step="0.001" style="width: 100%;"></v-ons-range>
        <p>wavelength: {{graphs[0].wavelength}}</p>
        <v-ons-range v-model="graphs[0].wavelength" min="0" max="2" step="0.001" style="width: 100%;"></v-ons-range>
        <p>phaseSpeed: {{graphs[0].phaseSpeed}}</p>
        <v-ons-range v-model="graphs[0].phaseSpeed" min="-15" max="15" step="0.001" style="width: 100%;"></v-ons-range>

        <p>amplitude: {{graphs[1].amplitude}}</p>
        <v-ons-range v-model="graphs[1].amplitude" min="0" max="2" step="0.001" style="width: 100%;"></v-ons-range>
        <p>wavelength: {{graphs[1].wavelength}}</p>
        <v-ons-range v-model="graphs[1].wavelength" min="0" max="2" step="0.001" style="width: 100%;"></v-ons-range>
        <p>phaseSpeed: {{graphs[1].phaseSpeed}}</p>
        <v-ons-range v-model="graphs[1].phaseSpeed" min="-15" max="15" step="0.001" style="width: 100%;"></v-ons-range>

    </div>
</template>

<script>
import PhaseSyncGraph from './PhaseSyncGraph'
export default {
    components: {
        PhaseSyncGraph
    },
    data() {
        return {
            graphs: [
                {
                    color: "red",
                    amplitude: 0.7,
                    wavelength: 0.25,
                    phaseSpeed: 1,
                },
                {
                    color: "green",
                    amplitude: 0.6,
                    wavelength: 0.45,
                    phaseSpeed: 1,
                },
            ]
        }
    }
}
</script>
