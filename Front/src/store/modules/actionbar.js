import * as types from '../mutation-types';

const state = {
    title: 'US Government'
}

const getters = {
    checkLogin: state => state.auth
}

const actions = {
    setTitle: function (store, title = 'US Government') {
        store.commit(types.HEADER_SET_TITLE, title);
        if (document) {
            document.title = title + (title !== 'US Government' ? ' - US Government' : '');
        }
    }
}

const mutations = {
    [types.HEADER_SET_TITLE] (state, title) {
        state.title = title
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};