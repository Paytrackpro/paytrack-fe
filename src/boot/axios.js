import axios from 'axios'
import { Notify } from 'quasar'
import Vue from 'vue'


Vue.prototype.$axios = axios
// ^ ^ ^ this will allow you to use this.$axios
//       so you won't necessarily have to import axios in each vue file

const api = axios.create({ baseURL: 'http://localhost:6789/api' })
Vue.prototype.$api = api
// ^ ^ ^ this will allow you to use this.$api
//       so you can easily perform requests against your app's API

api.interceptors.response.use(
  response  => {},
  error     => {
    Notify.create({
      message: error.response ? error.response.data.message : error.message,
      color: "negative",
      icon: "warning",
    })
    return Promise.reject(error);
  }
);

export { axios, api }
