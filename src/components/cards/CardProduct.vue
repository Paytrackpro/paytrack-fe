<template>
  <q-card class="no-shadow" bordered @click="toProductDetail(data.id)" v-on:click.stop>
    <q-img class="homepage-product" :src="productImage">
      <span class="label bg-secondary text-white shadow-1" v-if="user.id == data.ownerId" style="top: 10px; left: 0px"
        >Your product
      </span>
      <q-tooltip v-if="user.id == data.ownerId">You cannot add to cart with your own products</q-tooltip>
    </q-img>
    <q-card-section v-if="user.id != data.ownerId">
      <q-btn
        fab
        color="primary"
        icon="fas fa-cart-plus"
        padding="sm"
        class="absolute"
        @click.stop.prevent="addToCart()"
        style="top: 0; right: 12px; transform: translateY(-50%)"
      >
        <q-tooltip>Add product to cart</q-tooltip>
      </q-btn>
    </q-card-section>
    <q-card-section :class="getTitleClass()">
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
import { api, axios } from 'boot/axios'
import { mapGetters } from 'vuex'

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
    async addToCart() {
      api
        .post('cart/add-to-cart', {
          OwnerId: this.data.ownerId,
          OwnerName: this.data.ownerName,
          ProductId: this.data.id,
          Quantity: 1,
        })
        .then((data) => {
          this.$q.notify({
            message: 'The product was added to the cart successfully',
            color: 'positive',
            icon: 'check',
          })
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    },
    toProductDetail(id) {
      this.$router.push({ name: 'product.detail', params: { id } })
    },
    getTitleClass() {
      if (this.user.id == this.data.ownerId) {
        return 'product-title title-no-cart-icon'
      }
      return 'product-title'
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
}
</script>
