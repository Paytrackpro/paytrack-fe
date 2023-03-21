export default {
  setUser(state, user) {
    localStorage.setItem('user', JSON.stringify(user))
    state.user = user
  },
  setQrImage(state, val) {
    state.qrImage = val
  },
  setTempPassword(state, val) {
    state.tempPassword = val
  },
  setAuthenticated(state, authenticated) {
    state.authenticated = authenticated
  },
}
