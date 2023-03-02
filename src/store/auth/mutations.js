export default {
  setUser(state, user) {
    state.user = user;
    localStorage.setItem("user", JSON.stringify(user))
  },
  setAuthenticated(state, authenticated) {
    state.authenticated = authenticated;
  },
  setUserProfile(state, userProfile) {
    this.state.user.userInfo = userProfile;
  },
};
