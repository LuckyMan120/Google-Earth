<template>
	<div class="details">
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
		<div class="rate-price">
			<p>Your State</p>
			<select class="select-state">
				<option>Select State</option>
				<option v-for="(state, index) in states" :key="index" :value="state">{{ state }}</option>
			</select>
		</div>

		<button @click="statistics">
			Statistics
			<v-icon icon="chart-bar" class="v-icon-history" />
		</button>

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
	</div>
</template>

<script>
import moment from 'moment'
import dialogs from '../services/dialogs.js'
import stateJson from '../assets/state.json'
export default {
	name: 'Detail',
	data () {
		return {
			states: null,
			B1: null,
			B2: null,
			B3: null,
			B4: null,
			OZ: '',
			notOZ: '',
			difference: ''
		}
	},
	mounted () {
		this.states = stateJson.states
	},
	methods: {
		statistics: function () {
			// validate
			if (this.B1 === null || this.B2 === null || this.B3 === null || this.B4 === null) {
				dialogs.message('You have to insert all values.', { duration: 10, state: 'error' });
				return;
			}
			if (this.B1 < 0 || this.B2 < 0 || this.B3 < 0 || this.B4 < 0) {
				dialogs.message('No numbers can be negative.', { duration: 10, state: 'error' });
				return;
			}
			if (this.B1 > this.B2) {
				dialogs.message('Sold Price must be larger than Paid Price.', { duration: 10, state: 'error' });
				return;
			}
			if (this.B3 < 0 || this.B3 > 100) {
				dialogs.message('The Rate must be the value up 0 to 100.', { duration: 10, state: 'error' });
				return;
			}
			if (this.B4 < 10 || this.B4 > 20) {
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
				state: ((B8 - B7) / 3).toFixed(2),
				paid: this.B1,
				sold: this.B2,
				rate: this.B3,
				period: this.B4
			}
			this.OZ = B8.toFixed(2)
			this.notOZ = B7.toFixed(2)
			this.difference = (B8 - B7).toFixed(2)
			dialogs.message('Statistics Completed.', { duration: 10, state: 'success' });
			this.$emit('detail', statistics)
		}
	}
}
</script>