import { api } from "boot/axios";
import { Notify } from "quasar";
import { responseError } from "src/helper/error";

export default {
  async getUserInfo({ commit }) {
    commit('setUserProfile', res.data.data);
  },

  async updateUserProfile({ commit }, userData) {
    return api.put('/user/info', userData).then(function (res) {
      Notify.create({
        message: 'your information is updated',
        color: "positive",
        icon: "done",
      })
    })
  },

  async disableOtp({ commit }, body) {
    try {
      await api.post('/user/disable-otp', body);
      Notify.create({
        message: '2FA disabled',
        color: "positive",
        icon: "done",
      });
      return true;
    } catch (error) {
      responseError(error);
    }
    return false;
  },

  async enableOtp({ commit }, body) {
    try {
      const res = await api.post('/user/generate-otp', body);
      Notify.create({
        message: 'QR code created',
        color: "positive",
        icon: "done",
      })
      commit('setQrImage', res.mfa_qr_image);
      commit('setTempPassword', body.password);
      return true;
    } catch (error) {
      responseError(error);
    }
    return false;
  },
}
