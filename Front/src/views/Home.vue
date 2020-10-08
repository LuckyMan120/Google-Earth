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
                    <div class="img-icon">
                        <img :src="pinkIconImg" />
                        <span>University</span>
                        <span v-if="schoolCount !== 0">{{ schoolCount }}</span>
                    </div>
                    <div class="img-icon">
                        <img :src="blueIconImg" />
                        <span>Company</span>
                        <span v-if="companyCount !== 0">{{ companyCount }}</span>
                    </div>
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

                    <!-- schools and companies pins -->
                    <!-- schools -->
                    <GmapMarker
                        v-for="(bluepin, index) in schoolsData"
                        :key="index"
                        :icon="schoolIcon"
                        :position="getPosition(bluepin)"
                        @click="showPinDetail(bluepin)"
                    />

                    <!-- companies -->
                    <GmapMarker
                        v-for="(pinkpin, index) in companyData"
                        :key="index"
                        :icon="companyIcon"
                        :position="getPosition(pinkpin)"
                        @click="showPinDetail(pinkpin)"
                    />

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
                                <td>County Name</td>
                                <td>{{ firstInfoData.countyname }}</td>
                            </tr>
                            <tr>
                                <td>State Name</td>
                                <td>{{ firstInfoData.statename }}</td>
                            </tr>
                            <tr>
                                <td>Uranized / Total Population</td>
                                <td>{{ firstInfoData.population }}</td>
                            </tr>
                            <tr>
                                <td>Number of pelple with college degree or higher / total population</td>
                                <td>{{ firstInfoData.degree }}</td>
                            </tr>
                            <tr>
                                <td>Single family unit housing structures (%)</td>
                                <td>{{ firstInfoData.single }}</td>
                            </tr>
                            <tr>
                                <td>2-9 Unit housing structures (%)</td>
                                <td>{{ firstInfoData.medium }}</td>
                            </tr>
                            <tr>
                                <td>10 or more unit housing structures (%)</td>
                                <td>{{ firstInfoData.expand }}</td>
                            </tr>
                            <tr>
                                <td>Median household income</td>
                                <td>{{ firstInfoData.income }}</td>
                            </tr>
                            <tr>
                                <td>Number of people aged 25 or older who have a bachelor's degree,<br>master's degree, professional school degree, or doctorate degree, divided by the total number of people aged 25 or older in a tract (%)</td>
                                <td>{{ firstInfoData.degrees }}</td>
                            </tr>
                            <tr>
                                <td>The median gross rent for renter-occupied housing units with two bedrooms that pay cash rent (from the 2011-2015 ACS)</td>
                                <td>{{ firstInfoData.house_count }}</td>
                            </tr>
                            <tr>
                                <td>Average annualized job growth rate over the time period 2004 to 2013 (%)</td>
                                <td>{{ firstInfoData.job_growth_rate }}</td>
                            </tr>
                            <tr>
                                <td>Number of jobs per square mile in each tract</td>
                                <td>{{ firstInfoData.per_square_job }}</td>
                            </tr>
                            <tr>
                                <td>Number of residents per square mile</td>
                                <td>{{ firstInfoData.residents_count }}</td>
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
                                <td>County Name</td>
                                <td>{{ secondInfoData.countyname }}</td>
                            </tr>
                            <tr>
                                <td>State Name</td>
                                <td>{{ secondInfoData.statename }}</td>
                            </tr>
                            <tr>
                                <td>Uranized / Total Population</td>
                                <td>{{ secondInfoData.population }}</td>
                            </tr>
                            <tr>
                                <td>Number of pelple with college degree or higher / total population</td>
                                <td>{{ secondInfoData.degree }}</td>
                            </tr>
                            <tr>
                                <td>Single family unit housing structures (%)</td>
                                <td>{{ secondInfoData.single }}</td>
                            </tr>
                            <tr>
                                <td>2-9 Unit housing structures (%)</td>
                                <td>{{ secondInfoData.medium }}</td>
                            </tr>
                            <tr>
                                <td>10 or more unit housing structures (%)</td>
                                <td>{{ secondInfoData.expand }}</td>
                            </tr>
                            <tr>
                                <td>Median household income</td>
                                <td>{{ secondInfoData.income }}</td>
                            </tr>
                            <tr>
                                <td>Number of people aged 25 or older who have a bachelor's degree,<br>master's degree, professional school degree, or doctorate degree, divided by the total number of people aged 25 or older in a tract (%)</td>
                                <td>{{ secondInfoData.degrees }}</td>
                            </tr>
                            <tr>
                                <td>The median gross rent for renter-occupied housing units with two bedrooms that pay cash rent (from the 2011-2015 ACS)</td>
                                <td>{{ secondInfoData.house_count }}</td>
                            </tr>
                            <tr>
                                <td>Average annualized job growth rate over the time period 2004 to 2013 (%)</td>
                                <td>{{ secondInfoData.job_growth_rate }}</td>
                            </tr>
                            <tr>
                                <td>Number of jobs per square mile in each tract</td>
                                <td>{{ secondInfoData.per_square_job }}</td>
                            </tr>
                            <tr>
                                <td>Number of residents per square mile</td>
                                <td>{{ secondInfoData.residents_count }}</td>
                            </tr>
                        </table>
                    </gmap-info-window>

                    <!-- school pin infowindow -->
                    <gmap-info-window 
                        @closeclick="open_school_pin=false" 
                        :opened="open_school_pin" 
                        :position="school_pin_latlng"
                        :options="{
                          pixelOffset: {
                            width: 0,
                            height: -35
                          }
                        }"
                    >
                        <table>
                            <tr>
                                <td>School Name</td>
                                <td>{{ schoolPinData.name }}</td>
                            </tr>
                            <tr>
                                <td>Student Population</td>
                                <td>{{ schoolPinData.population }}</td>
                            </tr>
                        </table>
                    </gmap-info-window>

                    <!-- company pin infowindow -->
                    <gmap-info-window 
                        @closeclick="open_company_pin=false" 
                        :opened="open_company_pin" 
                        :position="company_pin_latlng"
                        :options="{
                          pixelOffset: {
                            width: 0,
                            height: -35
                          }
                        }"
                    >
                        <table>
                            <tr>
                                <td>Title</td>
                                <td>{{ companyPinData.title }}</td>
                            </tr>
                            <tr>
                                <td>Rank</td>
                                <td>{{ companyPinData.rank }}</td>
                            </tr>
                            <tr>
                                <td>Employees</td>
                                <td>{{ companyPinData.employers }}</td>
                            </tr>
                            <tr>
                                <td>Sector</td>
                                <td>{{ companyPinData.sector }}</td>
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

