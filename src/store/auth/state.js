const user = localStorage.getItem('user');

export default {
  authenticated: user != null,
  user: user
}
