<template>
  <div class="q-pa-lg">
    <q-card-section class="card-header q-pa-sm">
      <div class="row">
        <div class="text-h6 title-case q-pt-sm">Product Detail</div>
      </div>
    </q-card-section>
    <div class="row">
      <div class="col-12 col-sm-6 col-lg-3 q-pr-md q-mt-md">
        <!-- avatar display -->
        <div class="row">
          <div class="col-12">
            <q-img :src="currentShowImgUrl" class="homepage-product"> </q-img>
          </div>
        </div>
        <div class="row">
          <div class="col-3 q-pa-xs cursor-pointer zoom-hover-1-1" @click="showCurrentImage(avatarUrl)">
            <q-img :src="avatarUrl"> </q-img>
          </div>
          <div
            :class="'col-3 q-pa-xs cursor-pointer zoom-hover-1-1'"
            @click="showCurrentImage(imageUrl)"
            v-for="(imageUrl, i) of imagesUrl"
            :key="i"
          >
            <q-img :src="imageUrl"> </q-img>
          </div>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-9 q-pl-md q-pt-md q-mt-md shadow-primary">
        <p class="text-weight-regular text-size-20 q-mb-lg">{{ product.productName }}</p>
        <div class="q-mb-lg">
          <q-icon name="o_account_circle" color="grey-4" size="xs" />
          <span class="q-ml-xs text-size-13 text-grey-4">{{ product.ownerName }}</span>
        </div>
        <span class="text-size-23 text-weight-medium text-accent">{{ priceDisplay() }}</span>
        <div class="row q-mt-lg">
          <p class="q-pt-sm q-mr-sm">Quantity</p>
          <q-input
            color="primary"
            class="q-mr-sm"
            outlined
            lazy-rules
            v-model="quantity"
            auto
            type="number"
            dense
            :disable="isMyProduct()"
            :rules="[(val) => val <= product.stock || 'Order quantity cannot be greater than stock']"
          />
          <p class="q-pt-sm">{{ product.stock }} in stock</p>
        </div>
        <div class="row q-mt-lg align-center">
          <q-btn
            label="Add To Cart"
            color="primary"
            class="btn btn-animated q-mr-sm"
            icon="add_shopping_cart"
            :disable="quantity > product.stock || isMyProduct()"
            @click="addToCart()"
          >
            <q-tooltip> Add product to your cart</q-tooltip>
          </q-btn>
          <q-btn
            label="Buy Now"
            type="button"
            color="accent"
            class="btn btn-animated"
            :disable="quantity > product.stock || isMyProduct()"
          >
            <q-tooltip> Buy now. Go to checkout page immediately </q-tooltip>
          </q-btn>
          <span class="text-accent q-ml-sm" v-if="isMyProduct()">Cannot order your own products</span>
        </div>
        <p class="text-weight-medium text-size-20 q-mt-lg">Description</p>
        <p v-html="product.description" class="q-pa-md"></p>
      </div>
    </div>
    <q-separator class="q-mt-lg" />
    <div>
      <p class="text-weight-regular text-size-20 q-mt-md">Products From The Same Owner</p>
      <product-list :productPerPage="12" :ownerId="product.ownerId" />
    </div>
  </div>
</template>

<script>
import { CURRENCY } from 'src/consts/common'
import productList from 'components/product/productList'
import { api } from 'boot/axios'
import { mapGetters } from 'vuex'
export default {
  name: 'productDetail',
  components: { productList },
  data() {
    return {
      product: {},
      errorStatus: 0,
      currentShowImgUrl: '',
      avatarUrl: '',
      imagesUrl: [],
      quantity: 1,
      sameShopProduct: [],
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.$api
        .get(`/shop/product/info/${this.$route.params.id}`)
        .then((data) => {
          this.loading = false
          this.product = data
          this.setImagesBase64()
        })
        .catch((err) => {
          this.loading = false
          this.$q.notify({
            message: 'Error: ' + err.status,
            type: 'negative',
          })
        })
    },
    async getProductList(f) {
      this.loading = true
      this.$api
        .get('/shop/product/list', {
          params: f,
        })
        .then(({ products, count }) => {
          this.rows = products || []
          this.pagination.rowsNumber = count
          this.loading = false
          this.setAvatarImageMap()
        })
        .catch((err) => {
          this.loading = false
        })
    },
    async setImagesBase64() {
      this.$api
        .get(`/file/base64`, {
          params: {
            avatar: this.product.avatar,
            images: this.product.images,
          },
        })
        .then((data) => {
          //add avatar
          if (this.product.avatar != null && this.product.avatar != '') {
            this.avatarUrl = this.getBase64Src(this.product.avatar, data)
            this.currentShowImgUrl = this.avatarUrl
          }
          //add gallery images
          if (this.product.images != null && this.product.images != '') {
            let imageArr = this.product.images.split(',')
            imageArr.forEach((image) => {
              this.imagesUrl.push(this.getBase64Src(image, data))
            })
          }
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    },
    getBase64Src(imageName, imageBase64Map) {
      return 'data:image/png;base64,' + imageBase64Map[imageName]
    },
    priceDisplay() {
      if (this.product.currency == 'USD' || this.product.currency == 'EURO') {
        return this.getCurrencySymbol(this.product.currency) + ' ' + this.product.price
      }
      return this.product.price + ' ' + this.getCurrencySymbol(this.product.currency)
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
    showCurrentImage(imageUrl) {
      this.currentShowImgUrl = imageUrl
    },
    async addToCart() {
      api
        .post('cart/add-to-cart', {
          OwnerId: this.product.ownerId,
          OwnerName: this.product.ownerName,
          ProductId: this.product.id,
          Quantity: Number(this.quantity),
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
    isMyProduct() {
      return this.user.id == this.product.ownerId
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
  watch: {
    $route(to, from) {
      this.fetchData()
    },
  },
}
</script>

<style scoped></style>
