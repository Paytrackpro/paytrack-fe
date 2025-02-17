import { api } from 'boot/axios'
import { responseError } from 'src/helper/error'

export default {
  async save({ commit }, payment) {
    let url = '/payment'
    if (payment.id > 0) {
      url = `/payment/${payment.id}`
    }
    return api
      .post(url, payment)
      .then((data) => ({ data }))
      .catch((err) => {
        responseError(err)
        return { error: err }
      })
  },
  async createPayUrl({ commit }, payment) {
    return api
      .post('/payment/create-url', payment)
      .then((data) => ({ data }))
      .catch((err) => {
        responseError(err)
        return { error: err }
      })
  },
}
