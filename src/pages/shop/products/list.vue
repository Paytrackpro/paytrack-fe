<template>
  <div class="q-pa-lg">
    <div class="row q-pb-md">
      <div class="col" align="right">
        <q-btn label="Add Product" icon="add" class="q-mr-sm" color="primary" to="/shop/products/create" />
      </div>
    </div>
    <q-table
      title="Product List"
      :rows="rows"
      :columns="columns"
      row-key="name"
      flat
      separator="none"
      v-model:pagination="pagination"
      :hide-pagination="pagination.rowsNumber < 10"
      :loading="loading"
      :filter="KeySearch"
      @request="onRequest"
      @row-click="(_, row) => goToDetail(row.id)"
    >
      <template v-slot:pagination>
        <custom-pagination :pagination="pagination" :color="'primary'" />
      </template>
      <template v-slot:body-cell-createdAt="props">
        <q-td :props="props">
          <m-time :time="props.row.createdAt"></m-time>
        </q-td>
      </template>
      <template v-slot:top-right>
        <q-input outlined dense debounce="300" v-model="KeySearch" placeholder="Search">
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-avatar="props">
        <q-td :props="props">
          <q-img :src="getAvatarSrc(props.value)" style="height: 80px; max-width: 80px" class="q-mx-xs"></q-img>
        </q-td>
      </template>
      <template v-slot:body-cell-productName="props">
        <q-td :props="props">
          <span class="product-list-title"
            >{{ props.value }}
            <q-tooltip>
              {{ props.value }}
            </q-tooltip></span
          >
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn
            :props="props"
            dense
            round
            flat
            color="accent"
            @click="setDeleteId(props.row.id)"
            icon="delete"
            v-on:click.stop
          >
            <q-tooltip> Hide Or Delete Product </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
    <q-dialog v-model="confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="primary" text-color="white" size="md" />
          <span class="q-ml-sm">Are you sure to delete this product?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat unelevated rounded label="Delete" color="primary" v-close-popup @click="deleteProduct()" />
          <q-btn flat unelevated rounded label="Cancel" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import { date } from 'quasar'
import customPagination from 'src/components/common/custom_pagination.vue'
import MTime from 'components/common/mTime'
import { mapGetters } from 'vuex'

export default {
  name: 'productList',
  props: {
    type: String,
  },
  components: {
    customPagination,
    MTime,
  },
  data() {
    return {
      loading: false,
      KeySearch: '',
      pagination: { ...defaultPaging },
      columns: [
        {
          name: 'productName',
          required: true,
          label: 'Product Name',
          align: 'center',
          field: (row) => row.productName,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: 'avatar',
          required: true,
          label: 'Avatar',
          align: 'center',
          field: (row) => row.avatar,
          format: (val) => `${val}`,
        },
        {
          name: 'price',
          align: 'center',
          label: 'Price',
          field: 'price',
          sortable: true,
        },
        {
          name: 'status',
          align: 'center',
          label: 'Status',
          field: 'status',
          format: (val) => `${this.getStatusView(val)}`,
          sortable: false,
        },
        {
          name: 'currency',
          align: 'center',
          label: 'Currency',
          field: 'currency',
          sortable: true,
        },
        {
          name: 'createdAt',
          align: 'center',
          label: 'Created At',
          field: 'createdAt',
          sortable: true,
          format: (val) => date.formatDate(val, 'MM/DD/YYYY'),
        },
        {
          name: 'action',
          align: 'center',
          label: 'Action',
          field: '',
        },
      ],
      rows: [],
      productImgBase64s: {},
      currentDeleteId: 0,
      confirm: false,
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const filter = pathParamsToPaging(to, this.pagination)
        filter.KeySearch = this.KeySearch
        this.getProductList({
          ...filter,
          OwnerId: this.user.id,
        })
      },
    },
  },
  methods: {
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
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
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
