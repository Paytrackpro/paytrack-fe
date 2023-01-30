import { api } from 'boot/axios'

export function USER_LOGIN (context, form) {
  let url = ''
  return api.post(url, form)
    .then(response => {
      context.commit('USER_LOGIN', {
        username : response.data.userinfo.UserName,
        userid : response.data.userinfo.Id,
        email : response.data.userinfo.Email,
        token : response.data.token,
      })
    });
}

