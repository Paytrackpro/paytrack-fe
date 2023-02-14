<template>
<q-card flat bordered class="q-pa-md">
  <q-card-section>
    <div class="text-h6">Payment request</div>
  </q-card-section>
  <q-separator inset />
  <payment-detail
    v-show="!loading && !isError && !editing"
    :payment="payment"
    :user="user"
    @edit="editing=true"
    @update="saved"
  />
  <payment-form
    v-if="editing"
    :payment="payment"
    :user="user"
    @saved="saved"
    @cancel="editing = false"
  />
  <q-card-section v-show="isError">
    <div class="text-h6">{{ errorText }}</div>
  </q-card-section>

  <q-inner-loading :showing="loading">
    <q-spinner-gears size="50px" color="primary" class="q-mt-lg"/>
  </q-inner-loading>
</q-card>
</template>

<script>
import {PaymentForm, PaymentDetail} from "components/payment";
import MDate from "components/common/mDate";
export default {
  name: "detailPayment",
  components: {MDate, PaymentForm, PaymentDetail},
  data() {
    let user = localStorage.getItem("user")
    if (typeof(user) == "string" && user.length > 0) {
      user = JSON.parse(user)
    } else {
      user = {}
    }
    return {
      user,
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {}
    }
  },
  created() {
    this.$watch(
      () => this.$route.params,
      () => {
        this.fetchData()
      },
      // fetch the data when the view is created and the data is
      // already being observed
      { immediate: true }
    )
  },
  methods: {
    fetchData() {
      const token = this.$route.query.token || ""
      this.loading = true
      this.$api.get(`/payment/${this.$route.params.id}?token=${token}`, )
        .then(res => {
          this.loading = false
          if (res.data.success) {
            this.payment = res.data.data
          } else {
            // handle error
          }
        })
        .catch(err => {
          this.loading = false
          if (err.response) {
            switch (err.response.status) {
              case 403:
                this.isForbidden = true
                return
              case 404:
                this.isNotfound = true
                return
            }
            this.isUnknownError = true
          }
        })
    },
    saved(data) {
      this.payment = data
    }
  },
  computed: {
    isError: function () {
      return this.isForbidden || this.isNotfound || this.isUnknownError
    },
    errorText: function () {
      if (this.isForbidden) {
        return "You do not have access right to this asset"
      }
      if (this.isNotfound) {
        return "Payment not found"
      }
      return "Unknown error. Please contact the admin"
    }
  }
}
</script>

<style scoped>

</style>
