import { api } from 'boot/axios'
import { Notify } from 'quasar'

export async function getUserInfo ({commit}) {
  commit('setUserProfile', res.data.data);
};

export async function updateUserProfile ({commit} , userData) {
  return api.put('/user/info', userData)
}
