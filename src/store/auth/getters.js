export default {
  isAuthenticated(state) {
    return state.authenticated;
  },
  getUserInfo(state){
    let resp = (typeof(state.user) === 'string') ? JSON.parse(state.user) : state;
    return resp.data.userInfo;
  },
  getToken(state){
    let resp = (typeof(state.user) === 'string') ? JSON.parse(state.user) : state;
    return resp.data.token;
  }
}
