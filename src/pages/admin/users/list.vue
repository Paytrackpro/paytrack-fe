<template>
  <div class="q-pa-lg">
    <q-table
      title="User List"
      :rows="rows"
      :columns="columns"
      row-key="name"
      flat
      separator="none"
      v-model:pagination="pagination"
      :hide-pagination="pagination.rowsNumber < 10"
      :class="pagination.rowsNumber <= pagination.rowsPerPage ? 'hide-pagination-number' : ''"
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
      <template v-slot:body-cell-lastSeen="props">
        <q-td :props="props">
          <m-time :time="props.row.lastSeen"></m-time>
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
    </q-table>
  </div>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from 'src/helper/paging'
import { PAYMENT_TYPES } from '../../../consts/paymentType'
import { date } from 'quasar'
import customPagination from 'src/components/common/custom_pagination.vue'
import MTime from 'components/common/mTime'

export default {
  name: 'adminUserList',
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
          name: 'userName',
          required: true,
          label: 'User Name',
          align: 'center',
          field: (row) => row.userName,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: 'displayName',
          align: 'center',
          label: 'Dislay Name',
          field: 'displayName',
          sortable: true,
        },
        {
          name: 'email',
          align: 'center',
          label: 'Email',
          field: 'email',
          sortable: true,
        },
        {
          name: 'paymentType',
          align: 'center',
          label: 'Payment Type',
          field: 'paymentType',
          sortable: false,
          format: (val) => {
            if (val == PAYMENT_TYPES.BTC) return 'BTC'
            if (val == PAYMENT_TYPES.LTC) return 'LTC'
            if (val == PAYMENT_TYPES.DCR) return 'DCR'
          },
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
          name: 'lastSeen',
          align: 'center',
          label: 'Last Seen',
          field: 'lastSeen',
          sortable: true,
          format: (val) => date.formatDate(val, 'MM/DD/YYYY'),
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
        this.getUserList({
          ...filter,
          requestType: this.type,
        })
      },
    },
  },
  methods: {
    async getUserList(f) {
      this.loading = true
      this.$api
        .get('/admin/user/list', {
          params: f,
        })
        .then(({ users, count }) => {
          this.rows = users || []
          this.pagination.rowsNumber = count
          this.loading = false
        })
        .catch((err) => {
          this.loading = false
        })
    },
    goToDetail(id) {
      this.$router.push({ name: 'user.detail', params: { id } })
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      query.s = props.filter
      this.$router.push({
        path: this.$route.fullPath,
        query,
      })
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
