import { api } from 'boot/axios'
import { Notify } from 'quasar'

export async function getUserInfo ({commit}) {
  commit('setUserProfile', res.data.data);
};

export async function updateUserProfile ({commit}, userData) {
  return api.put('/user/info', userData).then(function (res) {
    Notify.create({
      message: 'your information is updated',
      color: "positive",
      icon: "done",
    })
  })
}
