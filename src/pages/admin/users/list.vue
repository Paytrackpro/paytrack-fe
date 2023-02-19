<template>
  <div class="q-pa-md">
    <q-table
      title="Treats"
      :data="rows"
      :columns="columns"
      row-key="name"
      hide-pagination
      flat
      bordered
      :loading="loading"
      @row-click="(_, row) => goToDetail(row.id)"
    >
      <template v-slot:top-left>
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search">
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
    <div class="row justify-end q-mt-md">
      <q-pagination v-model="pagination.currentPage" color="grey-8" :max="pagination.pages" size="md"  @input="getUserList"/>
    </div>
  </div>
</template>

<script>
import { PAYMENT_TYPES } from "../../../consts/paymentType"
import { date } from "quasar"

export default {
  data() {
    return {
      filter: "",
      loading : false,
      pagination: {
        sortBy: "desc",
        descending: false,
        currentPage: 1,
        rowsPerPage: 5,
        pages:0
      },
      columns: [
        {
          name: "user_name",
          required: true,
          label: "User Name",
          align: "center",
          field: (row) => row.userName,
          format: (val) => `${val}`,
          sortable: true,
        },
        { name: "display_name", align: "center", label: "Dislay Name", field: "displayName", sortable: true },
        { name: "email", align: "center", label: "Email", field: "email", sortable: true },
        {
          name: "payment_type",
          align: "center",
          label: "Payment Type",
          field: "paymentType",
          format: (val) => {
            if (val == PAYMENT_TYPES.BTC) return "BTC"
            if (val == PAYMENT_TYPES.LTC) return "LTC"
            if (val == PAYMENT_TYPES.DCR) return "DCR"
          },
        },
        {
          name: "created_at",
          align: "center",
          label: "Created At",
          field: "createdAt",
          format: (val) => date.formatDate(val, "DD/MM/YYYY"),
        },
        {
          name: "last_seen",
          align: "center",
          label: "Last Seen",
          field: "lastSeen",
          format: (val) => date.formatDate(val, "DD/MM/YYYY"),
        },
      ],
      rows: [],
    }
  },

  created: function () {
    let urlParams = new URLSearchParams(window.location.search)
    let page = parseInt(urlParams.get('page')) || 1
    this.pagination.currentPage = page
    this.getUserList();
  },

  methods: {
    async getUserList() {
      this.loading = true;
      this.$api.get(`/admin/user/list?page=${this.pagination.currentPage}&size=${this.pagination.rowsPerPage}`).then((res) => {
        this.rows = res.data.data.user;
        this.pagination.pages = Math.ceil(res.data.data.total / this.pagination.rowsPerPage);
      })
      let urlParams = new URLSearchParams(window.location.search)
      urlParams.set('page', this.pagination.currentPage)
      window.history.replaceState({}, '', `${window.location.pathname}?${urlParams}`)
      this.loading = false;
    },

    goToDetail(id) {
      this.$router.push({ name: "admin.user.detail", params: { id } })
    },
  },
}
</script>
