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
                <!-- select state area -->
                <div class="select-state-area">
                    <span>Select State</span>
                    <select class="select-state" @change="searchState($event)">
                        <option>Select State</option>
                        <option
                            v-for="(state, num) in selectState"
                            :key="num"
                            :value="state.name"
                        >
                            {{ state.name }}
                        </option>
                    </select>
                </div>
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
                    <gmap-polyline
                        v-for="(path, index) in selectedStatePath"
                        :key="index"
                        v-bind:path.sync="path"
                        v-bind:options="{ 
                            strokeColor:'#d45fa0',
                            strokeOpacity: 0.5,
                            clickable: true
                        }"
                        >
                    </gmap-polyline>
                    <gmap-polygon
                        v-for="(polygon, count) in paths"
                        :key="count"
                        v-bind:path.sync="polygon.path"
                        v-bind:options="{ 
                            strokeColor:'#008000',
                            clickable: true
                        }"
                        @click="showDetails(polygon)"
                        >
                    </gmap-polygon>

                    <GmapMarker v-if="marked" :position="markedPosition" :label="title" />
                    <!-- first infowindow -->
                    <gmap-info-window 
                        @closeclick="window_open_first=false" 
                        :opened="window_open_first" 
                        :position="firstInfowindow"
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
                                <td>{{ firstInfoData.geoid }}</td>
                            </tr>
                            <tr>
                                <td>COUNTY NAME</td>
                                <td>{{ firstInfoData.countyname }}</td>
                            </tr>
                            <tr>
                                <td>STATE NAME</td>
                                <td>{{ firstInfoData.statename }}</td>
                            </tr>
                            <tr>
                                <td>URBANIZED / TOTAL POPULATION</td>
                                <td>{{ firstInfoData.population }}</td>
                            </tr>
                            <tr>
                                <td>NUMBER OF PEOPLE WITH COLLEGE DEGREE OR HIGHER / TOTAL POPULATION</td>
                                <td>{{ firstInfoData.degree }}</td>
                            </tr>
                            <tr>
                                <td>SINGLE FAMILY UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ firstInfoData.single }}</td>
                            </tr>
                            <tr>
                                <td>2-9 UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ firstInfoData.medium }}</td>
                            </tr>
                            <tr>
                                <td>10 OR MORE UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ firstInfoData.expand }}</td>
                            </tr>
                            <tr>
                                <td>MEDIAN HOUSEHOLD INCOME</td>
                                <td>{{ firstInfoData.income }}</td>
                            </tr>
                        </table>
                    </gmap-info-window>

                    <!-- second infowindow -->
                    <gmap-info-window 
                        @closeclick="window_open_second=false" 
                        :opened="window_open_second" 
                        :position="secondInfowindow"
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
                                <td>{{ secondInfoData.geoid }}</td>
                            </tr>
                            <tr>
                                <td>COUNTY NAME</td>
                                <td>{{ secondInfoData.countyname }}</td>
                            </tr>
                            <tr>
                                <td>STATE NAME</td>
                                <td>{{ secondInfoData.statename }}</td>
                            </tr>
                            <tr>
                                <td>URBANIZED / TOTAL POPULATION</td>
                                <td>{{ secondInfoData.population }}</td>
                            </tr>
                            <tr>
                                <td>NUMBER OF PEOPLE WITH COLLEGE DEGREE OR HIGHER / TOTAL POPULATION</td>
                                <td>{{ secondInfoData.degree }}</td>
                            </tr>
                            <tr>
                                <td>SINGLE FAMILY UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ secondInfoData.single }}</td>
                            </tr>
                            <tr>
                                <td>2-9 UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ secondInfoData.medium }}</td>
                            </tr>
                            <tr>
                                <td>10 OR MORE UNIT HOUSING STRUCTURES (%)</td>
                                <td>{{ secondInfoData.expand }}</td>
                            </tr>
                            <tr>
                                <td>MEDIAN HOUSEHOLD INCOME</td>
                                <td>{{ secondInfoData.income }}</td>
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
            paths: null,
            window_open_first: false,
            window_open_second: false,
            firstInfowindow: null,
            secondInfowindow: null,
            firstInfoData: {
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
            secondInfoData: {
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
            time: '',
            selectState: null,
            selectedStatePath: null
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
        let data = {}
        data['counts'] = details.counts
        data['history'] = details.visitorData
        this.historyData = data
        this.previousIP = details.counts[0].previous_visitor

        // get select state of the USA
        let stateDetails = []
        details.state.kml.Document.Placemark.forEach(item => {
            let eachStateDetail = {}
            if (Object.keys(item.MultiGeometry)[1] === "MultiGeometry") {
                let eachState = []
                item.MultiGeometry.MultiGeometry.Polygon.forEach(pol => {
                    let eachPol = []
                    let polys = pol.outerBoundaryIs.LinearRing.coordinates._text

                    var coordinates = polys.split(" ");
                    coordinates.forEach(each => {
                        if (each.length > 1) {
                            var coordinate = each.split(",");
                            var pointPolys = {
                                lat: parseFloat(coordinate[1]),
                                lng: parseFloat(coordinate[0])
                            };
                            eachPol.push(pointPolys);
                        }
                    });
                    eachState.push(eachPol)
                });
                eachStateDetail['path'] = eachState
            } else {
                    let eachState = []
                    let polys = item.MultiGeometry.Polygon.outerBoundaryIs.LinearRing.coordinates._text
                    let eachPol = []

                    var coordinates = polys.split(" ");
                    coordinates.forEach(each => {
                        if (each.length > 1) {
                            var coordinate = each.split(",");
                            var pointPolys = {
                                lat: parseFloat(coordinate[1]),
                                lng: parseFloat(coordinate[0])
                            };
                            eachPol.push(pointPolys);
                        }
                    });
                    eachState.push(eachPol)
                    eachStateDetail['path'] = eachState
            }
            
            var point = item.MultiGeometry.Point.coordinates._text.split(" ")
            point.forEach(e => {
                if (e.length > 1) {
                    var coord = e.split(",");
                    var markedPoint = {
                        lat: parseFloat(coord[1]),
                        lng: parseFloat(coord[0])
                    };
                    eachStateDetail['center'] = markedPoint
                }
            });

            if (item.name._cdata.split(" ").length > 2) {
                eachStateDetail['name'] = item.name._cdata.split(" ")[0] + " " + item.name._cdata.split(" ")[1]
            } else {
                eachStateDetail['name'] = item.name._cdata.split(" ")[0]
            }

            stateDetails.push(eachStateDetail)
        });
        this.selectState = stateDetails

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
            if (!this.window_open_first && !this.window_open_second) {
                this.firstInfowindow = {
                    lat: detail.path[0].lat,
                    lng: detail.path[0].lng
                }
                this.firstInfoData.countyname = detail.countyname
                this.firstInfoData.geoid = detail.geoid
                this.firstInfoData.statename = detail.statename
                this.firstInfoData.population = detail.population
                this.firstInfoData.single = detail.single
                this.firstInfoData.medium = detail.medium
                this.firstInfoData.expand = detail.expand
                this.firstInfoData.income = detail.income
                this.firstInfoData.degree = detail.degree
                this.window_open_first = true
            } else if (!this.window_open_first && this.window_open_second) {
                this.firstInfowindow = {
                    lat: detail.path[0].lat,
                    lng: detail.path[0].lng
                }
                this.firstInfoData.countyname = detail.countyname
                this.firstInfoData.geoid = detail.geoid
                this.firstInfoData.statename = detail.statename
                this.firstInfoData.population = detail.population
                this.firstInfoData.single = detail.single
                this.firstInfoData.medium = detail.medium
                this.firstInfoData.expand = detail.expand
                this.firstInfoData.income = detail.income
                this.firstInfoData.degree = detail.degree
                this.window_open_first = true
            } else if (this.window_open_first && !this.window_open_second) {
                this.secondInfowindow = {
                    lat: detail.path[0].lat,
                    lng: detail.path[0].lng
                }
                this.secondInfoData.countyname = detail.countyname
                this.secondInfoData.geoid = detail.geoid
                this.secondInfoData.statename = detail.statename
                this.secondInfoData.population = detail.population
                this.secondInfoData.single = detail.single
                this.secondInfoData.medium = detail.medium
                this.secondInfoData.expand = detail.expand
                this.secondInfoData.income = detail.income
                this.secondInfoData.degree = detail.degree
                this.window_open_second = true
            } else if (this.window_open_second && this.window_open_first) {
                this.secondInfowindow = {
                    lat: detail.path[0].lat,
                    lng: detail.path[0].lng
                }
                this.secondInfoData.countyname = detail.countyname
                this.secondInfoData.geoid = detail.geoid
                this.secondInfoData.statename = detail.statename
                this.secondInfoData.population = detail.population
                this.secondInfoData.single = detail.single
                this.secondInfoData.medium = detail.medium
                this.secondInfoData.expand = detail.expand
                this.secondInfoData.income = detail.income
                this.secondInfoData.degree = detail.degree
                this.window_open_second = true
            }
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
        },
        detail: function (data) {
            this.statisData = data
        },
        searchState: function (event) {
            this.loading_flag = true
            this.paths = null
            this.selectedStatePath = null
            this.zoom = 4
            this.center = {
                lat:  37.09024,
                lng: -95.712891
            }
            this.selectState.forEach(async item => {
                if (item.name === event.target.value) {
                    let data = {}
                    data['latlng'] = item.center
                    data['name'] = item.name
                    let polygons = await api.searchPolygon(data)
                    this.paths = polygons
                    this.zoom = 6
                    this.selectedStatePath = item.path
                    this.center = item.center
                    this.loading_flag = false
                }
            })
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