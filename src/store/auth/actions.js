import { api } from "boot/axios";

export default {
  async login({ commit }, user) {
    return api.post("/auth/login", user).then(function (res) {
      const responseData = res.data.data
      if (responseData.otp) {
        localStorage.setItem("tempUser", JSON.stringify(responseData))
        return
      }

      localStorage.setItem("token", responseData.token)
      commit("setUser", responseData.userInfo)
      commit("setAuthenticated", true)
      commit("setUserProfile", JSON.stringify(responseData.userInfo))
    })
  },

  async register({ commit }, user) {
    return api.post("/auth/register", user);
  },

  async logOut({ commit }, user) {
    commit("setUser", "")
    commit("setAuthenticated", false)
    commit('setUserProfile', '')
    this.$router.push({ name: "Login" })
    localStorage.clear()
  },

  async verifyOtp({ commit }, payload) {
    return api
      .post("/auth/verify-otp", {
        otp: payload.otp,
        userId: payload.userId,
        firstTime: payload.firstTime
      })
      .then((res) => {
        localStorage.removeItem("tempUser")

        const responseData = res.data.data
        localStorage.setItem("token", responseData.token)
        commit("setUser",responseData.userInfo)
        commit("setAuthenticated", true)
        commit("setUserProfile", JSON.stringify(responseData.userInfo))
      })
  },
};
