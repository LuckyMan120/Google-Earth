import * as types from '../mutation-types';

const state = {
    openedFlag: false
}

const getters = {
    opened: state => state.openedFlag
}

const actions = {
    setOpened: function (store, flag) {
        store.commit(types.SET_REVERSE_OPENED, flag)
    }
}

const mutations = {
    [types.SET_REVERSE_OPENED] (state, flag) {
        state.openedFlag = flag
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};