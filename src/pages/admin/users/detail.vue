<template>
  <q-card flat class="q-ma-lg q-pb-lg q-pr-lg content-container">
    <q-card-section>
      <div class="row">
        <div class="text-h6 title-case">User Update</div>
      </div>
    </q-card-section>
    <q-form @submit="updateUserInfo" class="q-ml-lg">
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-4">
          <custom-input
            :label="'User Name'"
            v-model="userName"
            :placeholder="'Username'"
            lazyRules
            :rules="[(val) => (val && val.length > 0) || 'Please enter username']"
          />
        </div>

        <custom-input :label="'Display Name'" v-model="displayName" :placeholder="'Display name'" />
      </div>
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-4">
          <custom-input
            :label="'Email'"
            v-model="email"
            :placeholder="'Email'"
            lazyRules
            :rules="[(val, rules) => !val || (val && rules.email(val)) || 'Please enter a valid email address']"
          />
        </div>
        <div class="col-12 col-sm-6 col-lg-4">
          <custom-input
            :label="'Password'"
            v-model="password"
            :type="isPwd ? 'password' : 'text'"
            :placeholder="'Password'"
            lazyRules
            :rules="[(val) => !val || val.length == 0 || (val && val.length >= 6) || 'Please use a valid password']"
          >
            <template v-slot:append>
              <q-icon
                v-if="password && password.length > 0"
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </custom-input>
        </div>
      </div>
      <div class="row">
        <q-checkbox class="col-12 col-md-4" v-model="resetTOTP" label="Reset TOTP" />
        <q-checkbox class="col-12 col-md-4" v-model="lockUser" label="Lock User (Disable Login)" />
      </div>
      <div class="row justify-end q-gutter-sm">
        <q-btn label="Save" class="btn btn-animated" type="submit" color="primary" />
      </div>
    </q-form>
  </q-card>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'
import customInput from 'src/components/common/custom_input.vue'
export default {
  name: 'pageUserDetails',
  components: {
    customInput,
  },
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
