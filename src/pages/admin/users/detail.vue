<template>
  <div class="q-ma-lg q-pb-lg q-pr-lg">
    <q-btn flat icon="undo" type="button" color="primary" class="btn-animated btn q-mb-md btn-radius" @click="back">
      <q-tooltip>Back to list page</q-tooltip>
    </q-btn>
    <q-card flat class="content-container q-pb-lg">
      <q-card-section class="card-header w-full">
        <div class="row justify-between items-center">
          <div class="text-h6 title-case">User Update</div>
          <div class="row justify-end">
            <q-btn label="Save" class="btn btn-animated q-mr-md" type="submit" color="primary" />
            <q-btn label="Show Report" class="btn btn-animated" type="button" color="orange" @click="goToReport" />
          </div>
        </div>
      </q-card-section>
      <q-form @submit="updateUserInfo">
        <div class="q-ml-lg q-mt-md">
          <div class="row q-mb-md q-col-gutter-md">
            <div class="col-12 col-sm-6 col-lg-4">
              <custom-input
                :label="'User Name'"
                v-model="userName"
                :placeholder="'Username'"
                lazyRules
                :readonly="true"
                :rules="[(val) => (val && val.length > 0) || 'Please enter username']"
              />
            </div>
            <div class="col-12 col-sm-6 col-lg-4">
              <custom-input :label="'Display Name'" v-model="displayName" :placeholder="'Display name'" />
            </div>
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
          </div>
          <div class="row">
            <q-checkbox class="col-12" v-model="setAsAdmin" label="Administrator role" />
            <q-checkbox class="col-12 col-md-4" v-model="resetTOTP" label="Reset TOTP" />
            <q-checkbox class="col-12 col-md-4" v-model="lockUser" label="Lock User (Disable Login)" />
          </div>
        </div>
      </q-form>
    </q-card>
  </div>
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
      email: '',
      displayName: '',
      setAsAdmin: false,
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
        this.setAsAdmin = data.role == 1
      })
    },
    updateUserInfo() {
      this.$api
        .put(`admin/user/info`, {
          userId: parseInt(this.$route.params.id),
          userName: this.userName,
          email: this.email,
          displayName: this.displayName,
          otp: this.resetTOTP,
          locked: this.lockUser,
          role: this.setAsAdmin ? 1 : 0,
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
    back() {
      this.$router.back()
    },
    goToReport() {
      this.$router.push({ name: 'user.payments.report', params: { userName: this.userName } })
    },
  },
}
</script>
