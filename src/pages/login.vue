<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="position-relative">
          <img class="absolute q-ma-md" v-bind:style="{ height: '2em' }" src="~assets/team_raedah.svg" />
          <div v-bind:style="{ maxWidth: '28rem' }" class="flex flex-center q-mx-auto window-height">
            <div class="column justify-center q-pa-xl col-grow">
              <div class="flex items-center q-mb-md q-gutter-sm text-grey-7">
                <span class="text-bold">Login</span>
              </div>
              <q-card class="col" flat bordered>
                <q-card-section class="q-pa-lg">
                  <q-form class="q-gutter-y-md" @submit="login">
                    <div>
                      <p class="q-mt-none q-mb-xs text-weight-medium">User name</p>
                      <q-input
                        v-model="username"
                        placeholder="Your user name"
                        outlined
                        dense
                        lazy-rules
                        stack-label
                        hide-bottom-space
                        :rules="[(val) => (val && val.length > 0) || 'Please enter your username']"
                      >
                      </q-input>
                    </div>
                    <div>
                      <p class="q-mt-none q-mb-xs text-weight-medium">Password</p>
                      <q-input
                        :type="isPwd ? 'password' : 'text'"
                        v-model="password"
                        outlined
                        dense
                        placeholder="Password"
                        lazy-rules
                        stack-label
                        hide-bottom-space
                        :rules="[(val) => (val && val.length > 0) || 'Please enter your password']"
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
                    <q-btn label="Sign in" type="submit" color="primary" class="full-width" />
                  </q-form>
                </q-card-section>
              </q-card>
              <div class="text-center text-grey-6 q-mt-md">
                Don't have account yet? <a class="link text-light-blue-6" href="/register">Apply now</a>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import ROLE from "src/consts/role"
import { mapGetters } from "vuex"
export default {
  data() {
    return {
      username: "",
      password: "",
      error: null,
      isPwd: true,
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
  },
  methods: {
    login() {
      this.$store
        .dispatch("auth/login", {
          username: this.username,
          password: this.password,
        })
        .then((res) => {
          if (!this.user) {
            this.$router.push({ name: "OTP" })
            return;
          }

          if (this.user.role === ROLE.ADMIN) {
            this.$router.push({ name: "Home" })
          } else {
            this.$router.push({ name: "user.home" })
          }
        })
        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message
        })
    },
  },
}
</script>

<style lang="scss">
.link {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
