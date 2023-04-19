import { boot } from 'quasar/wrappers'
import axios from 'axios'
import state from 'src/store/user/state'

const api = axios.create({ baseURL: process.env.BASE_URL })
var routers

export default boot(({ app, router }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axios
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$api = api
  routers = router
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

api.interceptors.request.use(function (config) {
  const token = localStorage.getItem('token')
  
  if (token) {
    config.headers['Authorization'] = 'Bearer ' + token
  }

  return config
})

api.interceptors.response.use(
  (response) => {
    if (response.status === 200) {
      return Promise.resolve(response.data.data)
    }
    return Promise.reject({
      message: response.data.message,
    })
  },
  (error) => {
    if (error.response === undefined) {
      return Promise.reject({
        message: 'Lost connection to server',
        status: 503,
      })
    }
    if (error.response.data.message) {
      if (error.response.status === 400 && !state.checkToken()) {
        routers.push({ path: '/login' })
      }
      return Promise.reject({
        message: error.response.data.message,
        status: error.response.status,
      })
    }
    return Promise.reject({
      message: error.response.data,
      status: 404,
    })
  }
)

export { axios, api }
