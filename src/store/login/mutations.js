export function USER_LOGIN (state , object) {
  state.userInfo.username = object.username;
  state.userInfo.userid = object.userid;
  state.userInfo.email = object.email;
  state.token = object.token;
  state.isLogin = true;
}

