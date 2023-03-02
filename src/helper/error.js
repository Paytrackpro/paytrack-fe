import { Notify } from 'quasar'

const responseError = (error) => {
  Notify.create({
    type: "negative",
    message: error.message
  })
}

export { responseError }
