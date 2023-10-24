<template>
  <div class="q-pa-lg">
    <q-card-section class="card-header q-pa-sm">
      <div class="row justify-between">
        <div class="text-h6 title-case q-pt-sm q-mb-sm">Cart Page</div>
        <div class="row align-center">
          <p class="text-weight-medium text-primary">Total:</p>
          <p class="text-weight-medium text-primary" v-for="(currency, i) in currencyChoose" :key="i">
            <span class="q-ml-sm" v-if="i > 0">|</span>
            &nbsp;{{ totalPriceDisplay(currency) }}
          </p>
          <q-btn label="Checkout" type="button" color="primary" class="q-mx-sm btn btn-animated" />
        </div>
      </div>
    </q-card-section>
    <div class="row q-col-gutter-sm cart-products-area">
      <div class="col-12 q-pa-sm" v-for="(ownerId, index) in ownerIds" :key="index">
        <div class="row shadow-primary">
          <div class="col-12 cart-owner-header q-pa-sm">
            <q-checkbox v-model="ownerCheckboxs[index]" size="sm" @click="ownerCheckAll(ownerId, index)" />
            <q-icon name="account_circle" class="q-ml-sm" color="grey-4" size="sm" />
            <span class="q-ml-xs text-size-15 text-grey-3">{{ getOwnerName(cartData[ownerId]) }}</span>
          </div>
          <div class="col-12" v-for="(cart, cartIndex) in cartData[ownerId]" :key="cartIndex">
            <div class="row q-my-sm q-pa-sm cart-row">
              <q-checkbox
                v-model="productCheckbox[ownerId][cartIndex]"
                size="sm"
                @click="oneProductChecked(ownerId, index)"
              />
              <q-img
                :src="getAvatarSrc(cart.avatarBase64)"
                style="width: 100%; max-width: 70px"
                class="q-ml-md col-4 col-lg-1 col-sm-1 col-md-3 col-xs-6"
              ></q-img>
              <p class="q-ml-lg col-8 col-lg-4 col-sm-3 col-md-4 product-title">{{ cart.productName }}</p>
              <p class="q-ml-lg col-3 col-sm-1 col-md-1">{{ priceDisplay(cart.price, cart.currency) }}</p>
              <div class="col-2 col-sm-2 col-md-2">
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
                  v-on:blur="updateCart(cart, index, cartIndex)"
                  @focus="saveBeforeQuantity(cart)"
                  :rules="[
                    (val) =>
                      val <= cart.stock || 'Order quantity cannot be greater than stock (' + cart.stock + ' products)',
                  ]"
                />
              </div>
              <p class="q-ml-lg col-2 col-sm-1 col-md-1 text-accent">
                {{ priceDisplay(cart.price * cart.quantity, cart.currency) }}
              </p>
              <q-btn
                class="col-1 col-md-1 col-sm-1"
                dense
                flat
                color="accent"
                icon="delete"
                @click="setDeleteCart(cart)"
              >
                <q-tooltip> Delete Product </q-tooltip>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <div class="row shadow-primary summary-area">sdgsdg</div> -->
  </div>
  <q-dialog v-model="confirm" persistent>
    <q-card>
      <q-card-section class="row items-center">
        <q-avatar icon="warning" color="primary" text-color="white" size="md" />
        <span class="q-ml-sm">Are you sure to delete this product in your cart?</span>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          flat
          unelevated
          rounded
          label="Delete"
          color="primary"
          v-close-popup
          @click="deleteCart(deleteProductId)"
        />
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
      ownerCheckboxs: [],
      cartData: {},
      productCheckbox: {},
      beforeQuantity: 0,
      confirm: false,
      checkbox: false,
      deleteProductId: 0,
      selectedProductIds: [],
      currencyChoose: [],
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
          this.ownerIds.forEach((v, i) => {
            this.ownerCheckboxs.push(false)
            let products = []
            this.cartData[v].forEach((cart, j) => {
              if (!this.currencyChoose.includes(cart.currency)) {
                this.currencyChoose.push(cart.currency)
              }
              products.push(false)
            })
            this.productCheckbox[v] = products
          })
        })
        .catch((err) => {
          this.loading = false
          this.$q.notify({
            message: 'Error: ' + err.status,
            type: 'negative',
          })
        })
    },
    ownerCheckAll(ownerId, index) {
      this.productCheckbox[ownerId].forEach((v, i) => {
        this.productCheckbox[ownerId][i] = this.ownerCheckboxs[index]
      })
    },
    oneProductChecked(ownerId, index) {
      let notAll = false
      this.productCheckbox[ownerId].forEach((v, i) => {
        if (!v) {
          notAll = true
        }
      })
      this.ownerCheckboxs[index] = !notAll
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
    updateCart(cart, ownerIndex, cartIndex) {
      if (cart.quantity > cart.stock || this.beforeQuantity == cart.quantity) {
        return
      }
      if (cart.quantity <= 0) {
        this.deleteCart(cart.productId)
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
    deleteCart(delProductId) {
      this.$api
        .delete(`/cart/delete`, {
          params: { productId: delProductId },
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
    totalPriceDisplay(currency) {
      let sum = 0
      this.ownerIds.forEach((v, i) => {
        this.cartData[v].forEach((cart, cartIndex) => {
          if (this.productCheckbox[v][cartIndex] && cart.currency == currency) {
            sum += cart.price * cart.quantity
          }
        })
      })
      return this.priceDisplay(sum, currency)
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    totalPay() {
      let sum = 0
      this.ownerIds.forEach((v, i) => {
        this.cartData[v].forEach((cart, cartIndex) => {
          if (this.productCheckbox[v][cartIndex]) {
            sum += cart.price * cart.quantity
          }
        })
      })
      return sum
    },
  },
}
</script>

<style scoped></style>
