<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div v-bind:style="{ maxWidth: '28rem' }" class="flex flex-center q-mx-auto window-height">
          <div class="column justify-center q-pa-xl col-grow">
            <div class="flex items-center q-mb-md q-gutter-sm text-grey-7">
              <img v-bind:style="{ height: '2em' }" src="~assets/team_raedah.svg" />
              <span class="text-bold">MGMT</span>
            </div>
            <q-card class="col" flat bordered>
              <q-card-section class="q-pa-lg">
                <q-form class="q-gutter-y-md">
                  <div>
                    <p class="q-mt-none q-mb-xs text-weight-medium">User name</p>
                    <q-input v-model="username" placeholder="Your user name" outlined dense lazy-rules stack-label>
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
                  <q-btn label="Sign in" to="/" type="submit" color="primary" class="full-width" @click="login" />
                </q-form>
              </q-card-section>
            </q-card>
            <div class="text-center text-grey-6 q-mt-md">
              Don't have account yet? <a class="link text-light-blue-6" href="/apply">Apply now</a>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  data() {
    return {
      username: "",
      password: "",
      isPwd: true,
    }
  },
  computed: {
    loggedIn() {
      return this.$store.state.auth.status.loggedIn
    },
  },
  methods: {
    login() {
      this.$store.dispatch("auth/login", {
        username: this.username,
        password: this.password,
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
