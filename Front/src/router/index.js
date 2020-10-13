import Vue from 'vue'
import VueRouter from 'vue-router'

import routes from './routes'
import store from '../store';

Vue.use(VueRouter)

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

router.beforeEach(async (to, from, next) => {
    let actionbar = to.meta.actionbar || {}
    let data = await store.dispatch('auth/getLocalStorage')
    let user = store.getters['auth/checkLogin']
    console.log('data', data)

    if (to.name === 'Register') {
        if (user) {
            router.replace({ name: 'Home' });
            store.dispatch('actionbar/setTitle', 'Map Home')
        } else {
            next()
            store.dispatch('actionbar/setTitle', actionbar.header.title)
        }
    } else {
        next()
        store.dispatch('actionbar/setTitle', actionbar.header.title)
    }
})

router.stack = [];
router._push = router.push;
router._replace = router.replace;

router.push = function (data, fnSuccess, fnFailure) {
    router._push(data, fnSuccess, fnFailure);
};

router.replace = function (data) {
    // console.log('replace', JSON.stringify(router.stack), JSON.stringify(data));
    if (data.name !== 'search') {
        router.stack.pop();
        router.stack.push(data);
    } else {
        router.stack = [];
    }
    router._push(data);
};

export default router
