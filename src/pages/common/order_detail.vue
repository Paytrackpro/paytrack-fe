<template>
  <div class="q-pa-lg">
    <q-btn flat icon="undo" type="button" color="primary" class="btn-animated btn q-mb-md btn-radius" @click="back">
      <q-tooltip> Back to Order List </q-tooltip>
    </q-btn>
    <q-card-section class="card-header q-pa-sm">
      <div class="row justify-between">
        <div class="text-h6 title-case q-pt-sm q-mb-sm">My Order Detail</div>
      </div>
    </q-card-section>
    <div class="row q-col-gutter-sm cart-products-area">
      <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
        <custom-field :label="'Seller'" :value="orderData.ownerName" />
      </div>
      <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
        <custom-field :label="'Phone Number'" :value="orderData.phoneNumber" />
      </div>
      <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
        <custom-field :label="'Address'" :value="orderData.address" />
      </div>
      <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
        <custom-field :label="'Ordered At'" isTime :value="orderData.createdAt" />
      </div>
    </div>
    <div class="col-12">
      <p class="q-mb-xs">
        <b class="text-weight-medium">Billing Information</b>
      </p>
      <div v-for="(product, proIndex) in orderData.productPaymentsDisplay" :key="proIndex">
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
        </div>
      </div>
      <q-separator />
      <div class="row justify-between">
        <div class="col-8 q-pa-sm">
          <div class="row align-center">
            <p class="text-weight-medium">Note:</p>
            &nbsp;
            <p>{{ orderData.memo }}</p>
          </div>
        </div>
        <div class="q-pa-sm">
          <p class="text-size-15 text-weight-medium">Total Amount</p>
          <div class="row">
            <p class="text-weight-medium text-primary" v-for="(currency, curIndex) in orderCurrencies" :key="curIndex">
              <span class="q-ml-sm" v-if="curIndex > 0">|</span>
              &nbsp;{{ orderAmount(currency, orderData.productPaymentsDisplay) }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { CURRENCY } from 'src/consts/common'
import { mapGetters } from 'vuex'
import customField from 'src/components/common/custom_field.vue'
export default {
  name: 'cartPage',
  components: {
    customField,
  },
  data() {
    return {
      orderData: {},
      orderCurrencies: [],
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.$api
        .get(`/order/detail/${this.$route.params.id}`)
        .then((data) => {
          this.loading = false
          this.orderData = data
          this.initOrderCurrencies(data)
        })
        .catch((err) => {
          this.loading = false
          this.errorStatus = err.status
        })
    },
    initOrderCurrencies(data) {
      let currencies = []
      data.productPaymentsDisplay.forEach((productPayment, i) => {
        if (!currencies.includes(productPayment.currency)) {
          currencies.push(productPayment.currency)
        }
      })
      this.orderCurrencies = currencies
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
      this.$router.push({ path: `/my-orders` })
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
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
}
</script>

<style scoped></style>
