export default {
  isAuthenticated(state) {
    return state.authenticated;
  },
  getUserInfo(state){
    return state.user.data.userInfo;
  },
  getToken(state){
    return state.user.data.token;
  },
}
