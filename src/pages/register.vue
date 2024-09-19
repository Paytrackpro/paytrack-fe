<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="parent clearfix">
          <div class="bg-illustration">
            <div class="flex flex-center q-mx-auto window-height">
              <div class="justify-center row">
                <q-toolbar-title class="text-white text-bold text-h3 q-mt-xs q-ml-xs"> PAYTRACK.PRO </q-toolbar-title>
              </div>
            </div>
          </div>
          <div class="login">
            <div class="position-relative">
              <div class="flex flex-center q-mx-auto window-height">
                <div class="container justify-center">
                  <q-card-section class="q-pa-lg login-form">
                    <p class="text-h5 text-primary"><b>Create Account</b></p>
                    <p class="login-subtitle text-primary">Please fill register information below</p>
                    <q-form class="form-area" @submit="register">
                      <!-- begin username input -->
                      <div class="inputContainer">
                        <input
                          id="username_id"
                          v-model="username"
                          type="text"
                          class="input"
                          placeholder="Username"
                          @blur="checkingDestination"
                          required
                        />
                        <label for="username_id" class="label">
                          <q-icon name="person" class="input-icon" />
                          <span class="input-label q-ml-xs">Username</span>
                        </label>
                      </div>
                      <div class="between-area">
                        <span class="text-accent msg-error" v-if="msg.username">{{ msg.username }}</span>
                      </div>
                      <!-- end username input -->
                      <!-- begin displayname/company name input -->
                      <div class="inputContainer">
                        <input
                          id="display_name_id"
                          v-model="displayName"
                          type="text"
                          class="input"
                          placeholder="Your Display Name (optional)"
                        />
                        <label for="display_name_id" class="label">
                          <q-icon name="badge" class="input-icon" />
                          <span class="input-label q-ml-xs">Display Name/Company Name (optional)</span>
                        </label>
                      </div>
                      <div class="between-area"></div>
                      <!-- end displayname/company name input -->
                      <!-- begin email input -->
                      <div class="inputContainer">
                        <input
                          id="email_id"
                          v-model="email"
                          type="text"
                          class="input"
                          placeholder="Your email (optional)"
                        />
                        <label for="email_id" class="label">
                          <q-icon name="mail" class="input-icon" />
                          <span class="input-label q-ml-xs">Email (optional)</span></label
                        >
                      </div>
                      <div class="between-area">
                        <span class="text-accent msg-error" v-if="msg.email">{{ msg.email }}</span>
                      </div>
                      <!-- end email input -->
                      <!-- begin password input -->
                      <div class="inputContainer" align="right" v-if="authType == 0">
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
                      <div class="between-area" v-if="authType == 0">
                        <span class="text-accent msg-error" v-if="msg.password">{{ msg.password }}</span>
                      </div>
                      <!-- end password input -->
                      <!-- begin password Confirmation input -->
                      <div class="inputContainer" align="right" v-if="authType == 0">
                        <input
                          id="password_cfm_id"
                          v-model="passwordCfm"
                          :type="isPwd ? 'password' : 'text'"
                          class="input"
                          placeholder="Password confirmation"
                          required
                        />
                        <label for="password_cfm_id" class="label">
                          <q-icon name="join_left" class="input-icon" />
                          <span class="input-label q-ml-xs">Password Confirmation</span>
                        </label>
                        <q-icon
                          v-if="passwordCfm && passwordCfm.length > 0"
                          :name="isPwd ? 'visibility_off' : 'visibility'"
                          class="cursor-pointer after-input-icon"
                          @click="isPwd = !isPwd"
                        />
                      </div>
                      <div class="between-area" v-if="authType == 0">
                        <span class="text-accent msg-error" v-if="msg.passwordCfm">{{ msg.passwordCfm }}</span>
                      </div>
                      <!-- end password Confirmation input -->
                      <p v-if="error" class="q-mb-none text-red">{{ error }}</p>
                      <q-btn label="Create" type="submit" color="primary" :loading="loading" :disable="!allowCreate" />
                    </q-form>
                    <q-card class="col" flat bordered> </q-card>
                    <div class="text-grey-3 q-mt-md row justify-between">
                      <p>Already have an account?</p>
                      <router-link class="link text-primary" to="/login">Sign in</router-link>
                    </div>
                  </q-card-section>
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
import { startRegistration } from '@simplewebauthn/browser'
import { responseError } from 'src/helper/error'
import { mapActions } from 'vuex'
const DESTINATION_CHECK_CHECKING = 1
const DESTINATION_CHECK_FAIL = 2
const DESTINATION_CHECK_DONE = 3
export default {
  name: 'pageRegister',
  data() {
    return {
      username: '',
      displayName: '',
      email: '',
      password: '',
      passwordCfm: '',
      isPwd: true,
      loading: false,
      error: null,
      msg: [],
      authType: 0,
      allowCreate: false,
    }
  },
  created() {
    this.$api
      .get(`/auth/auth-method`)
      .then((data) => {
        this.authType = data
      })
      .catch((err) => {
        responseError(err)
      })
  },
  methods: {
    ...mapActions({
      setLogin: 'user/setLogin',
    }),
    async handlerFinishRegistration(options, sessionKey) {
      let asseResp
      try {
        asseResp = await startRegistration(options.publicKey)
      } catch (error) {
        this.loading = false
        console.log('Conditional UI request was aborted')
        this.cancelRegisterUser(sessionKey)
        return
      }
      this.$api
        .post(
          '/auth/register-finish?sessionKey=' + sessionKey + '&dispName=' + this.displayName + '&email=' + this.email,
          asseResp
        )
        .then((res) => {
          this.setLogin(res)
          this.$router.push({ path: '/approvals' })
        })
        .catch((err) => {
          this.loading = false
          this.cancelRegisterUser(sessionKey)
          responseError(err)
        })
    },
    registerUserPasskey() {
      this.loading = true
      this.$api
        .post('/auth/register-start?username=' + this.username, {})
        .then((res) => {
          const resultData = JSON.parse(res)
          let sessionKey
          let options
          if (resultData) {
            options = resultData.options
            sessionKey = resultData.sessionkey
          }
          if (!options) {
            if (sessionKey && sessionKey != '') {
              this.cancelRegisterUser(sessionKey)
            }
            this.loading = false
            return
          }
          this.handlerFinishRegistration(options, sessionKey)
        })
        .catch((err) => {
          this.loading = false
          responseError(err)
        })
    },
    register() {
      if (!this.isValidUsername(this.username) || !this.isValidEmail(this.email)) {
        return
      }
      if (this.authType == 1) {
        this.registerUserPasskey()
        return
      }
      if (!this.isValidPassword(this.password) || !this.isValidPasswordCfm(this.passwordCfm)) {
        return
      }
      this.$store
        .dispatch('user/register', {
          username: this.username,
          password: this.password,
          ...(this.displayName && { displayName: this.displayName }),
          ...(this.email && { email: this.email }),
        })
        .then(() => {
          this.$q.notify({
            message: 'Your account was created. You will now be redirected to the login page.',
            color: 'positive',
            icon: 'check',
          })
          this.$router.push({ path: '/login' })
        })
        .catch((error) => {
          this.error = error.response ? error.response.data.message : error.message
        })
    },
    checkingDestination($e) {
      // checking
      let status = DESTINATION_CHECK_CHECKING
      this.$api
        .get(`/auth/username-checking?userName=` + this.username)
        .then(({ found, id, userName, message }) => {
          status = DESTINATION_CHECK_DONE
          if (found) {
            this.msg['username'] = 'Username already exists'
            this.allowCreate = false
          } else {
            this.msg['username'] = ''
            this.allowCreate = true
          }
        })
        .catch(() => {
          this.status = DESTINATION_CHECK_FAIL
          this.msg['username'] = 'Check username failed'
          this.allowCreate = false
        })
    },
    cancelRegisterUser(sessionKey) {
      this.$api
        .post('/auth/cancel-register?sessionKey=' + sessionKey)
        .then((res) => {
          console.log('cancel register successfully')
        })
        .catch((err) => {
          responseError(err)
        })
    },
    validateUsername(value) {
      if (this.isValidUsername(value)) {
        this.msg['username'] = ''
        return
      }
      this.msg['username'] = 'Please enter your username'
    },
    validatePasswordField(value) {
      if (this.isValidPassword(value)) {
        this.msg['password'] = ''
        return
      }
      this.msg['password'] = 'Password must be at least 6 characters. Please re-enter your password'
    },
    validateEmail(value) {
      if (this.isValidEmail(value)) {
        this.msg['email'] = ''
        return
      }
      this.msg['email'] = 'Please enter a valid email address'
    },
    validatePasswordConfirm(value) {
      if (this.isValidPasswordCfm(value)) {
        this.msg['passwordCfm'] = ''
        return
      }
      this.msg['passwordCfm'] = 'Password confirmation does not match'
    },
    isValidEmail(value) {
      return !value || (value && /^[^@]+@\w+(\.\w+)+\w$/.test(value))
    },
    isValidUsername(value) {
      return value && value.length > 0
    },
    isValidPassword(value) {
      return value && value.length >= 6
    },
    isValidPasswordCfm(value) {
      return !value || (value && value === this.password)
    },
  },
  watch: {
    username(value) {
      this.username = value
      this.validateUsername(value)
    },
    password(value) {
      this.password = value
      this.validatePasswordField(value)
    },
    email(value) {
      this.email = value
      this.validateEmail(value)
    },
    passwordCfm(value) {
      this.passwordCfm = value
      this.validatePasswordConfirm(value)
    },
  },
}
</script>
