import { api } from 'boot/axios'
import { Notify } from 'quasar'

export async function getUserInfo ({commit} , token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  api.get('/user/info')
    .then(function (res) {
      commit('setUserInfo', res.data.data);
  })
};

export async function updateUser ({commit} , userData) {
  api.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
  api.post('/user/info', userData.form).then(function (res) {
    Notify.create({
      message: 'your information is updated',
      color: "positive",
      icon: "done",
    })
  })
}
