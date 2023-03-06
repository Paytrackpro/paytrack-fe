export default {
  getUserProfile(state) {
    return state.userInfo;
  },
  getTempPassword(state) {
    return state.tempPassword;
  },
  getQrImage(state) {
    return state.qrImage;
  },
}