<template>
  <q-card-section class="card-header">
    <div class="row justify-between">
      <div class="row">
        <div class="text-h6 title-case">{{ isEdit ? 'Update Product' : 'Create New Product' }}</div>
      </div>
      <div class="row q-gutter-sm">
        <q-btn label="Save" color="primary" class="btn btn-animated" :disable="submitting" @click="submit()" />
        <q-btn
          label="Cancel"
          class="btn btn-animated"
          type="button"
          color="white"
          text-color="black"
          @click="cancel()"
        />
      </div>
    </div>
  </q-card-section>
  <q-form @submit="submit" class="q-pa-md" ref="productForm">
    <div class="row q-mb-md">
      <div class="col-12 col-md-6">
        <custom-input
          class="col-12 col-sm-6"
          :label="'Product Name'"
          v-model="inProduct.productName"
          :type="'text'"
          :rules="[(val) => !!val || 'Product name is required']"
        />
      </div>
    </div>
    <div class="row q-my-md">
      <div class="col-12 col-md-6">
        <p class="q-mt-none q-mb-xs text-weight-medium">Description</p>
        <q-editor v-model="descriptionEditor" min-height="12rem" />
      </div>
    </div>
    <div class="row q-my-md">
      <div class="col-12 col-sm-6 col-lg-4">
        <p class="q-mb-xs">
          <b class="text-weight-medium">Currency</b>
        </p>
        <q-select
          v-model="currency"
          :options="currencyOption"
          outlined
          dense
          style="max-width: 250px"
          lazy-rules
          stack-label
          emit-value
          map-options
          borderless
        />
      </div>
      <div class="col-12 col-sm-6 col-lg-8">
        <p class="q-mb-xs">
          <b class="text-weight-medium">Product Information</b>
        </p>
        <div class="row">
          <div class="col-12 col-sm-4">
            <q-field stack-label borderless>
              <template v-slot:control>
                <b>Price&nbsp;&nbsp;</b>
                <q-input
                  color="primary"
                  outlined
                  lazy-rules
                  v-model="inProduct.price"
                  auto
                  stack-label
                  type="number"
                  dense
                  :rules="[(val) => !!val || 'Price is required']"
                >
                  <template v-slot:prepend>
                    <q-icon
                      :name="currency == 'USD' ? 'attach_money' : currency == 'EURO' ? 'euro' : 'currency_bitcoin'"
                    />
                  </template>
                </q-input>
              </template>
            </q-field>
          </div>
          <div class="col-12 col-sm-4">
            <q-field stack-label borderless>
              <template v-slot:control>
                <b>Stock&nbsp;&nbsp;</b>
                <q-input
                  color="primary"
                  outlined
                  lazy-rules
                  v-model="inProduct.stock"
                  auto
                  stack-label
                  type="number"
                  dense
                  :rules="[(val) => !!val || 'Stock is required']"
                >
                </q-input>
              </template>
            </q-field>
          </div>
        </div>
      </div>
    </div>
    <div class="row q-my-md">
      <div class="col-12 col-sm-6">
        <p class="q-mb-xs">
          <b class="text-weight-medium">Images Upload</b>
        </p>
        <div class="row">
          <div class="col-12">
            <q-file
              bottom-slots
              v-model="images"
              label="Upload or drop file here"
              counter
              multiple
              append
              borderless
              accept=".jpg, .png, image/*"
              class="image-uploader"
              @rejected="onRejected"
            >
              <template v-slot:prepend>
                <q-icon name="cloud_upload" @click.stop.prevent />
              </template>
              <template v-slot:append>
                <q-icon
                  v-if="images != null && images.length != 0"
                  name="close"
                  @click.stop.prevent="clearAllFile()"
                  class="cursor-pointer"
                />
              </template>
            </q-file>
          </div>
        </div>
        <div class="row">
          <p v-if="images != null && images.length != 0" class="text-caption text-info">
            Click on an image below to choose as your avatar
          </p>
        </div>
        <div class="row">
          <q-img
            v-for="(image, i) of images"
            :key="i"
            :src="imageUrl(image)"
            spinner-color="white"
            style="height: 100px; max-width: 100px; display: flex; justify-content: center; align-items: center"
            :class="'q-mx-xs cursor-pointer zoom-hover-1-1' + (avatarIndex == i ? ' white-blur' : '')"
            @click="avatarIndex = i"
          >
            <q-icon
              class="absolute all-pointer-events cursor-pointer"
              size="15px"
              name="cancel"
              color="accent"
              style="top: 8px; right: 8px"
              @click="removeImg(i)"
            >
              <q-tooltip> Click to remove image </q-tooltip>
            </q-icon>
            <q-icon
              v-if="avatarIndex == i"
              class="absolute all-pointer-events cursor-pointer"
              size="25px"
              style="top: 37px; left: 37px"
              name="check_circle"
              color="positive"
            >
              <q-tooltip> Chosen as representative photo </q-tooltip>
            </q-icon>
          </q-img>
        </div>
      </div>
    </div>
  </q-form>
