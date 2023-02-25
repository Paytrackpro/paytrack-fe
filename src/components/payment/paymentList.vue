<template>
  <q-table
    title="Payments"
    :loading="loading"
    :data="rows"
    :columns="columns"
    row-key="name"
    :pagination.sync="pagination"
    flat
    bordered
    @row-click="(_, row) => goToDetail(row.id)"
    @request="onRequest"
  >
    <template v-if="isUser" v-slot:top-right>
      <q-btn outline color="secondary" label="Create payment" to="/payment/create" />
    </template>
    <template v-slot:body-cell-online="props">
      <q-td :props="props">
        <q-badge rounded :color="props.value ? 'green' : 'grey'" />
      </q-td>
    </template>
  </q-table>
</template>

<script>
import { pathParamsToPaging, pagingToPathParams, defaultPaging } from "src/helper/paging"
import { date } from "quasar"
import { MDateFormat } from "src/consts/common"
import { mapGetters } from "vuex"
import role from "src/consts/role"

export default {
  name: "list",
  data() {
    return {
      loading: false,
      pagination: { ...defaultPaging },
      columns: [
        {
          name: "receiverName",
          required: true,
          label: "receiver",
          align: "center",
          field: (row) => {
            if (row.creatorId === row.receiverId || row.contactMethod === "internal") {
              return row.receiverName
            }
            return row.externalEmail
          },
          format: (val) => `${val}`,
          sortable: true,
        },
        { name: "senderName", align: "center", label: "sender", field: (row) => {
            if (row.creatorId === row.senderId || row.contactMethod === "internal") {
              return row.senderName
            }
            return row.externalEmail
          }, sortable: true },
        { name: "status", align: "center", label: "status", field: "status", sortable: true },
        {
          name: "amount",
          align: "center",
          label: "amount(USD)",
          field: "amount",
          format: (val) => {
            return val
          },
        },
        {
          name: "createdAt",
          align: "center",
          label: "Created At",
          field: "createdAt",
          format: (val) => date.formatDate(val, MDateFormat),
        },
      ],
      rows: [],
    }
  },
  props: {
    type: String,
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
    isUser() {
      return this.user.role === role.USER
    },
  },
  methods: {
    async getPayments(f) {
      this.loading = true
      this.$api.get("/payment/list", {
        params: f
      }).then((res) => {
        this.loading = false
        this.rows = res.data.data.payments
        this.pagination.rowsNumber = res.data.data.count
      }).catch(err => {
        this.loading = false
      })
    },
    goToDetail(id) {
      if (this.isUser) {
        this.$router.push({ name: `payment.detail`, params: { id } })
      }
    },
    onRequest(props) {
      const query = pagingToPathParams(props)
      this.$router.push({
        path: this.$router.fullPath,
        query,
      })
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const filter = pathParamsToPaging(to, this.pagination)
        this.getPayments({
          ...filter,
          requestType: this.type
        })
      }
    }
  }
}
</script>

<style scoped>

</style>
