import ROLE from 'src/consts/role'

export default {
  getUserProfile(state) {
    return state.user
  },
  getTempPassword(state) {
    return state.tempPassword
  },
  getQrImage(state) {
    return state.qrImage
  },
  getQrKey(state) {
    return state.qrKey
  },
  getQrAccount(state) {
    return state.qrAccount
  },
  isAuthenticated(state) {
    return state.authenticated
  },
  getUser(state, reload) {
    return state.user || { id: 0 }
  },
  getRole(state) {
    return state.user.role === ROLE.ADMIN ? 'admin' : 'user'
  },
}
