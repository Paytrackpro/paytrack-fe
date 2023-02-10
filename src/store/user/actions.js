import { api } from 'boot/axios'
import { Notify } from 'quasar'

export async function getUserInfo ({commit}) {
  api.get('/user/info')
    .then(function (res) {
      commit('setUserProfile', res.data.data);
  })
};

export async function updateUserProfile ({commit} , userData) {
  api.put('/user/info', userData).then(function (res) {
    Notify.create({
      message: 'your information is updated',
      color: "positive",
      icon: "done",
    })
  })
}
