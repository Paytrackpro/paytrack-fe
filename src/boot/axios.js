import axios from 'axios'
import Vue from 'vue'


Vue.prototype.$axios = axios
// ^ ^ ^ this will allow you to use this.$axios
//       so you won't necessarily have to import axios in each vue file

require('dotenv').config()
const api = axios.create({ baseURL: process.env.BASE_URL })

Vue.prototype.$api = api
// ^ ^ ^ this will allow you to use this.$api
//       so you can easily perform requests against your app's API

api.interceptors.response.use(
  response  => {
    return Promise.resolve(response)
  },
  error     => {
    return Promise.reject(error);
  }
);

export { axios, api }
