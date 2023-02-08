import { api } from "boot/axios"

export default {
  async login({ commit }, user) {
    return api.post("/auth/login", user).then(function (res) {
      const responseData = res.data.data
      localStorage.setItem("user", JSON.stringify(responseData.userInfo))
      localStorage.setItem("token", responseData.token)
      commit("setUser", res.data.data.userInfo)
      commit("setAuthenticated", true)
    })
  },

  async register({ commit }, user) {
    return api.post("/auth/register", user)
  },
}
