export default {
  isAuthenticated(state) {
    return state.authenticated;
  },
  getUserInfo(state){
    return state.user.userInfo;
  },
}
