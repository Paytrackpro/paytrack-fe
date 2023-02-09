<template>
<q-card flat bordered class="q-pa-md">
  <q-card-section>
    <div class="text-h6">Payment request</div>
  </q-card-section>
  <q-separator inset />
  <payment-detail
    v-show="!loading && !isError && (!forming || processable)"
    :payment="payment"
    :processable="processable"
  />
  <payment-form
    v-if="forming && editable"
    :payment="payment"
    @saved="saved"
    @cancel="forming = false"
  />
  <q-card-section v-show="isError">
    <div class="text-h6">{{ errorText }}</div>
  </q-card-section>

  <div v-show="!loading && !forming" class="row justify-end">
    <q-btn v-if="processable" label="Process Payment" type="button" color="primary" @click="forming = true"></q-btn>
    <q-btn v-if="editable" label="Edit" type="button" color="primary" @click="forming = true"/>
    <q-btn label="Cancel" type="button" color="white" text-color="black" @click="$router.push({ name: 'payment.list' })"/>
  </div>

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
    if (user !== undefined && user.length > 0) {
      user = JSON.parse(user)
    } else {
      user = {}
    }
    return {
      user,
      loading: false,
      forming: false,
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
      this.payment = data.payment
      this.forming = false
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
    },
    editable() {
      return this.payment.status === "created" && this.payment.requesterId === this.user.id;
    },
    processable() {
      return this.payment.status === "created" && (this.payment.senderId === this.user.id || this.$route.query.token)
    }
  }
}
</script>

<style scoped>

</style>