</template>

<script>
import customInput from '../common/custom_input.vue'
import { api, axios } from 'boot/axios'
import { CURRENCY } from 'src/consts/common'
import { ref } from 'vue'

export default {
  name: 'productForm',
  components: { customInput },
  props: {
    product: Object,
    user: Object,
    token: String,
    isEdit: Boolean,
  },
  data() {
    return {
      submitting: false,
      inProduct: {},
      priceRules: [
        (v) =>
          (v && v.toString().split('.').length < 2) ||
          (v && v.toString().split('.')[1].length <= 2) ||
          'No more than 2 digits after the decimal point',
      ],
      currency: 'USD',
      images: ref(null),
      imageUrls: [],
      avatarIndex: 0,
      descriptionEditor: ref(''),
      imageNewNameArr: [],
    }
  },
  watch: {
    product: {
      immediate: true,
      handler(newProduct) {
        const product = { ...newProduct }
        this.inProduct = product
      },
    },
  },
  methods: {
    async submit() {
      if (this.submitting) {
        return
      }
      var valid = await this.$refs.productForm.validate()
      if (!valid) {
        return
      }
      const product = { ...this.inProduct }
      product.price = Number(product.price)
      product.stock = Number(product.stock)
      product.currency = this.currency
      product.description = this.descriptionEditor
      this.submitting = true
      let successNotify = 'Product created successfully'
      if (this.images != null && this.images.length > 0) {
        this.createImageNewNames()
        product.avatar = this.imageNewNameArr[this.avatarIndex]
        product.images = this.getGalleryImageNames()
        this.uploadImages()
      }

      if (product.id > 0) {
        successNotify = 'Product updated successfully'
      }
      const { data } = await this.saveProduct(product)
      this.submitting = false
      if (data) {
        this.$q.notify({
          message: successNotify,
          color: 'positive',
          icon: 'check',
        })
        this.$router.push({ path: `/shop/products/list` })
      }
    },
    getGalleryImageNames() {
      let galleryNames = []
      this.images.forEach((image, index) => {
        if (index != this.avatarIndex) {
          galleryNames.push(this.imageNewNameArr[index])
        }
      })
      return galleryNames.join(',')
    },
    createImageNewNames() {
      this.imageNewNameArr = []
      this.images.forEach((image) => {
        let nameArr = image.name.split('.')
        if (nameArr.length < 2) return
        this.imageNewNameArr.push(this.randomString(64, '#aA') + '.' + nameArr[1])
      })
    },
    getImageUrls() {
      if (this.images == null || this.images.length == 0) {
        return ''
      }
      let urls = ''
      this.images.forEach((image, index) => {
        if (this.avatarIndex != index) {
          urls += this.imageUrl(image) + ','
        }
      })
      if (urls.endsWith(',')) {
        urls = urls.split(0, urls.length - 1)
      }
      return urls
    },
    currencyIcon() {
      CURRENCY.forEach((tmpCurrency) => {
        if (this.currency == tmpCurrency.label) {
          return tmpCurrency.icon
        }
      })
      return ''
    },
    clearAllFile() {
      this.images = null
    },
    imageUrl(image) {
      return URL.createObjectURL(image)
    },
    removeImg(index) {
      this.images.splice(index, 1)
    },
    onRejected() {
      this.$q.notify({
        type: 'negative',
        message: `Image extensions are not allowed`,
      })
    },
    cancel() {
      this.$router.push({ path: `/shop/products/list` })
    },
    async saveProduct(product) {
      let url = 'shop/product/create'
      if (product.id > 0) {
        url = `/product/update/${product.id}`
      }
      return api
        .post(url, product)
        .then((data) => {
          return { data }
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    },
    async uploadImages() {
      let formData = new FormData()
      for (var i = 0; i < this.images.length; i++) {
        formData.append('files[' + i + ']', this.images[i])
      }
      formData.set('newImagesName', this.imageNewNameArr.join(';'))
      let headers = {
        'Content-Type': 'multipart/form-data',
      }
      await api.post('/shop/product/upload', formData, headers)
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
  },
  computed: {
    currencyOption() {
      let currencies = []
      CURRENCY.forEach((tmpCurrency) => {
        currencies.push({
          label: tmpCurrency.name + ' (' + tmpCurrency.Symbol + ')',
          value: tmpCurrency.label,
        })
      })
      return currencies
    },
  },
}
</script>

<style scoped></style>
