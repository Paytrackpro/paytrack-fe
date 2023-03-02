import { api } from "boot/axios";
import { Notify } from "quasar";

export async function disableOtp ({commit}, userData) {
  return api.post('/user/disable-otp', userData).then(function (res) {
    Notify.create({
      message: '2FA disabled',
      color: "positive",
      icon: "done",
    })
  })
}
