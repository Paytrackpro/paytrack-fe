import ROLE from "src/consts/role";

export default {
  isAuthenticated(state) {
    return state.authenticated;
  },
  getUser(state) {
    return state.user;
  },
  getRole(state) {
    return state.user.role === ROLE.ADMIN ? "admin" : "user";
  },
};
