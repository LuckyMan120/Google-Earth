import * as types from '../mutation-types';
import { api } from '../../services/api'
import cache, { keys } from '../../services/cache';
import globalStore from '../../store'
import jwt_decode from "jwt-decode";
import router from '../../router'

const state = {
    auth: false,
    user: null,
    signup_text: '',
    login_err_message: '',
    token: null
}

const getters = {
    checkLogin: state => state.auth,
    getuser: state => state.user,
    getLocalStorage: state => state.token,
    getErrMsg: state => state.login_err_message
}

const actions = {
    login: function (store, payload) {
        return api.login(payload).then((response) => {
            globalStore.dispatch('auth/confirmActive', response)
        }, ({data}) => {
            return Promise.reject(data)
        })
    },

    register: function (store, payload) {
        return api.register(payload).then((response) => {
            store.commit(types.SIGNUP_SUCCESS, response.text)
            return Promise.resolve()
        }, ({data}) => {
            return Promise.reject(data)
        })
    },

    autoLogin: function (store, payload) {
        return api.autoLogin(payload).then((response) => {
            const decode = jwt_decode(response.token)

            cache.setItem(keys.TOKEN_KEY, response.token)
            store.commit(types.AUTH_SET_TOKEN, decode.user)
            return Promise.resolve()
        }, ({data}) => {
            return Promise.reject(data)
        })
    },


    getLocalStorage: function (store) {
        let token = cache.getItem(keys.TOKEN_KEY)
        token
            .then(result => {
                const decode = jwt_decode(result)
                store.commit(types.AUTH_SET_TOKEN, decode.user)
            })
            .catch(err => console.log('err', err))
    },

    confirmActive: function (store, response) {
        const type = typeof response
        if (type === 'string') {
            store.commit(types.SET_ERROR_MESSAGE, response)
        } else {
            const decode = jwt_decode(response.token)
            if (decode.user.active) {
                cache.setItem(keys.TOKEN_KEY, response.token)
                store.commit(types.AUTH_SET_TOKEN, decode.user);
            } else {
                store.commit(types.SET_ERROR_MESSAGE, 'Your account does not verify. Please verify your account');
            }
        }
    },

    logout: function (store) {
        store.commit(types.AUTH_LOGOUT);
        router.replace({ name: 'Home' })
    },

    updatePhoto: function (store, data) {
        return api.updatePhoto(data).then((response) => {
            console.log(store)
            console.log('updatePhoto', response)
            return Promise.resolve()
        }, ({data}) => {
            return Promise.reject(data)
        })
    }
}

const mutations = {
    [types.AUTH_SET_TOKEN] (state, user) {
        state.user = user;
        state.auth = true;
    },

    [types.SIGNUP_SUCCESS] (state, data) {
        state.signup_text = data
    },

    [types.SET_LOCALSTORAGE] (state, token) {
        state.token = token
    },

    [types.SET_ERROR_MESSAGE] (state, message) {
        state.login_err_message = message
    },

    [types.AUTH_LOGOUT] (state) {
        state.user = null
        state.auth = null
        state.token = null
        cache.clear()
    }
}

export default {
    namespaced: true,
    state,
    getters,
    actions,
    mutations
};