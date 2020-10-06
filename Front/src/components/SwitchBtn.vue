<template>
    <div class="switch-area">
        <span @click="switchHandler(true)" :style="switchFlag ? 'background: #cdd3d1' : ''">Calculator 1</span>
        <span @click="switchHandler(false)" :style="!switchFlag ? 'background: #cdd3d1' : ''">Calculator 2</span>
    </div>
</template>

<script>
export default {
    name: 'SwitchBtn',
    data () {
        return {
            switchFlag: true
        }
    },
    methods: {
        switchHandler: function (flag) {
            this.switchFlag = flag
            this.$emit('toggle', flag)
        }
    }
}
</script>