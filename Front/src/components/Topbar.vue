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
            <div v-if="role === 1">
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
            
            <!-- Button for showing all details -->
            <button v-if="role === 1" @click="showHistory" class="history-btn">
                Show History
                <v-icon icon="history" class="v-icon-history" />
            </button>

            <!-- profile image -->
            <div @click="showOutBtn" class="img-user" :style="{'background-image': 'url(' + userImg + ')'}">
            </div>

            <!-- sign out -->
            <div v-if="outFlag" @click="signout" class="out-section">
                <span>Sign out</span>
            </div>
        </div>
        <Modal
            :showFlag="showFlag"
            :modalData="history"
            @closeModal="closeModal"
        />
    </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Modal from '../components/Modal'
import randomUser from '../static/img/user.jpg'
export default {
    name: 'Topbar',
    data () {
        return {
            showFlag: false,
            options: {
                componentRestrictions: { country: 'US' }
            },
            outFlag: false,
            userImg: ''
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
        },
        role: {
            type: Number,
            required: false,
            default: 2
        }
    },
    computed: {
        ...mapGetters({
            opened: 'reverse/opened',
            user: 'auth/getuser'
        })
    },
    methods: {
        ...mapActions({
            setFlag: 'reverse/setOpened',
            logout: 'auth/logout'
        }),
        showOutBtn: function () {
            this.outFlag = !this.outFlag
        },
        setFromtownPlace: function (place) {
            this.$emit('search', place)
        },
        showHistory: function () {
            console.log(this.opened)
            if (!this.opened) {
                this.showFlag = true;
                this.setFlag(true)
            }
        },
        closeModal: function (flag) {
            this.showFlag = flag;
        },
        signout: function () {
            let r = window.confirm('You will sign out now?')
            
            if (r === true) {
                this.logout()
            }
        }
    },
    mounted () {
        if (this.user.imageInfo === '') {
            this.userImg = randomUser
        } else {
            this.userImg = this.user.imageInfo
        }
    }
}
</script>