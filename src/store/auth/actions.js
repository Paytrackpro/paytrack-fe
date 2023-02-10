import { api } from "boot/axios"

export default {
  async login({ commit }, user) {
    return api.post("/auth/login", user).then(function (res) {
      const responseData = res.data.data
      localStorage.setItem("user", JSON.stringify(responseData.userInfo))
      localStorage.setItem("token", responseData.token)
      commit("setUser", res.data.data.userInfo)
      commit("setAuthenticated", true)
      commit('setUserProfile', res.data.data.userInfo)
    })
  },

  async register({ commit }, user) {
    return api.post("/auth/register", user)
  },

  async logOut({ commit }, user) {
    localStorage.clear()
    commit("setUser", '')
    commit("setAuthenticated", false)
    this.$router.push({ name: "Login" })
  },
}
