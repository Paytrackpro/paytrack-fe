import { api } from 'boot/axios'
import { Notify } from 'quasar'
import { responseError } from 'src/helper/error'

export default {
  // list actions for login/register
  async login({ commit }, payload) {
    try {
      const data = await api.post('/auth/login', payload)
      if (!data.otp) {
        localStorage.setItem('token', data.token)
        commit('setUser', data.userInfo)
        commit('setAuthenticated', true)
      }
      return { data }
    } catch (error) {
      return { error }
    }
  },

  async register({ commit }, user) {
    return api.post('/auth/register', user)
  },

  async logOut({ commit }, user) {
    commit('setUser', '')
    commit('setAuthenticated', false)
    localStorage.clear()
  },

  async verifyOtp({ commit }, payload) {
    try {
      const data = await api.post('/auth/verify-otp', payload)
      localStorage.setItem('token', data.token)
      commit('setUser', data.userInfo)
      commit('setAuthenticated', true)
    } catch (error) {
      return error
    }
  },

  // list actions for using system
  async getUser({ commit }) {
    return api
      .get('/user/info')
      .then((user) => {
        commit('setUser', user)
        return user
      })
      .catch((err) => {
        responseError(err)
        return false
      })
  },

  async setGlobalUser({ commit }, newUser) {
    commit('setUser', newUser)
  },

  async updateUseBtcpay({ commit }, useBTCPay) {
    return api
      .put('/user/use-btcpay', { useBtcPay: useBTCPay })
      .then((newUser) => {
        Notify.create({
          message: 'Updated use BTCPay flag successfully',
          color: 'positive',
          icon: 'done',
        })
        commit('setUser', newUser)
        return newUser
      })
      .catch((err) => {
        responseError(err)
        return false
      })
  },

  async updateUser({ commit }, userData) {
    return api
      .put('/user/info', userData)
      .then((newUser) => {
        Notify.create({
          message: 'Your information is updated',
          color: 'positive',
          icon: 'done',
        })
        commit('setUser', newUser)
        return newUser
      })
      .catch((err) => {
        responseError(err)
        return false
      })
  },

  async disableOtp({ commit }, body) {
    try {
      await api.post('/user/disable-otp', body)
      Notify.create({
        message: '2FA disabled',
        color: 'positive',
        icon: 'done',
      })
      return true
    } catch (error) {
      responseError(error)
    }
    return false
  },

  async enableOtp({ commit }, body) {
    try {
      const res = await api.post('/user/generate-otp', body)
      Notify.create({
        message: 'QR code created',
        color: 'positive',
        icon: 'done',
      })
      commit('setQrImage', res.mfa_qr_image)
      commit('setQrKey', res.secret_key)
      commit('setQrAccount', res.account)
      commit('setTempPassword', body.password)
      return true
    } catch (error) {
      responseError(error)
    }
    return false
  },
}
