<template>
    <div class="manual">
        <h1 v-if="config.title">{{config.title}}</h1>
        <div v-html="config.pages[page]"/>
        <div class="buttons">
            <v-ons-button @click="back" v-if="page > 0" class="btn back" modifier="outline">Back</v-ons-button>
            <v-ons-button @click="next" class="btn next">{{config.buttons[page]}}</v-ons-button>
        </div>
    </div>
</template>

<style>
.manual {
    margin: 0.5em;
}
.buttons {
    text-align: center;
}
.btn {
    margin: 2em;
}
img {
    width: 100%;
}
</style>

<script>
export default {
    props: [ 'config' ],
    data() {
        return {
            page: 0,
        }
    },
    computed: {
        totalPages() {
            return this.config.pages.length
        },
    },
    methods: {
        back() {
            if (this.page > 0) {
                this.page--
            }
        },
        next() {
            if (this.page + 1 < this.totalPages) {
                this.page++
            } else {
                this.$emit('gameSuccess')
            }
        }
    }
}
</script>
