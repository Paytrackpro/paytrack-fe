import jwt_decode from "jwt-decode"

function checkValidToken() {
  try {
    const token = localStorage.getItem("token")
    const decoded = jwt_decode(token)

    if (Date.now() >= decoded.Expire * 1000) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    return true
  } catch (e) {
    return false
  }
}

function setUser() {
  try {
    return JSON.parse(localStorage.getItem("user"));
  } catch (e) {
    return null
  }
}

export default {
  authenticated: checkValidToken(),
  user: setUser(),
  role: null
}
