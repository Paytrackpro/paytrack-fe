export default {
  setUser(state, user) {
    state.user = user;
  },
  setAuthenticated(state, authenticated) {
    state.authenticated = authenticated;
  },
  setToken(state, token){
    state.token = token;
  },
  setUserProfile(state, userProfile){
    this.state.user.userInfo = userProfile;
  }
}
