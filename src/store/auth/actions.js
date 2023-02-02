import { api } from 'boot/axios'
import { Notify } from 'quasar'

export default {
  async login({ commit }, user) {
    api.post('/auth/login', user)
      .then(function (res) {
        localStorage.setItem('user', JSON.stringify(res.data));
        commit('setUser', res.data);
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
  async updateUserInfo({ commit }, form)  {
    api.post('/user/info', form).then(function (res) {
      Notify.create({
        message: res.data.message,
        color: "positive",
        icon: "done",
      })
    })
  },
}

