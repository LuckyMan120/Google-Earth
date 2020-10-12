import Vue from 'vue';
import Vuex from 'vuex';

import reverse from './modules/reverse'
import auth from './modules/auth'
import actionbar from './modules/actionbar'

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        appVersion: 3
    },
    modules: {
        reverse,
        auth,
        actionbar
    }
});