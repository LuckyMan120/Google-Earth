<template>
    <div>
        <Topbar
            :visitor_IP="visiterIP"
            :session="time"
            :history="historyData"
            :preIP="previousIP"
            @search="searchArea"
        />
        <div class="main-body">
            <!-- left side -->
            <div style="width: 70%">
                <GmapMap
                    ref="gmap"
                    :center="center"
                    :zoom="zoom"
                    map-type-id="roadmap"
                    style="width: 100%"
                    class="lg-gmap md-gmap"
                    :options="{
                        mapTypeControl: false
                    }"
                >
                    <gmap-polygon
                        v-for="(path, index) in paths"
                        :key="index"
                        v-bind:path.sync="path.path"
                        v-bind:options="{ 
                            strokeColor:'#008000',
                            clickable: true
                        }"
                        @click="showDetails(path)"
                        >
                    </gmap-polygon>

                    <GmapMarker v-if="marked" :position="markedPosition" :label="title" />
                    <gmap-info-window 
                        @closeclick="window_open=false" 
                        :opened="window_open" 
                        :position="infowindow"
                        :options="{
                          pixelOffset: {
                            width: 0,
                            height: -35
                          }
                        }"
                    >
                        <table>
                            <tr>
                                <td>Geo ID</td>
                                <td>{{ infoData.geoid }}</td>
                            </tr>
                            <tr>
                                <td>COUNTY NAME</td>
                                <td>{{ infoData.countyname }}</td>
                            </tr>
                            <tr>
                                <td>STATE NAME</td>
                                <td>{{ infoData.statename }}</td>
                            </tr>
                            <tr>
                                <td>URBANIZED / TOTAL POPULATION</td>
                                <td>{{ infoData.population }}</td>
                            </tr>
                            <tr>
                                <td>NUMBER OF PEOPLE WITH COLLEGE DEGREE OR HIGHER / TOTAL POPULATION</td>
                                <td>{{ infoData.degree }}</td>
                            </tr>
                            <tr>
                                <td>SINGLE FAMILY UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ infoData.single }}</td>
                            </tr>
                            <tr>
                                <td>2-9 UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ infoData.medium }}</td>
                            </tr>
                            <tr>
                                <td>10 OR MORE UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ infoData.expand }}</td>
                            </tr>
                            <tr>
                                <td>MEDIAN HOUSEHOLD INCOME</td>
                                <td>{{ infoData.income }}</td>
                            </tr>
                        </table>
                    </gmap-info-window>
                </GmapMap>
            </div>

            <!-- right side -->
            <div class="right-side">
                <Detail @detail="detail"></Detail>
                <Chart :data="statisData"></Chart>
            </div>
            <div v-if="loading_flag" class="loading-img">
                <img :src="loading_img" />
                <h4>Now loading data, Just a wait...</h4>
            </div>
        </div>
    </div>
</template>
<script type="module">
import { api } from '../services/api'
import moment from 'moment'

import loader from '../assets/loading.gif'

// import components
import Chart from '../components/Chart'
import Detail from '../components/Detail'
import Topbar from '../components/Topbar'

export default {
    name: 'Home',
    data () {
        return {
            center: { lat:  37.09024, lng: -95.712891 },
            zoom: 4,
            paths: [],
            window_open: false,
            infowindow: null,
            infoData: {
                countyname: '',
                geoid: '',
                statename: '',
                population: '',
                single: '',
                medium: '',
                expand: '',
                income: '',
                degree: ''
            },
            marked: false,
            markedPosition: null,
            title: '',
            visiterIP: '',
            previousIP: '',
            session: 0,
            selectedPolygons: [],
            visit_at: '',
            started: false,
            loading_img: '',
            loading_flag: true,
            statisData: null,
            historyData: null,
            time: ''
        }
    },
    components: {
        Chart,
        Detail,
        Topbar
    },
    created () {
        window.addEventListener('beforeunload', this.confirm_leaving)
        this.loading_img = loader
    },
    async mounted() {
        let details = await api.getAllData()
        this.paths = details.totalPoints
        let data = {}
        data['counts'] = details.counts
        data['history'] = details.visitorData
        this.historyData = data
        this.previousIP = details.counts[0].previous_visitor

        // get ip address
        fetch('https://api.ipify.org?format=json')
            .then(x => x.json())
            .then(({ ip }) => {
                this.visiterIP = ip
        })

        // time session
        var timer = setInterval(() => {
            this.session += 1;
        }, 1000)

        console.log(timer)

        // visit time
        let date = new Date()
        this.visit_at = moment(date).format('YYYY-MM-DD hh:mm:ss a')
        this.started = true
        this.loading_flag = false
    },
    methods: {
        searchArea: function (place) {
            this.center.lat = place.geometry.location.lat()
            this.center.lng = place.geometry.location.lng()
            this.zoom = 8
            this.marked = true
            let data = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }
            this.markedPosition = data
            this.title = place.formatted_address
        },
        confirm_leaving: function (evt) {
            if (this.started) {
                let visitorData = {}
                if (this.statisData === null) {
                    visitorData['IP'] = this.visiterIP
                    visitorData['session'] = this.time
                    visitorData['polygons'] = this.selectedPolygons
                    visitorData['visit_at'] = this.visit_at
                } else {
                    visitorData['IP'] = this.visiterIP
                    visitorData['session'] = this.time
                    visitorData['polygons'] = this.selectedPolygons
                    visitorData['visit_at'] = this.visit_at
                    visitorData['OZ'] = this.statisData.second
                    visitorData['notOZ'] = this.statisData.first
                    visitorData['federal'] = this.statisData.federal
                    visitorData['state'] = this.statisData.state
                    visitorData['paid'] = this.statisData.paid
                    visitorData['sold'] = this.statisData.sold
                    visitorData['rate'] = this.statisData.rate
                    visitorData['period'] = this.statisData.period
                }
                api.saveData(visitorData)
            }
            const unsaved_changes_warning = "You have unsaved changes. Are you sure you wish to leave?";
            evt.returnValue = unsaved_changes_warning; 
            return unsaved_changes_warning;
        },
        useData: function (doc) {
            console.log(doc)
        },
        showDetails: function (detail) {
            this.infowindow = {
                lat: detail.path[0].lat,
                lng: detail.path[0].lng
            }
            this.infoData.countyname = detail.countyname
            this.infoData.geoid = detail.geoid
            this.infoData.statename = detail.statename
            this.infoData.population = detail.population
            this.infoData.single = detail.single
            this.infoData.medium = detail.medium
            this.infoData.expand = detail.expand
            this.infoData.income = detail.income
            this.infoData.degree = detail.degree
            let polygon = {
                countyname: detail.countyname,
                geoid: detail.geoid,
                statename: detail.statename,
                population: detail.population,
                single: detail.single,
                medium: detail.medium,
                expand: detail.expand,
                income: detail.income,
                degree: detail.degree
            }

            this.selectedPolygons.push(polygon)
            this.window_open = true
        },
        detail: function (data) {
            this.statisData = data
        }
    },
    watch: {
        session: function () {
            if (this.session < 60) {
                this.time = this.session + ' S'
            } else if (this.session >= 60 && this.session < 3600) {
                this.time = Math.floor(this.session / 60) + ' M ' + (this.session % 60) + ' S'
            } else {
                this.time = Math.floor(this.session / 3600) + ' H ' + Math.floor((this.session - Math.floor(this.session / 3600) * 3600) / 60) + ' M ' + (this.session % 60) + ' S'
            }
        }
    }
}
</script>