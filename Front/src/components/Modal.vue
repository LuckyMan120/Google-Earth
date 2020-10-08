<template>
    <div v-show="showFlag" class="detail-modal lg-detail-modal md-detail-modal">
        <div class="left-side">
            <div>
                <span @click="showAll(true)" :style="showHistory ? 'background: #cdd3d1' : ''">All Counts</span>
                <span @click="showAll(false)" :style="!showHistory ? 'background: #cdd3d1' : ''">All Visitors</span>
            </div>
            <v-icon icon="times-circle" class="v-icon-times" @click="closeModal" />
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
                            v-for="(ip, index) in data.counts[0].IPs"
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
export default {
    name: 'Modal',
    data () {
        return {
            showHistory: true,
            visitors: 0,
            displays: 0,
            details: null,
            selectedIp: '',
            selectedAt: ''
        }
    },
    props: {
        showFlag: {
            type: Boolean,
            required: false,
            default: false
        },
        data: {
            type: Object,
            required: false,
            default: null
        }
    },
    methods: {
        ...mapActions({
            setFlag: 'reverse/setOpened'
        }),
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
            this.data.history.forEach(item => {
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
        }
    },
    watch: {
        data: function () {
            this.visitors = this.data.counts[0].visitor_count
            this.displays = this.data.counts[0].display_count
        }
    }
}
</script>