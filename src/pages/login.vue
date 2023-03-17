<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="position-relative">
          <img class="absolute q-ma-md logo" src="~assets/team_raedah.svg" />
          <div
            class="flex flex-center q-mx-auto window-height login-form-wrapper"
          >
            <div class="column justify-center q-pa-xl col-grow">
              <div
                class="flex items-center q-mb-md q-gutter-sm text-grey-7"
              ></div>
              <div v-show="!isOtp">
                <q-card class="col" flat bordered>
                  <q-card-section class="q-pa-lg">
                    <q-form class="q-gutter-y-md" @submit="goLogin()">
                      <div>
                        <q-input
                          v-model="username"
                          placeholder="Username"
                          outlined
                          dense
                          lazy-rules
                          stack-label
                          hide-bottom-space
                          :rules="[
                            (val) =>
                              (val && val.length > 0) ||
                              'Please enter your username',
                          ]"
                        >
                        </q-input>
                      </div>
                      <div>
                        <q-input
                          :type="isPwd ? 'password' : 'text'"
                          v-model="password"
                          outlined
                          dense
                          placeholder="Password"
                          lazy-rules
                          stack-label
                          hide-bottom-space
                          :rules="[
                            (val) =>
                              (val && val.length > 0) ||
                              'Please enter your password',
                          ]"
                        >
                          <template v-slot:append>
                            <q-icon
                              :name="isPwd ? 'visibility_off' : 'visibility'"
                              class="cursor-pointer"
                              @click="isPwd = !isPwd"
                            />
                          </template>
                        </q-input>
                      </div>
                      <p v-if="error" class="q-mb-none text-red">{{ error }}</p>
                      <q-btn
                        label="Sign in"
                        type="submit"
                        color="primary"
                        class="full-width"
                      />
                    </q-form>
                  </q-card-section>
                </q-card>
                <div class="text-center text-grey-6 q-mt-md">
                  <router-link class="link text-light-blue-6" to="/register"
                    >Create Account</router-link
                  >
                </div>
              </div>

              <Otp v-show="isOtp" @login="goLogin" :error="error" />
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from "vuex";
import Otp from "src/components/otp.vue";

export default {
  components: { Otp },
  name: "pageLogin",
  data() {
    return {
      username: "",
      password: "",
      error: null,
      isPwd: true,
      isOtp: false,
      otp: "",
    };
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
    }),
  },
  methods: {
    ...mapActions({
      login: "user/login",
    }),
    async goLogin(otpString) {
      const { error, data } = await this.login({
        username: this.username,
        password: this.password,
        isOtp: this.isOtp,
        otp: otpString,
      });
      if (error) {
        this.error = error.message;
        return;
      }
      if (data.otp) {
        this.isOtp = true;
        return;
      }
      this.$router.push({ path: "/dashboard" });
    },
  },
};
</script>

<style lang="scss">
.logo {
  height: 2em;
}
.login-form-wrapper {
  max-width: 28rem;
}
.link {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
