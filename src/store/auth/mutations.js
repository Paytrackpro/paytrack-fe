export default {
  setUser(state, user) {
    state.user = user;
  },
  setAuthenticated(state, authenticated) {
    state.authenticated = authenticated;
  },
  setUserInfo(state, userInfo) {
    state.user.userInfo = userInfo
  }
}
