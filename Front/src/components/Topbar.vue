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
            
            <!-- Button for showing all details -->
            <button @click="showHistory" class="history-btn">
                Show History
                <v-icon icon="history" class="v-icon-history" />
            </button>

            <!-- Button for downloading all details -->
            <downloadexcel
                class="download-btn"
                :data="json_data"
                :fields="fields"
                worksheet="My Worksheet"
                type="csv"
                :before-generate="startDownload"
                name="data.xls">
                <span>Download</span>
                <v-icon icon="download" class="v-icon-history" />
            </downloadexcel>
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
import downloadexcel from "vue-json-excel";
import Modal from '../components/Modal'
export default {
    name: 'Topbar',
    data () {
        return {
            showFlag: false,
            options: {
                componentRestrictions: { country: 'US' }
            },
            fields: {
                "IP Address": "ip",
                "Visited Time": "time",
                "Session": "session",
                "County Name": "country",
                "State Name": "state",
                "Uranized / Total Population": "population",
                "Number of pelple with college degree or higher / total population": "degree",
                "Single family unit housing structures (%)": "single",
                "2-9 Unit housing structures (%)": "medium",
                "10 or more unit housing structures (%)": "expand",
                "Median household income": "income",
                "Number of people aged 25 or older who have a bachelor's degree master's degree professional school degree or doctorate degree divided by the total number of people aged 25 or older in a tract (%)" : "degrees",
                "The median gross rent for renter-occupied housing units with two bedrooms that pay cash rent (from the 2011-2015 ACS)": "house",
                "Average annualized job growth rate over the time period 2004 to 2013 (%)": "growth",
                "Number of jobs per square mile in each tract": "square",
                "Number of residents per square mile": "residents"
            },
            json_data: null,
            json_meta: [
                [
                    {
                        'key': 'charset',
                        'value': 'utf-8'
                    }
                ]
            ]
        }
    },
    components: {
        Modal,
        downloadexcel
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
            console.log(this.history)
            if (!this.opened) {
                this.showFlag = true;
                this.setFlag(true)
            }
        },
        closeModal: function (flag) {
            this.showFlag = flag;
        },
        startDownload: function () {
            window.alert('Start Downloading');
        }
    },
    watch: {
        history: function () {
            console.log(this.history)
            let data = []
            this.history.history.forEach(item => {
                if (item.polygons.length !== 0) {
                    item.polygons.forEach(poly => {
                        let eachData = {
                            ip: item.IP_address,
                            time: item.visited_at,
                            session: item.session,
                            country: poly.countyname,
                            state: poly.statename,
                            population: poly.population,
                            degree: poly.degree,
                            single: poly.single,
                            medium: poly.medium,
                            expand: poly.expand,
                            income: poly.income,
                            degrees: poly.degrees,
                            house: poly.house_count,
                            growth: poly.job_growth_rate,
                            square: poly.per_square_job,
                            residents: poly.residents_count
                        }
                        data.push(eachData)
                    })
                } else {
                    let eachData = {
                        ip: item.IP_address,
                        time: item.visited_at,
                        session: item.session,
                        country: 'Never selected',
                        state: 'Never selected',
                        population: 'Never selected',
                        degree: 'Never selected',
                        single: 'Never selected',
                        medium: 'Never selected',
                        expand: 'Never selected',
                        income: 'Never selected',
                        degrees: 'Never selected',
                        house: 'Never selected',
                        growth: 'Never selected',
                        square: 'Never selected',
                        residents: 'Never selected'
                    }
                    data.push(eachData)
                }
            })

            this.json_data = data
        }
    }
}
</script>