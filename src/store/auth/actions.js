import { api } from "boot/axios";

export default {
  async login({ commit }, payload) {
    try {
      const data = await api.post("/auth/login", payload);
      if (!data.otp) {
        localStorage.setItem("token", data.token);
        commit("setUser", data.userInfo);
        commit("setAuthenticated", true);
      }
      return { data };
    } catch (error) {
      return { error };
    }
  },

  async register({ commit }, user) {
    return api.post("/auth/register", user);
  },

  async logOut({ commit }, user) {
    commit("setUser", "")
    commit("setAuthenticated", false)
    localStorage.clear()
  },

  async verifyOtp({ commit }, payload) {
    try {
      const data = await api.post("/auth/verify-otp", payload);
      localStorage.setItem("token", data.token);
      commit("setUser", data.userInfo);
      commit("setAuthenticated", true);
    } catch (error) {
      return error;
    }
  },
};
