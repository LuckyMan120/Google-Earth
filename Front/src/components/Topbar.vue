<template>
    <div :class="auth? 'top-bar' : 'non-top-bar'">
        <div class="left-top-bar" v-if="auth">
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
        <div :class="auth? 'right-top-bar' : 'not-right-top-bar'">
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
            <mdb-btn v-if="auth" @click="showHistory" color="info">
                Show History
                <v-icon icon="history" class="v-icon-history" />
            </mdb-btn>

            <!-- profile image -->
            <mdb-btn @click="switchBtn" color="secondary">
                {{ switchTitle }}
                <v-icon v-if="auth" icon="sign-out-alt" class="v-icon-history" />
                <v-icon v-else icon="sign-in-alt" class="v-icon-logout" />
            </mdb-btn>
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
import { mdbBtn } from 'mdbvue';
import Modal from '../components/Modal'
import dialogs from '../services/dialogs.js'

export default {
    name: 'Topbar',
    data () {
        return {
            showFlag: false,
            options: {
                componentRestrictions: { country: 'US' }
            },
            switchTitle: 'Log In'
        }
    },
    components: {
        Modal,
        mdbBtn
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
            opened: 'reverse/opened',
            auth: 'auth/checkLogin'
        })
    },
    methods: {
        ...mapActions({
            setFlag: 'reverse/setOpened',
            logout: 'auth/logout'
        }),
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
        switchBtn: function () {
            if (this.auth) {
                let r = window.confirm('You will sign out now?')
                
                if (r === true) {
                    dialogs.message('Log out success!', { duration: 10, state: 'success' });
                    this.logout()
                }
            } else {
                this.$router.push({ name: 'Register' })
            }
        }
    },
    mounted () {
        if (this.auth) {
            this.switchTitle = 'Log out'
        } else {
            this.switchTitle = 'Log In'
        }
    },
    watch: {
        auth: function () {
            if (this.auth) {
                this.switchTitle = 'Log out'
            } else {
                this.switchTitle = 'Log In'
            }
        }
    }
}
</script>