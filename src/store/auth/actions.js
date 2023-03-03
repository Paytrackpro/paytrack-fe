import { api } from "boot/axios";

export default {
  async login({ commit }, user) {
    return api.post("/auth/login", user).then(function (data) {
      if (data.otp) {
        localStorage.setItem("tempUser", JSON.stringify(data))
        return
      }

      localStorage.setItem("token", data.token)
      commit("setUser", data.userInfo)
      commit("setAuthenticated", true)
      commit("setUserProfile", JSON.stringify(data.userInfo))
    })
  },

  async register({ commit }, user) {
    return api.post("/auth/register", user);
  },

  async logOut({ commit }, user) {
    commit("setUser", "")
    commit("setAuthenticated", false)
    commit('setUserProfile', '')
    this.$router.push({ name: "login" })
    localStorage.clear()
  },

  async verifyOtp({ commit }, payload) {
    return api
      .post("/auth/verify-otp", {
        otp: payload.otp,
        userId: payload.userId,
        firstTime: payload.firstTime
      })
      .then((data) => {
        localStorage.removeItem("tempUser")

        localStorage.setItem("token", data.token)
        commit("setUser",data.userInfo)
        commit("setAuthenticated", true)
        commit("setUserProfile", JSON.stringify(data.userInfo))
      })
  },
};
