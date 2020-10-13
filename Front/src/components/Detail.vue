<template>
	<div class="details">
		<!-- switch button for first and second calculators -->
		<SwitchBtn @toggle="toggleBtn" />
		<!-- first calculator -->
		<div v-if="toggleFlag">
			<div class="rate-price">
				<div class="rate-price" style="width: 70%">
					<p>Price at which you paid for your asset</p>
					<p>$</p>
				</div>
				<input type="number" pattern="^\$\d{1,3}(,\d{3})*(\.\d+)?$" data-type="currency" min="0" v-model="B1" placeholder="price" />
			</div>
			<div class="rate-price">
				<div class="rate-price" style="width: 70%">
					<p>Price at which you sold your asset</p>
					<p>$</p>
				</div>
				<input type="number" min="0" v-model="B2" placeholder="price" />
			</div>
			<div class="rate-price">
				<p>Your assumed rate of growth (%)</p>
				<input type="number" min="0" max="100" v-model="B3" placeholder="rate" />
			</div>
			<div class="rate-price">
				<p>Holding Period (Years)</p>
				<input type="number" min="10" max="20" v-model="B4" placeholder="period" />
			</div>
		</div>

		<!-- second calculator -->
		<div v-else>
			<div class="rate-price">
				<p>Initial value of the business</p>
				<input type="number" v-model="A1" placeholder="Initial value" />
			</div>
			<div class="rate-price">
				<p>Cash invested in business</p>
				<input type="number" v-model="A2" placeholder="Invested value" />
			</div>
			<div class="rate-price">
				<p>Sales price of the business</p>
				<input type="number" v-model="A3" placeholder="Sales price" />
			</div>
			<div class="rate-price">
				<p>Number of employees</p>
				<input type="number" v-model="A4" placeholder="Employees number" />
			</div>
			<div class="rate-price">
				<p>Your State</p>
				<select class="select-state" v-model="state">
					<option>Select State</option>
					<option v-for="(state, index) in states" :key="index" :value="state">{{ state }}</option>
				</select>
			</div>
			<div class="rate-price">
				<p>Sectors</p>
				<select class="select-state" v-model="sector">
					<option>Select Sector</option>
					<option v-for="(sector, index) in sectorData" :key="index" :value="sector.sector">{{ sector.sector }}</option>
				</select>
			</div>
		</div>
		
		<div class="btn-area">
			<mdb-btn @click="statistics" color="info">
				Statistics
				<v-icon icon="chart-bar" class="v-icon-history" />
			</mdb-btn>

			<mdb-btn @click="showMore" color="info">
				About more
					<v-icon icon="info-circle" class="v-icon-history" />
			</mdb-btn>
		</div>
			
		<!-- price section -->
		<div class="border-rate-price">
			<div class="rate-price">
				<p>With OZ</p>
				<div class="rate-price under-boder" style="width: 32%">
					<p>$</p>
					<p>{{ OZ }}</p>
				</div>
			</div>
			<div class="rate-price">
				<p>Without OZ</p>
				<div class="rate-price double-boder" style="width: 32%">
					<p>$</p>
					<p>{{ notOZ }}</p>
				</div>
			</div>
			<div class="rate-price">
				<p>Difference</p>
				<div class="rate-price under-boder" style="width: 32%">
					<p>$</p>
					<p>{{ difference }}</p>
				</div>
			</div>
		</div>
		<Disclaimer
			:showFlag="showDetailFlag"
			@close="closeDetail"
		/>
	</div>
</template>

