<template>
  <q-card flat bordered class="q-pa-md">
    <q-form @submit="updateUserInfo">
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-md-9">
          <p class="q-mt-none q-mb-xs text-weight-medium">User Name</p>
          <p class="q-mt-none q-mb-xs">{{ userName }}</p>
        </div>
      </div>
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-4 col-md-3">
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
        <div class="col-4 col-md-3">
          <p class="q-mt-none q-mb-xs text-weight-medium">Email</p>
          <q-input v-model="email" placeholder="Email" outlined dense lazy-rules stack-label hide-bottom-space>
          </q-input>
        </div>
        <div class="col-4 col-md-3">
          <p class="q-mt-none q-mb-xs text-weight-medium">Payment Type</p>
          <q-select
            v-model="paymentType"
            :options="paymentTypeOptions"
            placeholder="Payment Type"
            option-value="value"
            option-label="label"
            emit-value
            map-options
            outlined
            dense
            stack-label
            hide-bottom-space
          >
          </q-select>
        </div>
      </div>
      <div class="row q-mb-lg q-col-gutter-md">
        <div class="col-12 col-md-9">
          <p class="q-mt-none q-mb-xs text-weight-medium">Payment Address</p>
          <q-input
            v-model="paymentAddress"
            placeholder="Payment Address"
            outlined
            dense
            lazy-rules
            stack-label
            hide-bottom-space
          >
          </q-input>
        </div>
      </div>
      <div class="row justify-end">
        <q-btn label="Save" type="submit" color="primary" />
      </div>
    </q-form>
  </q-card>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS } from "../../../consts/paymentType"

export default {
  data() {
    return {
      paymentTypeOptions: PAYMENT_TYPE_OPTIONS,
      userName: "",
      email: "",
      displayName: "",
      paymentType: null,
      paymentAddress: "",
    }
  },
  computed: {},
  created: function () {
    this.getUserInfo()
  },
  methods: {
    getUserInfo() {
      const id = this.$route.params.id
      this.$api.get(`/admin/user/info/${id}`).then((res) => {
        const result = res.data.data
        this.email = result.email
        this.paymentAddress = result.paymentAddress
        this.paymentType = result.paymenType
        this.userName = result.userName
        this.displayName = result.displayName
      })
    },
    updateUserInfo() {
      this.$api
        .put(`user/info`, {
          id: parseInt(this.$route.params.id),
          email: this.email,
          paymentAddress: this.paymentAddress,
          paymentType: this.paymentType,
          userName: this.userName,
          displayName: this.displayName,
        })
        .then(() => {
          this.$q.notify({
            message: "User saved",
            color: "positive",
            icon: "check",
          })
          this.$router.push({ name: "UserList" })
        })
        .catch(() => {
          this.$q.notify({
            message: "Error",
            color: "negative",
            icon: "alert",
          })
        })
    },
  },
}
</script>
