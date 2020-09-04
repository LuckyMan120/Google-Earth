<template>
    <div v-show="showFlag" class="disclaimer-modal lg-detail-modal md-detail-modal">
        <div class="left-side">
            <span>About Statistics...</span>
            <v-icon icon="times-circle" class="v-icon-times" @click="closeModal" />
        </div>
        <div class="disclaimer-body">
            <ul>
                <li>Results will very based on the assumptions entered by the user.</li>
                <li>This is a simplified illustration comparing the different returns needed to generate equivalent after-tax returns of an investment that qualifies for OZ benefits and one that does not.</li>
                <li>This calculator should not be used when assessing an actual investment.The calculation assumes a single investment.</li>
                <li>The model doesn't account for tax-basis adjustments like depreciation.</li>
                <li>No state taxes are included.</li>
            </ul>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
export default {
    name: 'Disclaimer',
    props: {
        showFlag: {
            type: Boolean,
            required: false,
            default: false
        }
    },
    methods: {
        ...mapActions({
            setFlag: 'reverse/setOpened'
        }),
        closeModal: function () {
            this.$emit('close')
            this.setFlag(false)
        }
    }
}
</script>