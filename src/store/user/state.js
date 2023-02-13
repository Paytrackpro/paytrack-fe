const user = localStorage.getItem('user');
export default function () {
  return {
    userInfo : user,
  }
}
