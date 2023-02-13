export default {
  setUser(state, user) {
    state.user = user;
  },
  setAuthenticated(state, authenticated) {
    state.authenticated = authenticated;
  },
  setUserProfile(state, userProfile){
    this.state.user.userInfo = userProfile;
  },
}
