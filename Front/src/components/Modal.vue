<template>
    <div v-show="showFlag" class="detail-modal lg-detail-modal md-detail-modal">
        <div class="left-side">
            <div>
                <span @click="showAll(true)" :style="showHistory ? 'background: #cdd3d1' : ''">All Counts</span>
                <span @click="showAll(false)" :style="!showHistory ? 'background: #cdd3d1' : ''">All Visitors</span>
            </div>
            <div class="drop-down-menu">
                <!-- drop down items -->
                <dropdown-menu>
                    <button slot="trigger">Download fields</button>
                    <ul slot="body">
                        <li v-for="(item, index) in itemJson" :key="index">
                            <downloadexcel
                                :data="chooseData(item.item)"
                                :fields="chooseField(item.item)"
                                worksheet="My Worksheet"
                                type="csv"
                                :before-generate="startDownload"
                                name="data.xls">
                                <span>{{ item.item }}</span>
                            </downloadexcel>
                        </li>
                    </ul>
                </dropdown-menu>
                <v-icon icon="times-circle" class="v-icon-times" @click="closeModal" />
            </div>
        </div>

        <!-- right history section -->
        <div class="detail-side">
            <div v-if="showHistory" class="count-side">
                <v-icon icon="users" class="v-icon-count" />
                <span>All Visitors</span>
                <span>{{ visitors }}</span>
                <v-icon icon="tv" class="v-icon-count" />
                <span>Total Displays</span>
                <span>{{ displays }}</span>
            </div>
            <div v-else class="history-detail">
                <!-- visitor IP address -->
                <div class="col-4">
                    <span>IP address<v-icon icon="user" class="v-icon-detail" /></span>
                    <div class="left-detail-section lg-detail-section md-detail-section">
                        <p
                            class="ip-btn"
                            :style="(ip === selectedIp) ? 'background: #cdd3d1' : ''"
                            v-for="(ip, index) in modalData.counts[0].IPs"
                            :key="index"
                            @click="showDetail(ip)"
                        >
                            {{ ip }}
                        </p>
                    </div>
                </div>
                <!-- visited times -->
                <div class="col-8">
                    <span>Visited Time<v-icon icon="clock" class="v-icon-detail" /></span>
                    <div class="right-detail-section lg-detail-section md-detail-section">
                        <div v-for="(item, index) in details" :key="index">
                            <p
                                class="ip-btn"
                                :style="(item.visited_at === selectedAt) ? 'background: #cdd3d1' : ''"
                                @click="showTime(item)"
                            >
                                {{ item.visited_at }}
                            </p>
                            <div v-show="item.visited_at === selectedAt">
                                <p>Session<v-icon icon="clock" class="v-icon-p" />:&nbsp;{{ item.session }}</p>
                                
                                <!-- polygons -->
                                <p>Polygons<v-icon icon="draw-polygon" class="v-icon-p" />:&nbsp;</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>GeoId</th>
                                            <th>County Name</th>
                                            <th>State Name</th>
                                            <th>Degree</th>
                                            <th>Single (%)</th>
                                            <th>2 ~ 9 (%)</th>
                                            <th>10 More (%)</th>
                                            <th>Income</th>
                                            <th>Population</th>
                                            <th>Degrees (%)</th>
                                            <th>Housing Unit</th>
                                            <th>Job Growth (%)</th>
                                            <th>Per square mile Job</th>
                                            <th>Number of residents</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="item.polygons.length !== 0">
                                        <tr v-for="(polygon, index) in item.polygons" :key="index">
                                            <td>{{ polygon.geoid }}</td>
                                            <td>{{ polygon.countyname }}</td>
                                            <td>{{ polygon.statename }}</td>
                                            <td>{{ polygon.degree }}</td>
                                            <td>{{ polygon.single }}</td>
                                            <td>{{ polygon.medium }}</td>
                                            <td>{{ polygon.expand }}</td>
                                            <td>{{ polygon.income }}</td>
                                            <td>{{ polygon.population }}</td>
                                            <td>{{ polygon.degrees }}</td>
                                            <td>{{ polygon.house_count }}</td>
                                            <td>{{ polygon.job_growth_rate }}</td>
                                            <td>{{ polygon.per_square_job }}</td>
                                            <td>{{ polygon.residents_count }}</td>
                                        </tr>
                                    </tbody>
                                    <tbody v-else>
                                        <tr>
                                            <td colspan="14">Never Selected</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- tax -->
                                <p>Tax Info<v-icon icon="dollar-sign" class="v-icon-p" />:&nbsp;</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Paid price</th>
                                            <th>Sold price</th>
                                            <th>Growth rate (%)</th>
                                            <th>Holding period</th>
                                            <th>OZ</th>
                                            <th>Without OZ</th>
                                            <th>Federal</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="item.taxInfo.length !== 0">
                                        <tr v-for="(tax, index) in item.taxInfo" :key="index">
                                            <td>{{ tax.paid }}</td>
                                            <td>{{ tax.sold }}</td>
                                            <td>{{ tax.rate }}</td>
                                            <td>{{ tax.period }}</td>
                                            <td>{{ tax.OZ }}</td>
                                            <td>{{ tax.notOZ }}</td>
                                            <td>{{ tax.federal }}</td>
                                        </tr>
                                    </tbody>
                                    <tbody v-else>
                                        <tr>
                                            <td colspan="7">Never Selected</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- business -->
                                <p>Business Info<v-icon icon="business-time" class="v-icon-p" />:&nbsp;</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Initial</th>
                                            <th>Cash invested</th>
                                            <th>Sales price</th>
                                            <th>OZ</th>
                                            <th>Without OZ</th>
                                            <th>Federal</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="item.businessInfo.length !== 0">
                                        <tr v-for="(business, index) in item.businessInfo" :key="index">
                                            <td>{{ business.initial }}</td>
                                            <td>{{ business.cash }}</td>
                                            <td>{{ business.sales }}</td>
                                            <td>{{ business.OZ }}</td>
                                            <td>{{ business.notOZ }}</td>
                                            <td>{{ business.federal }}</td>
                                        </tr>
                                    </tbody>
                                    <tbody v-else>
                                        <tr>
                                            <td colspan="6">Never Selected</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- university -->
                                <p>University<v-icon icon="university" class="v-icon-p" />:&nbsp;</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>University name</th>
                                            <th>Population</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="item.schoolPins.length !== 0">
                                        <tr v-for="(university, index) in item.schoolPins" :key="index">
                                            <td>{{ university.name }}</td>
                                            <td>{{ university.population }}</td>
                                        </tr>
                                    </tbody>
                                    <tbody v-else>
                                        <tr>
                                            <td colspan="2">Never Selected</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <!-- company -->
                                <p>Company<v-icon icon="building" class="v-icon-p" />:&nbsp;</p>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Title</th>
                                            <th>Sector</th>
                                            <th>Rank</th>
                                            <th>Employees</th>
                                        </tr>
                                    </thead>
                                    <tbody v-if="item.companyPins.length !== 0">
                                        <tr v-for="(company, index) in item.companyPins" :key="index">
                                            <td>{{ company.title }}</td>
                                            <td>{{ company.sector }}</td>
                                            <td>{{ company.rank }}</td>
                                            <td>{{ company.employees }}</td>
                                        </tr>
                                    </tbody>
                                    <tbody v-else>
                                        <tr>
                                            <td colspan="4">Never Selected</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapActions } from 'vuex'
