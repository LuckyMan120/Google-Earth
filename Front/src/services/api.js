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
// const baseURL = 'http://localhost:4000/earth';
const baseURL = 'http://146.71.77.95:4000/earth';

const handleError = fn => (...params) =>
  fn(...params).catch(error => {
    vm.flash(`${error.response.status}: ${error.response.statusText}`, 'error');
  });

export const api = {
  getAllData: handleError(async () => {
    const res = await axios.get(baseURL + '/all');
    return res.data;
  }),
  searchPolygon: handleError(async payload => {
    const res = await axios.post(baseURL + '/search', payload);
    return res.data;
  }),
  saveData: handleError(async payload => {
    const res = await axios.post(baseURL + '/save', payload);
    return res.data;
  })
};