<script>
import moment from 'moment'
import { mapGetters, mapActions } from 'vuex'
import dialogs from '../services/dialogs.js'
import stateJson from '../assets/state.json'
import sectorJson from '../jsons/sector.json'
import Disclaimer from './Disclaimer'
import SwitchBtn from './SwitchBtn'
import { mdbBtn } from 'mdbvue';
export default {
	name: 'Detail',
	data () {
		return {
			states: null,
			B1: null,
			B2: null,
			B3: null,
			B4: null,
			A1: null,
			A2: null,
			A3: null,
			A4: null,
			OZ: '',
			notOZ: '',
			difference: '',
			showDetailFlag: false,
			toggleFlag: true,
			sectorData: null,
			state: 'Select State',
			sector: 'Select Sector'
		}
	},
	components: {
		Disclaimer,
		SwitchBtn,
		mdbBtn
	},
	computed: {
		...mapGetters({
			opened: 'reverse/opened'
		})
	},
	mounted () {
		this.states = stateJson.states
		this.sectorData = sectorJson[0].sectors
	},
	methods: {
		...mapActions({
			setFlag: 'reverse/setOpened'
		}),
		statistics: function () {
			if (this.toggleFlag) {
				// validate
				if (this.B1 === null || this.B2 === null || this.B3 === null || this.B4 === null) {
					dialogs.message('You have to insert all values.', { duration: 10, state: 'error' });
					return;
				}
				if (parseInt(this.B1) < 0 || parseInt(this.B2) < 0 || parseInt(this.B3) < 0 || parseInt(this.B4) < 0) {
					dialogs.message('No numbers can be negative.', { duration: 10, state: 'error' });
					return;
				}
				if (parseInt(this.B1) > parseInt(this.B2)) {
					dialogs.message('Sold Price must be larger than Paid Price.', { duration: 10, state: 'error' });
					return;
				}
				if (parseInt(this.B3) < 0 || parseInt(this.B3) > 100) {
					dialogs.message('The Rate must be the value up 0 to 100.', { duration: 10, state: 'error' });
					return;
				}
				if (parseInt(this.B4) < 10 || parseInt(this.B4) > 20) {
					dialogs.message('The Period must be the value up 10 to 20.', { duration: 10, state: 'error' });
					return;
				}
				let current = new Date()
				let B7 = this.B2 * (Math.pow((1 + this.B3 / 100), (2026 - moment(current).toDate().getFullYear()))) - (this.B2 * (Math.pow((1 + this.B3 /100), (2026 - moment(current).toDate().getFullYear()))) - this.B2) * 0.25
				let B8 = this.B2 * (Math.pow((1 + this.B3 / 100), (2026 - moment(current).toDate().getFullYear())))
				let statistics = {
					first: B7.toFixed(2),
					second: B8.toFixed(2),
					federal: (((B8 - B7) / 3) * 2).toFixed(2),
					paid: this.B1,
					sold: this.B2,
					rate: this.B3,
					period: this.B4,
					status: 'first'
				}
				this.OZ = B8.toFixed(2)
				this.notOZ = B7.toFixed(2)
				this.difference = (B8 - B7).toFixed(2)

				dialogs.message('Statistics Completed.', { duration: 10, state: 'success' });
				this.$emit('detail', statistics)
			} else {
				if (this.A1 === null || this.A2 === null || this.A3 === null) {
					dialogs.message('You have to insert the values', { duration: 10, state: 'error' });
					return;
				}

				if (this.A4 === null) {
					dialogs.message('You have to insert the Employees.', { duration: 10, state: 'error' });
					return;
				}

				if (this.state === 'Select State') {
					dialogs.message('You have to select the state.', { duration: 10, state: 'error' });
					return;	
				}

				if (this.sector === 'Select Sector') {
					dialogs.message('You have to select the sector.', { duration: 10, state: 'error' });
					return;	
				}

				if ((this.A3 - this.A2 - this.A1) < 0) {
					dialogs.message('Sales price of the business must be bigger than Initial and Cash', { duration: 10, state: 'error' });
					return;
				}

				let statistics = {
					status: 'second',
					initial: this.A1,
					cash: this.A2,
					sales: this.A3,
					first: (this.A3 - this.A1- this.A2) * 0.75,
					second: this.A3 - this.A1- this.A2,
					federal: (parseInt(this.A3 - this.A1- this.A2) * 0.5 / 3).toFixed(2),
					state: this.state,
					sector: this.sector,
					employees: this.A4
				}

				this.OZ = this.A3 - this.A1- this.A2
				this.notOZ = (this.A3 - this.A1- this.A2) * 0.75,
				this.difference = this.OZ - this.notOZ

				this.$emit('detail', statistics)
			}
		},
		showMore: function () {
			if (!this.opened) {
				this.showDetailFlag = true
				this.setFlag(true)
			}
		},
		closeDetail: function () {
			this.showDetailFlag = false
		},
		toggleBtn: function (flag) {
			this.toggleFlag = flag
		}
	}
}
</script>