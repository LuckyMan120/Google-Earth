import Vue from 'vue'
import App from './App.vue'
import router from './router'

import * as VueGoogleMaps from 'vue2-google-maps'
import './styles/style.css'
import VueFusionCharts from 'vue-fusioncharts';
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import store from './store';

library.add(fas);
Vue.component('v-icon', FontAwesomeIcon);
 
// import FusionCharts modules and resolve dependency
import FusionCharts from 'fusioncharts';
import Charts from 'fusioncharts/fusioncharts.charts';

Vue.use(VueFusionCharts, FusionCharts, Charts);

Vue.use(VueGoogleMaps, {
    load: {
        key: 'AIzaSyDoi0kDoetjxsvsctCrRb99I5lu1GJMj_8',
        libraries: 'places,drawing,geometry',
        installComponents: true
    }
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
