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
      :class="
        pagination.rowsNumber <= pagination.rowsPerPage || pagination.rowsPerPage == 0 ? 'hide-pagination-number' : ''
      "
      :rows-per-page-options="rppOptions"
      :loading="loading"
      :filter="KeySearch"
      @request="onRequest"
      @row-click="(_, row) => goToDetail(row.id)"
    >
      <template v-slot:top-left>
        <div class="center-row">
          <div class="text-h6 title-case">User List</div>
          <q-icon size="xs" color="green" class="q-ml-md" name="fiber_manual_record" />
          <span>Working</span>
          <q-icon size="xs" color="orange" class="q-ml-sm" name="fiber_manual_record" />
          <span>Pausing</span>
        </div>
      </template>
      <template v-slot:pagination>
        <custom-pagination :pagination="pagination" :color="'primary'" />
      </template>
      <template v-slot:body-cell-userName="props">
        <q-td :props="props">
          <span class="q-pl-sm text-size-15">{{ props.row.userName }}</span>
          <q-icon
            v-if="props.row.working"
            size="xs"
            :color="props.row.pausing ? 'orange' : 'green'"
            class="q-ml-sm"
            name="fiber_manual_record"
          />
        </q-td>
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
import { pathParamsToPaging, pagingToPathParams, defaultPaging, getRppOps } from 'src/helper/paging'
import { PAYMENT_TYPES } from '../../../consts/paymentType'
import { date } from 'quasar'
import customPagination from 'src/components/common/custom_pagination.vue'
import MTime from 'components/common/mTime'
import { listenSocketEvent, removeListenSocketEvent } from 'src/helper/socket'

export default {
  name: 'adminUserList',
  props: {
    type: String,
  },
  components: {
    customPagination,
    MTime,
  },
  created() {
    listenSocketEvent('reloadUserList', this.onSocketMessage)
  },
  beforeUnmount() {
    removeListenSocketEvent('reloadUserList', this.onSocketMessage)
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
          align: 'left',
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
          name: 'shopName',
          align: 'center',
          label: 'Shop Name',
          field: 'shopName',
          sortable: false,
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
      rppDefaultOptions: [0, 5, 10, 15, 30, 50],
      rppOptions: [0, 5, 10, 15, 20],
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const filter = pathParamsToPaging(to, this.pagination, true)
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
          this.rppOptions = getRppOps(this.rppDefaultOptions, count)
        })
        .catch((err) => {
          this.loading = false
        })
    },
    goToDetail(id) {
      this.$router.push({ path: `/users/${id}` })
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      query.s = props.filter
      this.$router.push({
        path: this.$route.fullPath,
        query,
      })
    },
    onSocketMessage(data) {
      const userId = data.UserId
      const working = data.Working
      const pausing = data.Pausing
      if (!userId || userId < 1) {
        return
      }
      var existUser
      var existIndex
      this.rows.forEach((user, index) => {
        if (user.id == userId) {
          existUser = user
          existIndex = index
        }
      })
      if (existUser) {
        existUser.working = working
        existUser.pausing = pausing
        this.rows[existIndex] = existUser
      }
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
