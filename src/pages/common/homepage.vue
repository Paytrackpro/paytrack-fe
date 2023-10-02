<template>
  <div class="q-pa-lg">
    <q-card-section class="card-header q-mb-md q-pa-sm">
      <div class="row justify-between">
        <div class="text-h6 title-case q-pt-sm">Product List</div>
        <div class="row">
          <q-card class="col-12 no-border no-shadow bg-transparent">
            <q-card-section class="product-search">
              <q-input
                rounded
                v-model="KeySearch"
                outlined
                placeholder="Search Product"
                v-on:keyup.enter="searchProduct()"
              >
                <template v-slot:append>
                  <q-icon v-if="KeySearch === ''" name="search" />
                  <q-icon v-else name="clear" class="cursor-pointer" @click="clearSearch()" />
                </template>
              </q-input>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-card-section>
    <div class="row q-mb-md justify-between">
      <span class="q-pt-xs">Total of {{ pagination.rowsNumber }} products </span>
      <q-pagination
        v-model="pagination.page"
        :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
        direction-links
        outline
        color="primary"
        active-design="unelevated"
      />
    </div>
    <div class="row q-col-gutter-sm">
      <div class="col-md-3 col-lg-2 col-sm-4 col-xs-6" v-for="(product, index) in rows" :key="index">
        <card-product
          class="product-card shadow-primary zoom-hover-1-02"
          :data="product"
          :productImage="getAvatarSrc(product.avatar)"
          @click="toProductDetail(product.id)"
        ></card-product>
      </div>
    </div>
  </div>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import CardProduct from 'components/cards/CardProduct.vue'

export default {
  name: 'productList',
  props: {
    type: String,
  },
  components: { CardProduct },
  data() {
    return {
      loading: false,
      KeySearch: '',
      pagination: { ...defaultPaging },
      rows: [],
      productImgBase64s: {},
      currentDeleteId: 0,
      confirm: false,
      currentPage: 1,
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        this.getProductList()
      },
    },
    pageChange: {
      handler: function (newVal) {
        this.pagination.page = newVal
        this.getProductList()
      },
    },
  },
  methods: {
    async getProductList() {
      this.loading = true
      const filter = pathParamsToPaging({ query: { r: 18, p: this.pagination.page } }, this.pagination)
      this.$api
        .get('/shop/product/list', {
          params: {
            ...filter,
            KeySearch: this.KeySearch,
          },
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
    setAvatarImageMap() {
      if (this.rows.length < 1) return
      let avatars = []
      this.rows.forEach((product) => {
        if (product.avatar != null && product.avatar != '') avatars.push(product.avatar)
      })
      this.getImagesBase64(avatars.join(','))
    },
    goToDetail(id) {
      this.$router.push({ name: 'products.update', params: { id } })
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      query.s = props.filter
      this.$router.push({
        path: this.$route.fullPath,
        query,
      })
    },
    getImagesBase64(imageNames) {
      this.$api
        .get(`/file/img-base64`, {
          params: {
            imageNames: imageNames,
          },
        })
        .then((data) => {
          this.productImgBase64s = data
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    },
    getAvatarSrc(imageName) {
      return 'data:image/png;base64,' + this.productImgBase64s[imageName]
    },
    deleteProduct() {
      this.$api
        .delete(`/shop/product/delete/${this.currentDeleteId}`)
        .then(() => {
          this.$q.notify({
            message: 'Product has been deleted',
            color: 'positive',
            icon: 'check',
          })
          window.location.reload()
        })
        .catch((err) => {
          responseError(err)
        })
    },
    setDeleteId(id) {
      this.currentDeleteId = id
      this.confirm = true
    },
    getStatusView(status) {
      switch (status) {
        case 0:
          return 'Hidden'
        case 1:
          return 'Active'
        case 2:
          return 'Deleted'
        default:
          return ''
      }
    },
    toProductDetail(id) {},
    searchProduct() {
      this.getProductList()
    },
    clearSearch() {
      this.KeySearch = ''
      this.getProductList()
    },
  },
  computed: {
    pageChange() {
      return this.pagination.page
    },
  },
}
</script>
<style lang="scss">
.list-user-header .list-user-icon-sort {
  display: flex;
  width: 100px;
}
.list-user-header:hover .list-user-icon-sort {
  display: block;
}
</style>
