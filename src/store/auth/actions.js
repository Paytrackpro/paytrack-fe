import { api } from 'boot/axios'

export default {
  async login({ commit }, user) {
    return api.post('/auth/login', user)
      .then(function (res) {
        localStorage.setItem('user', JSON.stringify(res.data.data));
        commit('setUser', res.data.data);
        commit('setAuthenticated', true);
        commit('setToken', res.data.data.token);
        commit('setUserProfile', res.data.data.userInfo);
        commit('setRole', res.data.data.userInfo.role);
      })
  },

  async register({ commit }, user) {
    return api.post('/auth/register', user)
  }
}

