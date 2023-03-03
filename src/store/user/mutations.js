export default {
  setUserProfile(state, userProfile) {
    state.userInfo = userProfile;
  },
  setQrImage(state, val) { 
    state.qrImage = val;
  },
  setTempPassword(state, val) {
    state.tempPassword = val;
  }
}
