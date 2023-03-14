<template>
<q-card flat bordered class="q-pa-md">
  <q-card-section>
    <div class="text-h6">{{ mainTitle }}</div>
  </q-card-section>
  <q-separator inset />
  <payment-detail
    v-show="!loading && !isError && !editing"
    :payment="payment"
    :payment-type="paymentType"
    :token="token"
    :user="user"
    @edit="editing=true"
    @update="saved"
  />
  <payment-form
    v-if="editing"
    :payment="payment"
    :payment-type="paymentType"
    :user="user"
    :token="token"
    @saved="saved"
    @cancel="editing = false"
  />
  <q-card-section v-show="isError">
    <div class="text-h6">{{ errorText }}</div>
  </q-card-section>

    <q-inner-loading :showing="loading">
      <q-spinner-gears size="50px" color="primary" class="q-mt-lg" />
    </q-inner-loading>
  </q-card>
</template>

<script>
import {PaymentForm, PaymentDetail} from "components/payment";
import MDate from "components/common/mDate";
import {PAYMENT_OBJECT_REMINDER, PAYMENT_OBJECT_REQUEST} from "src/consts/paymentType";
import {mapGetters} from "vuex";
export default {
  name: "detailPaymentPage",
  components: { PaymentForm, PaymentDetail },
  data() {
    return {
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {},
      token: "",
      paymentType: PAYMENT_OBJECT_REQUEST
    }
  },
  created() {
    this.token = this.$route.params.token || "";
    this.fetchData();
  },
  methods: {
    fetchData() {
      const token = this.$route.params.token || ""
      this.loading = true
      this.$api.get(`/payment/${this.$route.params.id}?token=${token}`, )
        .then(data => {
          this.loading = false
          this.payment = data
        })
        .catch(err => {
          this.loading = false
          switch (err.status) {
            case 403:
              this.isForbidden = true
              return
            case 404:
              this.isNotfound = true
              return
          }
          this.isUnknownError = true
        })
    },
    saved(data) {
      this.payment = data
      this.editing = false
    },
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
    }),
    isError: function () {
      return this.isForbidden || this.isNotfound || this.isUnknownError;
    },
    errorText: function () {
      if (this.isForbidden) {
        return "You do not have access right to this asset";
      }
      if (this.isNotfound) {
        return "Payment not found";
      }
      return "Unknown error. Please contact the admin"
    },
    mainTitle() {
      let status = this.payment.status
      if (this.payment.status === "created") {
        status = "draft"
      }
      return status ? `Payment request (${status})` : "Payment request"
    }
  },
  watch: {
    payment: {
      immediate: true,
      handler(to) {
        if (this.user && this.user.id) {
          const userId = this.user.id
          if (userId === to.senderId) {
            this.paymentType = PAYMENT_OBJECT_REMINDER
          } else {
            this.paymentType = PAYMENT_OBJECT_REQUEST
          }
        } else {
          if (to.creatorId === to.senderId) {
            this.paymentType = PAYMENT_OBJECT_REQUEST
          }
          if (to.creatorId === to.receiverId) {
            this.paymentType = PAYMENT_OBJECT_REMINDER
          }
        }
      }
    }
  }
}
</script>

<style scoped></style>
