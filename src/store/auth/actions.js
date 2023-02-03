import { api } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  async login({ commit }, user) {
    return api.post('/auth/login', user)
      .then(function (res) {
        localStorage.setItem('user', JSON.stringify(res.data.data));
        commit('setUser', res.data.data);
        commit('setAuthenticated', true);
      })
  },
  async getUserInfo({commit},token){
    api.defaults.headers.common['Authorization'] = 'Bearer ' + token
    api.get('/user/info')
      .then(function (res) {
        commit('setUserInfo', res.data);
    })
  },
  async updateUserInfo({ commit }, userData)  {
    api.defaults.headers.common['Authorization'] = 'Bearer ' + userData.token
    api.post('/user/info', userData.form).then(function (res) {
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

