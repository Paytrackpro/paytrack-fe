export default {
  isAuthenticated(state) {
    return state.authenticated;
  },
  getToken(state) {
    return state.token;
  },
  getRole(state){
    return state.role;
  }
}
