<template>
    <div class="top-bar">
        <div class="left-top-bar">
            <div>
                <span>Current Visitor</span>
                <v-icon icon="user" class="v-icon" />
                <span>{{ visitor_IP }}</span>
            </div>
            <div>
                <span>Session</span>
                <v-icon icon="clock" class="v-icon" />
                <span>{{ session }}</span>
            </div>
            <div>
                <span>Previous Visitor</span>
                <v-icon icon="user" class="v-icon" />
                <span>{{ preIP }}</span>
            </div>
        </div>
        <div class="right-top-bar">
            <!-- search map -->
            <div class="search-input">
                <span>
                    Search Location
                    <v-icon icon="globe-americas" class="v-icon" />
                </span>
                <gmap-autocomplete
                    @place_changed="setFromtownPlace"
                    :options="options"
                    class="area-search lg-area-search md-area-search"
                ></gmap-autocomplete>
            </div>
            <button @click="showHistory" class="history-btn">
                Show History
                <v-icon icon="history" class="v-icon-history" />
            </button>
        </div>
        <Modal
            :showFlag="showFlag"
            :data="history"
            @closeModal="closeModal"
        />
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Modal from '../components/Modal'
export default {
    name: 'Topbar',
    data () {
        return {
            showFlag: false,
            options: {
                componentRestrictions: { country: 'US' }
            }
        }
    },
    components: {
        Modal
    },
    props: {
        visitor_IP: {
            type: String,
            required: false,
            default: ''
        },
        session: {
            type: String,
            required: false,
            default: ''
        },
        history: {
            type: Object,
            required: false,
            default: null
        },
        preIP: {
            type: String,
            required: false,
            default: ''
        }
    },
    computed: {
        ...mapGetters({
            opened: 'reverse/opened'
        })
    },
    methods: {
        ...mapActions({
            setFlag: 'reverse/setOpened'
        }),
        setFromtownPlace: function (place) {
            this.$emit('search', place)
        },
        showHistory: function () {
            if (!this.opened) {
                this.showFlag = true;
                this.setFlag(true)
            }
        },
        closeModal: function (flag) {
            this.showFlag = flag;
        }
    }
}
</script>