// import jsons and files
import schoolsJson from '../jsons/schools.json'
import companyJson from '../jsons/company.json'
import loader from '../assets/loading.gif'
import pinkIcon from '../assets/pink.png'
import blueIcon from '../assets/blue.png'

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
                degree: '',
                degrees: '',
                residents_count: '',
                job_growth_rate: '',
                per_square_job: '',
                house_count: ''
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
                degree: '',
                degrees: '',
                residents_count: '',
                job_growth_rate: '',
                per_square_job: '',
                house_count: ''
            },
            schoolPinData: {
                name: '',
                population: ''
            },
            companyPinData: {
                title: '',
                rank: '',
                employers: '',
                sector: ''
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
            taxData: [],
            businessData: [],
            historyData: null,
            time: '',
            selectState: null,
            selectedStatePath: null,
            schoolsData: null,
            companyData: null,
            schoolStaticData: null,
            companyStaticData: null,
            open_school_pin: false,
            open_company_pin: false,
            school_pin_latlng: null,
            company_pin_latlng: null,
            schoolIcon: {
                scaledSize: { width: 10, height: 10 },
                url: pinkIcon
            },
            companyIcon: {
                scaledSize: { width: 10, height: 10 },
                url: blueIcon
            },
            pinkIconImg: pinkIcon,
            blueIconImg: blueIcon,
            schoolCount: 0,
            companyCount: 0,
            selectedSchools: [],
            selectedCompanies: []
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
        console.log('details', details)
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
                        if (each.length > 2) {
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
                    if (each.length > 2) {
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
                if (e.length > 2) {
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
        this.schoolStaticData = schoolsJson[0].schools
        this.companyStaticData = companyJson[0].company
        this.loading_flag = false
    },
    methods: {
        searchArea: async function (place) {
            this.marked = false
            this.window_open_second = false
            this.window_open_first = false
            this.open_school_pin = false
            this.open_company_pin = false
            this.loading_flag = true
            this.paths = null
            this.selectedStatePath = null
            this.zoom = 4
            this.center = {
                lat:  37.09024,
                lng: -95.712891
            }

            let nameIndex = 0
            // get name index for searching polygons from DB
            place.address_components.forEach((item, index) => {
                if (item['long_name'] === "United States") {
                    nameIndex = index - 1
                }
            })

            let searchData = {}
            // get name for search
            searchData['name'] = place.address_components[nameIndex].long_name
            let polygons = await api.searchPolygon(searchData)
            this.paths = polygons

            // get border of searched state
            this.selectState.forEach(async item => {
                if (item.name === place.address_components[nameIndex].long_name) {
                    this.selectedStatePath = item.path
                }
            })

            this.center.lat = place.geometry.location.lat()
            this.center.lng = place.geometry.location.lng()
            this.zoom = 6
            this.marked = true
            let data = {
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
            }
            this.markedPosition = data
            this.title = place.formatted_address
            this.loading_flag = false
        },
        confirm_leaving: function (evt) {
            if (this.started) {
                let visitorData = {}
                
                visitorData['IP'] = this.visiterIP
                visitorData['session'] = this.time
                visitorData['visit_at'] = this.visit_at
                visitorData['polygons'] = this.selectedPolygons
                visitorData['taxInfo'] = this.taxData
                visitorData['businessInfo'] = this.businessData
                visitorData['schools'] = this.selectedSchools
                visitorData['companies'] = this.selectedCompanies
                
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
            console.log('detail', detail)
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
                this.firstInfoData.degrees = parseFloat(detail.degrees * 100).toFixed(2)
                this.firstInfoData.residents_count = parseFloat(detail.residents_count).toFixed()
                this.firstInfoData.job_growth_rate = parseFloat(detail.job_growth_rate * 100).toFixed(2)
                this.firstInfoData.per_square_job = parseFloat(detail.per_square_job).toFixed()
                this.firstInfoData.house_count = detail.house_count
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
                this.firstInfoData.degrees = parseFloat(detail.degrees * 100).toFixed(2)
                this.firstInfoData.residents_count = parseFloat(detail.residents_count).toFixed()
                this.firstInfoData.job_growth_rate = parseFloat(detail.job_growth_rate * 100).toFixed(2)
                this.firstInfoData.per_square_job = parseFloat(detail.per_square_job).toFixed()
                this.firstInfoData.house_count = detail.house_count
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
                this.secondInfoData.degrees = parseFloat(detail.degrees * 100).toFixed(2)
                this.secondInfoData.residents_count = parseFloat(detail.residents_count).toFixed()
                this.secondInfoData.job_growth_rate = parseFloat(detail.job_growth_rate * 100).toFixed(2)
                this.secondInfoData.per_square_job = parseFloat(detail.per_square_job).toFixed()
                this.secondInfoData.house_count = detail.house_count
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
                this.secondInfoData.degrees = parseFloat(detail.degrees * 100).toFixed(2)
                this.secondInfoData.residents_count = parseFloat(detail.residents_count).toFixed()
                this.secondInfoData.job_growth_rate = parseFloat(detail.job_growth_rate * 100).toFixed(2)
                this.secondInfoData.per_square_job = parseFloat(detail.per_square_job).toFixed()
                this.secondInfoData.house_count = detail.house_count
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
                degree: detail.degree,
                degrees: parseFloat(detail.degrees * 100).toFixed(2),
                residents_count: parseFloat(detail.residents_count).toFixed(),
                job_growth_rate: parseFloat(detail.job_growth_rate * 100).toFixed(2),
                per_square_job: parseFloat(detail.per_square_job).toFixed(),
                house_count: detail.house_count
            }

            this.selectedPolygons.push(polygon)
        },
        detail: function (data) {
            if (data.status === 'first') {
                let tax = {
                    paid: data.paid,
                    sold: data.sold,
                    rate: data.rate,
                    period: data.period,
                    OZ: data.second,
                    notOZ: data.first,
                    federal: data.federal
                }

                this.taxData.push(tax)
            } else {
                let business = {
                    initial: data.initial,
                    cash: data.cash,
                    rate: data.rate,
                    sales: data.sales,
                    OZ: data.second,
                    notOZ: data.first,
                    federal: data.federal
                }

                this.businessData.push(business)
            }
            this.statisData = data
        },
        searchState: function (event) {
            this.marked = false
            this.window_open_second = false
            this.window_open_first = false
            this.open_school_pin = false
            this.open_company_pin = false
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
                    data['name'] = item.name
                    console.log(data)
                    let polygons = await api.searchPolygon(data)
                    console.log(polygons.length)
                    polygons.forEach(poly => {
                        console.log(typeof poly)
                    })
                    this.paths = polygons
                    this.center = item.center
                    this.zoom = 6
                    this.selectedStatePath = item.path
                    this.loading_flag = false
                }
            })
        },
        getPosition: function (pin) {
            return {
                lat: pin.Latitude,
                lng: pin.Longitude
            }
        },
        showPinDetail: function (pin) {
            if (Object.keys(pin).length === 5) { // school pin
                let data = {
                    lat: pin.Latitude,
                    lng: pin.Longitude
                }
                this.school_pin_latlng = data
                this.schoolPinData.name = pin['School Name']
                this.schoolPinData.population = pin['Student Population']

                let schoolPin = {
                    name: pin['School Name'],
                    population: pin['Student Population']
                }

                this.selectedSchools.push(schoolPin)
                this.open_school_pin = true
            } else { // company pin
                let data = {
                    lat: pin.Latitude,
                    lng: pin.Longitude
                }
                this.company_pin_latlng = data
                this.companyPinData.title = pin['Title']
                this.companyPinData.rank = pin['Rank']
                this.companyPinData.employers = pin['Employees']
                this.companyPinData.sector = pin['Sector']

                let companyPin = {
                    title: pin['Title'],
                    rank: pin['Rank'],
                    employees: pin['Employees'],
                    sector: pin['Sector']
                }

                this.selectedCompanies.push(companyPin)
                this.open_company_pin = true
            }
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
        },
        statisData: function () {
            if (this.statisData.status === 'second') {
                // search company
                let companies = []
                this.companyStaticData.forEach(company => {
                    if (company.State === this.statisData.state && company.Sector === this.statisData.sector) {
                        companies.push(company)
                    }
                })

                // search schools
                let schools = []
                this.schoolStaticData.forEach(school => {
                    if (school.State === this.statisData.state) {
                        schools.push(school)
                    }
                })

                this.companyData = companies
                this.schoolsData = schools
                this.schoolCount = this.schoolsData.length
                this.companyCount = this.companyData.length
            }
        }
    }
}
</script>