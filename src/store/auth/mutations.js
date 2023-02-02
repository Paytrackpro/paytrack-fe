export default {
  setUser(state, user) {
    state.user = user;
  },

  setAuthenticated(state, authenticated) {
    state.authenticated = authenticated;
  },

  setUserInfo(state, userinfo) {
    let stateData = (typeof(state.user) === 'string')? JSON.parse(state.user) : state.user;
    stateData.data.userInfo = userinfo.data;
    state.user = stateData;
    localStorage.setItem("user", JSON.stringify(stateData));
  }
}
