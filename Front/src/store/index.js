import Vue from 'vue';
import Vuex from 'vuex';

import reverse from './modules/reverse'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        appVersion: 3
    },
    modules: {
        reverse
    }
});