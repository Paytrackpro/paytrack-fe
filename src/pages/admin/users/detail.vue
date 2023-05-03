<template>
  <q-card flat bordered class="q-pa-md">
    <q-form @submit="updateUserInfo">
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-4">
          <p class="q-mt-none q-mb-xs text-weight-medium">User Name</p>
          <q-input
            v-model="userName"
            placeholder="Username"
            outlined
            dense
            lazy-rules
            stack-label
            :rules="[(val) => (val && val.length > 0) || 'Please enter username']"
            hide-bottom-space
          >
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <p class="q-mt-none q-mb-xs text-weight-medium">Display Name</p>
          <q-input
            v-model="displayName"
            placeholder="Display name"
            outlined
            dense
            lazy-rules
            stack-label
            hide-bottom-space
          >
          </q-input>
        </div>
      </div>
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-4">
          <p class="q-mt-none q-mb-xs text-weight-medium">Email</p>
          <q-input
            v-model="email"
            placeholder="Email"
            outlined
            dense
            lazy-rules
            stack-label
            :rules="[(val, rules) => !val || (val && rules.email(val)) || 'Please enter a valid email address']"
            hide-bottom-space
          >
          </q-input>
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <p class="q-mt-none q-mb-xs text-weight-medium">Password</p>
          <q-input
            :type="isPwd ? 'password' : 'text'"
            v-model="password"
            outlined
            dense
            placeholder="Password"
            lazy-rules
            stack-label
            :rules="[(val) => !val || val.length == 0 || (val && val.length >= 6) || 'Please use a valid password']"
            hide-bottom-space
          >
            <template v-slot:append>
              <q-icon
                v-if="password && password.length > 0"
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </div>
      </div>
      <div class="row">
        <q-checkbox class="col-12 col-md-4" v-model="resetTOTP" label="Reset TOTP" />
        <q-checkbox class="col-12 col-md-4" v-model="lockUser" label="Lock User (Disable Login)" />
      </div>
      <div class="row justify-end q-gutter-sm">
        <q-btn label="Save" type="submit" color="primary" />
      </div>
    </q-form>
  </q-card>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'
export default {
  name: 'pageUserDetails',
  data() {
    return {
      userName: '',
      password: '',
      email: '',
      displayName: '',
      isPwd: true,
      resetTOTP: false,
      lockUser: false,
      confirm: false,
    }
  },
  computed: {},
  created: function () {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      const id = this.$route.params.id
      this.$api.get(`/admin/user/info/${id}`).then((data) => {
        this.email = data.email
        this.userName = data.userName
        this.displayName = data.displayName
        this.lockUser = data.locked
      })
    },
    updateUserInfo() {
      this.$api
        .put(`admin/user/info`, {
          userId: parseInt(this.$route.params.id),
          userName: this.userName,
          password: this.password,
          email: this.email,
          displayName: this.displayName,
          otp: this.resetTOTP,
          locked: this.lockUser,
        })
        .then(() => {
          this.$q.notify({
            message: 'User saved',
            color: 'positive',
            icon: 'check',
          })
          this.$router.push({ name: 'user.list' })
        })
        .catch((err) => {
          responseError(err)
        })
    },
  },
}
</script>
