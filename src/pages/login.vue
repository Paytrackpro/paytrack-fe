<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="parent clearfix">
          <div class="bg-illustration">
            <div class="flex flex-center q-mx-auto window-height">
              <div class="justify-center row">
                <q-avatar rounded>
                  <img width="100" src="../assets/system-logo.png" />
                </q-avatar>
                <q-toolbar-title class="text-white text-bold text-h3 q-mt-xs q-ml-xs"> MGMT-NG </q-toolbar-title>
              </div>
            </div>
          </div>
          <div class="login">
            <div class="position-relative">
              <div class="flex flex-center q-mx-auto window-height">
                <div class="container justify-center">
                  <div v-show="!isOtp">
                    <q-card-section class="q-pa-lg login-form">
                      <p class="text-h5 text-primary"><b>Sign In</b></p>
                      <p class="login-subtitle text-primary">Please fill login information below</p>
                      <q-form class="form-area" @submit="goLogin()">
                        <div class="inputContainer">
                          <input
                            id="user_name_id"
                            v-model="username"
                            type="text"
                            class="input"
                            placeholder="Username"
                            required
                          />
                          <label for="user_name_id" class="label">
                            <q-icon name="person" class="input-icon" />
                            <span class="input-label q-ml-xs">Username</span></label
                          >
                        </div>
                        <div class="between-area">
                          <span class="text-accent msg-error" v-if="msg.username">{{ msg.username }}</span>
                        </div>
                        <div class="inputContainer" align="right">
                          <input
                            id="password_id"
                            v-model="password"
                            :type="isPwd ? 'password' : 'text'"
                            class="input"
                            placeholder="Password"
                            required
                          />
                          <label for="password_id" class="label">
                            <q-icon name="key" class="input-icon" />
                            <span class="input-label q-ml-xs">Password</span>
                          </label>
                          <q-icon
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer after-input-icon"
                            @click="isPwd = !isPwd"
                          />
                        </div>
                        <div class="between-area">
                          <span class="text-accent msg-error" v-if="msg.password">{{ msg.password }}</span>
                        </div>
                        <p v-if="error" class="q-mb-none text-red">{{ error }}</p>
                        <q-btn label="Sign in" type="submit" color="primary" />
                      </q-form>
                      <q-card class="col" flat bordered> </q-card>
                      <div class="text-grey-3 q-mt-md row justify-between">
                        <p>Don't have an account yet?</p>
                        <router-link class="link text-primary" to="/register">Create Account</router-link>
                      </div>
                    </q-card-section>
                  </div>
                  <Otp v-show="isOtp" @login="goLogin" :error="error" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'
import Otp from 'src/components/otp.vue'

export default {
  components: { Otp },
  name: 'pageLogin',
  data() {
    return {
      username: '',
      password: '',
      error: null,
      isPwd: true,
      isOtp: false,
      otp: '',
      msg: [],
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
  methods: {
    ...mapActions({
      login: 'user/login',
    }),
    async goLogin(otpString) {
      const { error, data } = await this.login({
        username: this.username,
        password: this.password,
        isOtp: this.isOtp,
        otp: otpString,
      })
      if (error) {
        this.error = error.message
        return
      }
      if (data.otp) {
        this.isOtp = true
        return
      }
      this.$router.push({ path: '/dashboard' })
    },
    validateRequiredField(name, value) {
      if (value && value.length > 0) {
        this.msg[name] = ''
        return
      }
      this.msg[name] = 'Please enter your ' + name
    },
  },
  watch: {
    username(value) {
      this.username = value
      this.validateRequiredField('username', value)
    },
    password(value) {
      this.password = value
      this.validateRequiredField('password', value)
    },
  },
}
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
