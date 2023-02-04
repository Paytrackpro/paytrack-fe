import { api } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  async login({ commit }, user) {
    return api.post('/auth/login', user)
      .then(function (res) {
        localStorage.setItem('user', JSON.stringify(res.data.data));
        commit('setUser', res.data.data);
        commit('setAuthenticated', true);
        api.defaults.headers.common['Authorization'] = 'Bearer ' + res.data.data.token
      })
  },
  async getUserInfo({commit}){
    api.get('/user/info')
      .then(function (res) {
        commit('setUserInfo', res.data.data);
    })
  },
  async updateUserInfo({ commit }, userData)  {
    api.post('/user/info', userData).then(function (res) {
      Notify.create({
        message: res.data.message,
        color: "positive",
        icon: "done",
      })
    })
  },
  async register({ commit }, user) {
    return api.post('/auth/register', user)
  }
}

