import { createStore } from "vuex";
import user from "./user";

export default function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      user,
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEV,
  });

  return Store;
}
