import axios from 'axios';
import Vue from 'vue';
import VueFlashMessage from 'vue-flash-message';
import 'vue-flash-message/dist/vue-flash-message.min.css';

Vue.use(VueFlashMessage, {
  messageOptions: {
    timeout: 3000,
    pauseOnInteract: true
  }
});

const vm = new Vue();
const earthURL = 'http://localhost:4000/earth';
const userURL = 'http://localhost:4000/user';
// const earthURL = 'http://146.71.77.95:4000/earth';
// const userURL = 'http://146.71.77.95:4000/user';

const handleError = fn => (...params) =>
  fn(...params).catch(error => {
    vm.flash(`${error.response.status}: ${error.response.statusText}`, 'error');
  });

export const api = {
  getAllData: handleError(async () => {
    const res = await axios.get(earthURL + '/all');
    return res.data;
  }),
  searchPolygon: handleError(async payload => {
    const res = await axios.post(earthURL + '/search', payload);
    return res.data;
  }),
  saveData: handleError(async payload => {
    const res = await axios.post(earthURL + '/save', payload);
    return res.data;
  }),
  login: handleError(async payload => {
    const res = await axios.post(userURL + '/login', payload);
    return res.data;
  }),
  register: handleError(async payload => {
    const res = await axios.post(userURL + '/register', payload);
    return res.data;
  }),
  autoLogin: handleError(async payload => {
    const res = await axios.post(userURL + '/autologin', payload);
    return res.data;
  }),
  updatePhoto: handleError(async payload => {
    const res = await axios.put(userURL + '/updatePhoto', payload);
    return res.data;
  })
};