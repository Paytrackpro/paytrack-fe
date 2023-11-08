<template>
  <q-btn flat icon="undo" type="button" color="primary" class="btn-animated btn q-mb-md btn-radius" @click="back">
    <q-tooltip> {{ isCheckout ? 'Back to Cart Page' : 'Back to Store List' }} </q-tooltip>
  </q-btn>
  <q-card-section class="card-header q-pa-sm">
    <div class="row justify-between">
      <div class="text-h6 title-case q-pt-sm q-mb-sm">{{ isCheckout ? 'Checkout Page' : 'Cart Page' }}</div>
      <div class="row align-center" v-if="ownerIds.length > 0">
        <p class="text-weight-medium text-primary text-size-17">{{ isCheckout ? 'Total Payment:' : 'Total:' }}</p>
        <p class="text-weight-medium text-accent text-size-17" v-for="(currency, i) in currencyChoose" :key="i">
          <span class="q-ml-sm" v-if="i > 0">|</span>
          &nbsp;{{ totalPriceDisplay(currency) }}
        </p>
        <q-btn
          label="Checkout"
          type="button"
          color="primary"
          class="q-mr-sm q-ml-md btn btn-animated"
          @click="goCheckout()"
          v-if="!isCheckout"
        />
        <q-btn
          v-if="isCheckout"
          label="Create Bill"
          type="button"
          color="primary"
          class="q-mx-sm btn btn-animated"
          :disable="address == '' || !validateMobileNumber(phoneNumber)"
          @click="createBill()"
        >
          <q-tooltip v-if="phoneNumber == '' || address == ''">Phone number and address cannot be left blank</q-tooltip>
        </q-btn>
      </div>
    </div>
  </q-card-section>
  <div class="row q-col-gutter-sm cart-products-area" v-if="isCheckout">
    <div class="col-12 q-pa-sm">
      <div class="shadow-primary q-pa-sm">
        <div class="row q-mx-sm q-mt-sm text-primary">
          <q-icon name="location_on" size="sm" class="q-mr-sm"></q-icon>
          <p class="text-weight-medium text-size-16">Delivery Address</p>
        </div>
        <div class="row q-mx-sm q-py-sm q-mt-sm">
          <q-chip class="glossy q-my-sm" square color="teal" text-color="white" icon="person">
            {{ getDisplayName }}
          </q-chip>
          <q-input
            class="q-ml-sm q-my-sm"
            v-model="phoneNumber"
            outlined
            dense
            stack-label
            placeholder="Phone Number"
            :rules="[(val) => validateMobileNumber(val) || 'Please enter a valid phone Number']"
          >
          </q-input>
          <q-input
            class="q-ml-sm col-12 col-sm-6 col-lg-4 q-my-sm"
            v-model="address"
            outlined
            dense
            lazy-rules
            stack-label
            placeholder="Address"
          >
          </q-input>
        </div>
      </div>
    </div>
  </div>
  <div class="row q-col-gutter-sm cart-products-area">
    <div v-for="(ownerId, index) in ownerIds" :key="index" class="owner-card">
      <div class="col-12 q-pa-sm shadow-primary" v-if="ownerDisplay(index)">
        <div class="row">
          <div class="col-12 q-pa-sm">
            <q-checkbox
              v-model="ownerCheckboxs[index]"
              size="sm"
              @click="ownerCheckAll(ownerId, index)"
              v-if="!isCheckout && !ownerCheckboxDisabled[index]"
            />
            <q-icon name="account_circle" class="q-ml-sm" color="grey-4" size="sm" />
            <span class="q-ml-xs text-size-15 text-grey-3">{{ getOwnerName(cartData[ownerId]) }}</span>
            <q-separator />
          </div>
          <div class="col-12">
            <div v-for="(cart, cartIndex) in cartData[ownerId]" :key="cartIndex">
              <div class="row q-my-sm q-pa-sm cart-row" v-if="productDipslay(ownerId, cartIndex)">
                <q-checkbox
                  v-model="productCheckbox[ownerId][cartIndex]"
                  size="sm"
                  @click="oneProductChecked(ownerId, index)"
                  v-if="!isCheckout && !ownerCheckboxDisabled[index]"
                />
                <q-img
                  :src="getAvatarSrc(cart.avatarBase64)"
                  style="width: 100%; max-width: 70px"
                  class="q-ml-md col-4 col-lg-1 col-sm-1 col-md-3 col-xs-6"
                ></q-img>
                <p class="q-ml-lg col-8 col-lg-4 col-sm-3 col-md-4 product-title">{{ cart.productName }}</p>
                <p class="q-ml-lg col-3 col-sm-1 col-md-1">{{ priceDisplay(cart.price, cart.currency) }}</p>
                <div class="col-2 col-sm-2 col-md-2" v-if="!isCheckout">
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
                        val <= cart.stock ||
                        'Order quantity cannot be greater than stock (' + cart.stock + ' products)',
                    ]"
                  />
                </div>
                <p class="col-2 col-sm-2 col-md-2" v-if="isCheckout">{{ cart.quantity }}</p>
                <p class="q-ml-lg col-2 col-sm-1 col-md-1 text-accent">
                  {{ priceDisplay(cart.price * Number(cart.quantity), cart.currency) }}
                </p>
                <q-btn
                  class="col-1 col-md-1 col-sm-1"
                  dense
                  flat
                  color="accent"
                  icon="delete"
                  v-if="!isCheckout"
                  @click="setDeleteCart(cart)"
                >
                  <q-tooltip> Delete Product </q-tooltip>
                </q-btn>
              </div>
            </div>
          </div>
        </div>
        <q-separator v-if="isCheckout" />
        <div class="row justify-between" v-if="isCheckout">
          <div class="col-8 q-pa-sm">
            <div class="row align-center">
              <p class="text-weight-medium">Note</p>
              <q-input
                class="q-ml-sm q-my-sm col-6"
                v-model="ownerNotes[ownerId]"
                outlined
                dense
                lazy-rules
                stack-label
                placeholder="Note for seller"
              >
              </q-input>
            </div>
          </div>
          <div class="q-pa-sm">
            <p class="text-size-15 text-weight-medium">Total Amount</p>
            <div class="row">
              <p
                class="text-weight-medium text-primary"
                v-for="(ownerCurrency, curIndex) in ownerCurrencyChoose[ownerId]"
                :key="curIndex"
              >
                <span class="q-ml-sm" v-if="curIndex > 0">|</span>
                &nbsp;{{ ownerAmount(ownerCurrency, ownerId) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row q-col-gutter-sm q-ma-sm" v-if="ownerIds.length == 0">There are no products displayed</div>
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
      ownerNotes: {},
      cartData: {},
      productCheckbox: {},
      beforeQuantity: 0,
      confirm: false,
      checkbox: false,
      deleteProductId: 0,
      selectedProductIds: [],
      currencyChoose: [],
      ownerCurrencyChoose: {},
      isCheckout: false,
      phoneNumber: '',
      address: '',
      ownerCheckboxDisabled: [],
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
          if (!data.ownerIdArr || !data.cartData) {
            return
          }
          this.ownerIds = data.ownerIdArr || []
          this.cartData = data.cartData || {}
          this.ownerIds.forEach((v, i) => {
            this.ownerCheckboxs.push(false)
            this.ownerCheckboxDisabled.push(false)
            let products = []
            this.cartData[v].forEach((cart, j) => {
              if (!this.currencyChoose.includes(cart.currency)) {
                this.currencyChoose.push(cart.currency)
              }
              products.push(false)
            })
            this.productCheckbox[v] = products
          })
          let buyNowParam = this.$route.params.buyNow
          if (buyNowParam) {
            let params = buyNowParam.split('-')
            if (params.length != 2) {
              return
            }
            let ownerId = Number(params[0])
            let productId = Number(params[1])
            this.cartData[ownerId].forEach((cart, index) => {
              if (cart.productId == productId) {
                this.productCheckbox[ownerId][index] = true
              }
            })
            this.goCheckout()
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
    ownerCheckAll(ownerId, index) {
      this.productCheckbox[ownerId].forEach((v, i) => {
        this.productCheckbox[ownerId][i] = this.ownerCheckboxs[index]
      })
      this.handlerDisableCheckbox()
    },
    oneProductChecked(ownerId, index) {
      let notAll = false
      this.productCheckbox[ownerId].forEach((v, i) => {
        if (!v) {
          notAll = true
        }
      })
      this.ownerCheckboxs[index] = !notAll
      this.handlerDisableCheckbox()
    },
    getCheckIndex() {
      let checkIndex = -1
      this.ownerIds.forEach((v, i) => {
        let localHasCheck = false
        this.productCheckbox[v].forEach((check, j) => {
          if (check) {
            checkIndex = i
            localHasCheck = true
            return
          }
        })
        if (localHasCheck) {
          return
        }
      })
      return checkIndex
    },
    handlerDisableCheckbox() {
      let checkIndex = this.getCheckIndex()
      this.ownerIds.forEach((id, i) => {
        if (checkIndex < 0 || checkIndex == i) {
          this.ownerCheckboxDisabled[i] = false
        } else {
          this.ownerCheckboxDisabled[i] = true
        }
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
      if (cartArr == null || cartArr.length == 0) {
        return ''
      }
      return cartArr[0].ownerName
    },
    getAvatarSrc(imageBase64) {
      return 'data:image/png;base64,' + imageBase64
    },
    updateCart(cart, ownerIndex, cartIndex) {
      if (Number(cart.quantity) > cart.stock || this.beforeQuantity == Number(cart.quantity)) {
        return
      }
      if (Number(cart.quantity) <= 0) {
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
      this.beforeQuantity = Number(cart.quantity)
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
            sum = sum + cart.price * Number(cart.quantity)
          }
        })
      })
      return this.priceDisplay(sum, currency)
    },
    goCheckout() {
      this.ownerIds.forEach((id, i) => {
        this.updateOwnerCurrency(id)
        this.ownerNotes[id] = ''
      })
      this.isCheckout = true
    },
    productDipslay(ownerId, cartIndex) {
      if (!this.isCheckout) {
        return true
      }
      return this.productCheckbox[ownerId][cartIndex]
    },
    ownerDisplay(ownerIndex) {
      if (!this.isCheckout || this.ownerCheckboxs[ownerIndex]) {
        return true
      }
      let result = false
      this.productCheckbox[this.ownerIds[ownerIndex]].forEach((v, i) => {
        if (v) {
          result = true
        }
      })
      return result
    },
    ownerAmount(ownerCurrency, ownerId) {
      let sum = 0
      this.productCheckbox[ownerId].forEach((v, i) => {
        if (v && this.cartData[ownerId][i].currency == ownerCurrency) {
          sum += this.cartData[ownerId][i].price * this.cartData[ownerId][i].quantity
        }
      })
      return this.priceDisplay(sum, ownerCurrency)
    },
    back() {
      if (this.isCheckout) {
        this.isCheckout = false
        return
      }
      this.$router.push({ path: `/stores` })
    },
    updateOwnerCurrency(ownerId) {
      let ownerCurrencies = []
      this.productCheckbox[ownerId].forEach((v, i) => {
        if (v && !ownerCurrencies.includes(this.cartData[ownerId][i].currency)) {
          ownerCurrencies.push(this.cartData[ownerId][i].currency)
        }
      })
      this.ownerCurrencyChoose[ownerId] = ownerCurrencies
    },
    createOrderCode(ownerId) {
      let now = new Date()
      return 'PT' + ownerId + now.getFullYear() + now.getMonth() + now.getDate() + this.randomString(6, '#A')
    },
    randomString(length, chars) {
      var mask = ''
      if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz'
      if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (chars.indexOf('#') > -1) mask += '0123456789'
      var result = ''
      for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)]
      return result
    },
    createBill() {
      let prepareData = []
      this.ownerIds.forEach((ownerId, index) => {
        let ownerProductData = []
        let ownerName = ''
        let shopName = ''
        this.productCheckbox[ownerId].forEach((v, i) => {
          if (v) {
            let cart = this.cartData[ownerId][i]
            ownerName = cart.ownerName
            shopName = cart.shopName
            ownerProductData.push({
              ProductId: cart.productId,
              ProductName: cart.productName,
              Avatar: cart.avatarName,
              Price: cart.price,
              Quantity: Number(cart.quantity),
              Currency: cart.currency,
              Amount: cart.price * Number(cart.quantity),
            })
          }
        })
        if (ownerProductData.length > 0) {
          prepareData.push({
            OrderCode: this.createOrderCode(ownerId),
            OwnerId: ownerId,
            OwnerName: ownerName,
            Shopname: shopName,
            ProductPayments: ownerProductData,
            PhoneNumber: this.phoneNumber,
            Address: this.address,
            Memo: this.ownerNotes[ownerId],
          })
        }
      })

      this.$api
        .post('order/createOrders', { OrderData: prepareData })
        .then((data) => {
          this.$q.notify({
            message: 'Order Create Successfully',
            color: 'positive',
            icon: 'check',
          })
          this.$router.push({ path: `/pay` })
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    },
    validateMobileNumber(phone) {
      const validationRegex = /^\d{10}$/
      return phone.match(validationRegex)
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
            sum += cart.price * Number(cart.quantity)
          }
        })
      })
      return sum
    },
    getDisplayName() {
      if (this.user.displayName == '') {
        return this.user.userName
      }
      return this.user.displayName
    },
  },
}
</script>

<style scoped></style>
