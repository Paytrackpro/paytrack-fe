export default {
  isAuthenticated(state) {
    return state.authenticated;
  },
  getUser(state) {
    return state.user;
  }
}