import DropdownMenu from 'v-dropdown-menu'
import downloadexcel from "vue-json-excel"
import itemJson from '../jsons/item.json'

export default {
    name: 'Modal',
    data () {
        return {
            showHistory: true,
            visitors: 0,
            displays: 0,
            details: null,
            selectedIp: '',
            selectedAt: '',
            itemJson: null,
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
    props: {
        showFlag: {
            type: Boolean,
            required: false,
            default: false
        },
        modalData: {
            type: Object,
            required: false,
            default: null
        }
    },
    components: {
        DropdownMenu,
        downloadexcel
    },
    methods: {
        ...mapActions({
            setFlag: 'reverse/setOpened'
        }),
        chooseData: function (field) {
            if (this.modalData !== null) {
                switch (field) {
                    case 'polygons': {
                        let data1 = []
                        this.modalData.history.forEach(item => {
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
                                    data1.push(eachData)
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
                                data1.push(eachData)
                            }
                        })

                        return data1;
                    }
                    case 'tax': {
                        let data2 = []
                        this.modalData.history.forEach(item => {
                            if (item.taxInfo.length !== 0) {
                                item.taxInfo.forEach(poly => {
                                    let eachData = {
                                        ip: item.IP_address,
                                        time: item.visited_at,
                                        session: item.session,
                                        paid: poly.paid,
                                        period: poly.period,
                                        rate: poly.rate,
                                        sold: poly.sold,
                                        OZ: poly.OZ,
                                        notOZ: poly.notOZ,
                                        federal: poly.federal
                                    }
                                    data2.push(eachData)
                                })
                            } else {
                                let eachData = {
                                    ip: item.IP_address,
                                    time: item.visited_at,
                                    session: item.session,
                                    paid: 'Never selected',
                                    period: 'Never selected',
                                    rate: 'Never selected',
                                    sold: 'Never selected',
                                    OZ: 'Never selected',
                                    notOZ: 'Never selected',
                                    federal: 'Never selected'
                                }
                                data2.push(eachData)
                            }
                        })

                        return data2;
                    }
                    case 'business': {
                        let data3 = []
                        this.modalData.history.forEach(item => {
                            if (item.businessInfo.length !== 0) {
                                item.businessInfo.forEach(poly => {
                                    let eachData = {
                                        ip: item.IP_address,
                                        time: item.visited_at,
                                        session: item.session,
                                        OZ: poly.OZ,
                                        cash: poly.cash,
                                        federal: poly.federal,
                                        initial: poly.initial,
                                        notOZ: poly.notOZ,
                                        sales: poly.sales
                                    }
                                    data3.push(eachData)
                                })
                            } else {
                                let eachData = {
                                    ip: item.IP_address,
                                    time: item.visited_at,
                                    session: item.session,
                                    OZ: 'Never selected',
                                    cash: 'Never selected',
                                    federal: 'Never selected',
                                    initial: 'Never selected',
                                    notOZ: 'Never selected',
                                    sales: 'Never selected'
                                }
                                data3.push(eachData)
                            }
                        })

                        return data3;
                    }
                    case 'university': {
                        let data4 = []
                        this.modalData.history.forEach(item => {
                            if (item.schoolPins.length !== 0) {
                                item.schoolPins.forEach(poly => {
                                    let eachData = {
                                        ip: item.IP_address,
                                        time: item.visited_at,
                                        session: item.session,
                                        name: poly.name,
                                        population: poly.population
                                    }
                                    data4.push(eachData)
                                })
                            } else {
                                let eachData = {
                                    ip: item.IP_address,
                                    time: item.visited_at,
                                    session: item.session,
                                    name: 'Never selected',
                                    population: 'Never selected'
                                }
                                data4.push(eachData)
                            }
                        })

                        return data4;
                    }
                    case 'company': {
                        let data5 = []
                        this.modalData.history.forEach(item => {
                            if (item.companyPins.length !== 0) {
                                item.companyPins.forEach(poly => {
                                    let eachData = {
                                        ip: item.IP_address,
                                        time: item.visited_at,
                                        session: item.session,
                                        employees: poly.employees,
                                        rank: poly.rank,
                                        sector: poly.sector,
                                        title: poly.title
                                    }
                                    data5.push(eachData)
                                })
                            } else {
                                let eachData = {
                                    ip: item.IP_address,
                                    time: item.visited_at,
                                    session: item.session,
                                    employees: 'Never selected',
                                    rank: 'Never selected',
                                    sector: 'Never selected',
                                    title: 'Never selected'
                                }
                                data5.push(eachData)
                            }
                        })

                        return data5;
                    }
                    default:
                        break;
                }
            }
        },
        chooseField: function (field) {
            if (this.modalData !== null) {
                switch (field) {
                    case 'polygons': {
                        let data1 = {
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
                        }

                        return data1
                    }
                    case 'tax': {
                        let data2 = {
                            "IP Address": "ip",
                            "Visited Time": "time",
                            "Session": "session",
                            "Paid Price": "paid",
                            "Sold Price": "sold",
                            "Growth Rate": "rate",
                            "Holding Period": "period",
                            "OZ": "OZ",
                            "Without OZ": "notOZ",
                            "Federal": "federal"
                        }
                        
                        return data2
                    }
                    case 'business': {
                        let data3 = {
                            "IP Address": "ip",
                            "Visited Time": "time",
                            "Session": "session",
                            "Initial": "initial",
                            "Cash Invested": "cash",
                            "OZ": "OZ",
                            "Without OZ": "notOZ",
                            "Federal": "federal",
                            "Sales Price": "sales"
                        }
                        
                        return data3
                    }
                    case 'university': {
                        let data4 = {
                            "IP Address": "ip",
                            "Visited Time": "time",
                            "Session": "session",
                            "University Name": "name",
                            "Population": "population"
                        }

                        return data4
                    }
                    case 'company': {
                        let data5 = {
                            "IP Address": "ip",
                            "Visited Time": "time",
                            "Session": "session",
                            "Title": "title",
                            "Sector": "sector",
                            "Rank": "rank",
                            "Employees": "employees"
                        }

                        return data5
                    }
                    default:
                        break;
                }
            }
        },
        showAll: function (flag) {
            this.showHistory = flag
        },
        closeModal: function () {
            this.$emit('closeModal', false)
            this.setFlag(false)
        },
        showDetail: function (ip) {
            this.selectedIp = ip
            let detail = []
            this.modalData.history.forEach(item => {
                if (item.IP_address === ip) {
                    detail.push(item)
                }
            })

            this.details = detail
        },
        showTime: function (detail) {
            if (detail.visited_at === this.selectedAt) {
                this.selectedAt = ''
            } else {
               this.selectedAt = detail.visited_at
            }
        },
        startDownload: function () {
            window.alert('Start Downloading');
        }
    },
    async mounted () {
        this.itemJson = itemJson.items
    },
    watch: {
        modalData: function () {
            console.log('watch', this.modalData)
            this.displays = this.modalData.counts[0].display_count
            this.visitors = this.modalData.counts[0].visitor_count
        }
    }
}
</script>