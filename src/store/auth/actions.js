
export default {
  login({ commit }, user) {
    // store user data as string in localStorage
    localStorage.setItem('user', JSON.stringify({}));

    // set user data returned by login API
    commit('setUser', {});
    commit('setAuthenticated', true);
  }
}
