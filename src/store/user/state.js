const user = localStorage.getItem('profile');
export default function () {
  return {
    userInfo : user,
  }
}
