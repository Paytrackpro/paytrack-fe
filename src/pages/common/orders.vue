<template>
  <div>
    <q-btn flat icon="undo" type="button" color="primary" class="btn-animated btn q-mb-md btn-radius" @click="back">
      <q-tooltip> Back to Homepage </q-tooltip>
    </q-btn>
    <q-card-section class="card-header q-pa-sm">
      <div class="row justify-between">
        <div class="text-h6 title-case q-pt-sm q-mb-sm">My Orders</div>
      </div>
    </q-card-section>
    <div class="row q-col-gutter-sm cart-products-area" v-if="orderData.length > 0">
      <div v-for="(order, index) in orderData" :key="index" class="owner-card">
        <div class="col-12 q-pa-sm shadow-primary">
          <div class="row justify-between">
            <div class="q-pa-sm">
              <q-icon name="account_circle" class="q-ml-sm" color="primary" size="sm" />
              <span class="q-ml-xs text-size-15 text-primary text-weight-medium">{{ order.ownerName }}</span> &nbsp;|
              <m-time :time="order.createdAt" class="q-ml-sm"></m-time>
              <q-chip
                class="sm-chip q-ml-sm"
                square
                text-color="white"
                :color="order.paymentStatus == 1 ? 'positive' : 'warning'"
                :icon="order.paymentStatus == 1 ? 'check_circle' : 'schedule'"
              >
                {{ order.paymentStatus == 1 ? 'Paid' : 'Unpaid' }}
              </q-chip>
            </div>
            <div class="q-pa-sm row">
              <p class="text-size-16 text-primary text-weight-medium">Total Payment:</p>
              <p
                class="text-size-16 text-accent"
                v-for="(orderCurrency, currencyIndex) in orderCurrencies[order.orderId]"
                :key="currencyIndex"
              >
                <span class="q-ml-sm" v-if="currencyIndex > 0">|</span>
                &nbsp;{{ orderAmount(orderCurrency, order.productPaymentsDisplay) }}
              </p>
            </div>
          </div>
          <q-separator />
          <div class="col-12">
            <div v-for="(product, proIndex) in order.productPaymentsDisplay" :key="proIndex">
              <div class="row q-my-sm q-pa-sm cart-row">
                <q-img
                  :src="getAvatarSrc(product.avatarBase64)"
                  style="width: 100%; max-width: 70px"
                  class="q-ml-md col-4 col-lg-1 col-sm-1 col-md-3 col-xs-6"
                ></q-img>
                <p class="q-ml-lg col-8 col-lg-4 col-sm-3 col-md-4 product-title">{{ product.productName }}</p>
                <p class="q-ml-lg col-3 col-sm-1 col-md-1">{{ priceDisplay(product.price, product.currency) }}</p>
                <p class="col-2 col-sm-1 col-md-1">{{ product.quantity }}</p>
                <p class="q-ml-lg col-2 col-sm-1 col-md-1 text-accent">
                  {{ priceDisplay(product.price * product.quantity, product.currency) }}
                </p>
                <div class="col-2 col-sm-1 col-md-1" v-if="proIndex == 0">
                  <q-btn
                    label="Detail"
                    type="button"
                    color="primary"
                    class="btn btn-animated detail-btn"
                    @click="goDetail(order.orderId)"
                  />
                </div>
                <div class="col-2 col-sm-1 col-md-1" v-if="proIndex != 0"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-sm q-ma-sm" v-if="orderData.length == 0">There are no orders displayed</div>
  </div>
</template>

<script>
import { CURRENCY } from 'src/consts/common'
import { mapGetters } from 'vuex'
import MTime from 'components/common/mTime'
export default {
  name: 'cartPage',
  components: {
    MTime,
  },
  data() {
    return {
      orderData: [],
      orderCurrencies: {},
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.$api
        .get(`/order/my-orders`)
        .then((data) => {
          this.loading = false
          if (data != null) {
            this.orderData = data
            this.initOrderCurrencies(data)
          }
        })
        .catch((err) => {
          this.loading = false
          this.$q.notify({
            message: 'Error: ' + err.status,
            type: 'negative',
          })
        })
    },
    initOrderCurrencies(data) {
      data.forEach((order, index) => {
        let currencies = []
        order.productPaymentsDisplay.forEach((productPayment, i) => {
          if (!currencies.includes(productPayment.currency)) {
            currencies.push(productPayment.currency)
          }
        })
        this.orderCurrencies[order.orderId] = currencies
      })
    },
    getBase64Src(base64) {
      return 'data:image/png;base64,' + base64
    },
    priceDisplay(price, currency) {
      if (currency == 'USD' || currency == 'EURO') {
        return this.getCurrencySymbol(currency) + ' ' + price
      }
      return price + ' ' + this.getCurrencySymbol(currency)
    },
    getCurrencySymbol(currency) {
      let symbol = ''
      CURRENCY.forEach((tmpCurrency) => {
        if (currency === tmpCurrency.label) {
          symbol = tmpCurrency.Symbol
          return
        }
      })
      return symbol
    },
    getAvatarSrc(imageBase64) {
      return 'data:image/png;base64,' + imageBase64
    },
    back() {
      this.$router.push({ path: `/home` })
    },
    orderAmount(orderCurrency, productPayment) {
      let sum = 0
      productPayment.forEach((v, i) => {
        if (v.currency == orderCurrency) {
          sum += v.price * v.quantity
        }
      })
      return this.priceDisplay(sum, orderCurrency)
    },
    goDetail(orderId) {
      this.$router.push({ path: `/my-orders/order-detail/${orderId}` })
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
}
</script>

<style scoped></style>
