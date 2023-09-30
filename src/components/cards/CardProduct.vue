<template>
  <q-card class="no-shadow" bordered>
    <q-img class="homepage-product" :src="productImage"> </q-img>
    <q-card-section>
      <q-btn
        fab
        color="primary"
        icon="fas fa-cart-plus"
        padding="sm"
        class="absolute"
        style="top: 0; right: 12px; transform: translateY(-50%)"
      />
    </q-card-section>
    <q-card-section class="product-title">
      <div class="text-size-14">
        {{ data.productName }}
      </div>
    </q-card-section>
    <q-card-section class="product-price">
      <div class="col-12">
        <span class="text-size-23 text-weight-medium text-accent">{{ priceDisplay() }}</span>
      </div>
    </q-card-section>
    <q-card-section class="product-owner-icon">
      <q-icon name="account_circle" color="grey-4" size="sm" />
      <span class="q-ml-xs text-size-13 text-grey-3">{{ data.ownerName }}</span>
    </q-card-section>
  </q-card>
</template>

<script>
import { CURRENCY } from 'src/consts/common'
export default {
  name: 'CardProduct',
  props: {
    data: Object,
    productImage: String,
  },
  methods: {
    priceDisplay() {
      if (this.data.currency == 'USD' || this.data.currency == 'EURO') {
        return this.getCurrencySymbol(this.data.currency) + ' ' + this.data.price
      }
      return this.data.price + ' ' + this.getCurrencySymbol(this.data.currency)
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
  },
}
</script>
