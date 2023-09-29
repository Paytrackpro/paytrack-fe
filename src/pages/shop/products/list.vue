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
      <template v-slot:body-cell-online="props">
        <q-td :props="props">
          <q-badge rounded :color="props.value ? 'green' : 'grey'" />
        </q-td>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <q-btn :props="props" dense round flat color="primary" @click="editProduct(props)" icon="edit">
            <q-tooltip> Edit Product </q-tooltip>
          </q-btn>
          <q-btn :props="props" dense round flat color="accent" @click="deleteProduct(props)" icon="delete">
            <q-tooltip> Hide Or Delete Product </q-tooltip>
          </q-btn>
        </q-td>
      </template>
    </q-table>
  </div>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import { date } from 'quasar'
import customPagination from 'src/components/common/custom_pagination.vue'
import MTime from 'components/common/mTime'

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
          requestType: this.type,
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
        })
        .catch((err) => {
          this.loading = false
        })
    },
    goToDetail(id) {
      this.$router.push({ name: 'product.detail', params: { id } })
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      query.s = props.filter
      this.$router.push({
        path: this.$route.fullPath,
        query,
      })
    },
    editProduct(props) {},
    deleteProduct(props) {},
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
