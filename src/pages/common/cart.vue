<template>
  <div class="q-pa-lg">
    <q-card-section class="card-header q-pa-sm">
      <div class="row">
        <div class="text-h6 title-case q-pt-sm">Cart Page</div>
      </div>
    </q-card-section>
    <div class="row q-col-gutter-sm">
      <div class="col-12 q-pa-sm" v-for="(ownerId, index) in ownerIds" :key="index">
        <div class="row shadow-primary">
          <div class="col-12 cart-owner-header q-pa-sm">
            <q-checkbox v-model="checkbox" size="sm" />
            <q-icon name="account_circle" class="q-ml-sm" color="grey-4" size="sm" />
            <span class="q-ml-xs text-size-15 text-grey-3">{{ getOwnerName(cartData[ownerId]) }}</span>
          </div>
          <div class="col-12" v-for="(cart, cartIndex) in cartData[ownerId]" :key="cartIndex">
            <div class="row q-my-sm q-py-md cart-row">
              <q-checkbox v-model="checkbox" size="sm" />
              <q-img
                :src="getAvatarSrc(cart.avatarBase64)"
                style="height: 100px; max-width: 100px"
                class="q-ml-md col-1"
              ></q-img>
              <p class="q-ml-lg col-4">{{ cart.productName }}</p>
              <p class="q-ml-lg col-1">{{ priceDisplay(cart.price, cart.currency) }}</p>
              <div class="col-2">
                <q-input
                  color="primary"
                  class="q-mr-sm"
                  outlined
                  lazy-rules
                  v-model="cart.quantity"
                  auto
                  type="number"
                  style="max-width: 150px"
                  dense
                  v-on:blur="updateCart(cart)"
                  @focus="saveBeforeQuantity(cart)"
                  :rules="[
                    (val) =>
                      val <= cart.stock || 'Order quantity cannot be greater than stock (' + cart.stock + ' products)',
                  ]"
                />
              </div>
              <p class="q-ml-lg col-2 text-accent">{{ priceDisplay(cart.price * cart.quantity, cart.currency) }}</p>
              <q-btn class="col-1" dense flat color="accent" icon="delete" @click="setDeleteCart(cart)">
                <q-tooltip> Delete Product </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <q-dialog v-model="confirm" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="primary" text-color="white" size="md" />
        <span class="q-ml-sm">Are you sure to delete this product in your cart?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat unelevated rounded label="Delete" color="primary" v-close-popup @click="deleteCart()" />
        <q-btn flat unelevated rounded label="Cancel" color="primary" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { CURRENCY } from 'src/consts/common'
import { mapGetters } from 'vuex'
export default {
  name: 'cartPage',
  data() {
    return {
      ownerIds: [],
      cartData: {},
      checkbox: false,
      beforeQuantity: 0,
      confirm: false,
      deleteProductId: 0,
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.$api
        .get(`/cart/list`)
        .then((data) => {
          this.loading = false
          this.ownerIds = data.ownerIdArr
          this.cartData = data.cartData
        })
        .catch((err) => {
          this.loading = false
          this.$q.notify({
            message: 'Error: ' + err.status,
            type: 'negative',
          })
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
    getOwnerName(cartArr) {
      if (cartArr == null || cartArr.lenght == 0) {
        return ''
      }
      return cartArr[0].ownerName
    },
    getAvatarSrc(imageBase64) {
      return 'data:image/png;base64,' + imageBase64
    },
    updateCart(cart) {
      if (cart.quantity > cart.stock || this.beforeQuantity == cart.quantity) {
        return
      }
      this.$api
        .put(`cart/update`, {
          OwnerId: cart.ownerId,
          ProductId: cart.productId,
          Quantity: Number(cart.quantity),
        })
        .then(() => {
          this.$q.notify({
            message: 'Cart updated',
            color: 'positive',
            icon: 'check',
          })
        })
        .catch((err) => {
          responseError(err)
        })
    },
    saveBeforeQuantity(cart) {
      this.beforeQuantity = cart.quantity
    },
    deleteCart() {
      this.$api
        .delete(`/cart/delete`, {
          params: { productId: this.deleteProductId },
        })
        .then(() => {
          this.$q.notify({
            message: 'Product in your cart has been deleted',
            color: 'positive',
            icon: 'check',
          })
          window.location.reload()
        })
        .catch((err) => {
          responseError(err)
        })
    },
    setDeleteCart(cart) {
      this.deleteProductId = cart.productId
      this.confirm = true
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
