import { api } from 'boot/axios'

export default {
  async login({ commit }, user) {
    return api.post('/auth/login', user)
      .then(function (res) {
        localStorage.setItem('user', JSON.stringify(res.data));
        commit('setUser', res.data);
        commit('setAuthenticated', true);
      })
  }
}
