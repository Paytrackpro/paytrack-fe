import jwt_decode from "jwt-decode"

function checkValidToken() {
  try {
    const token = localStorage.getItem("token")
    const decoded = jwt_decode(token)

    return localStorage.getItem("token") && Date.now() < decoded.Expire * 1000
  } catch (e) {
    return false
  }
}

export default {
  authenticated: checkValidToken(),
  user: localStorage.getItem("user"),
}
