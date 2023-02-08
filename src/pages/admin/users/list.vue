<template>
  <div class="q-pa-md">
    <q-table
      title="Treats"
      :data="rows"
      :columns="columns"
      row-key="name"
      :pagination.sync="pagination"
      hide-pagination
      flat
      bordered
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
      <q-pagination v-model="pagination.page" color="grey-8" :max="pagesNumber" size="md" direction-links />
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
      pagination: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      columns: [
        {
          name: "user_name",
          required: true,
          label: "User Name",
          align: "center",
          field: (row) => row.user_name,
          format: (val) => `${val}`,
          sortable: true,
        },
        { name: "display_name", align: "center", label: "Dislay Name", field: "display_name", sortable: true },
        { name: "email", align: "center", label: "Email", field: "email", sortable: true },
        {
          name: "payment_type",
          align: "center",
          label: "Payment Type",
          field: "payment_type",
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
          field: "created_at",
          format: (val) => date.formatDate(val, "DD/MM/YYYY"),
        },
        {
          name: "last_seen",
          align: "center",
          label: "Last Seen",
          field: "last_seen",
          format: (val) => date.formatDate(val, "DD/MM/YYYY"),
        },
      ],
      rows: [],
    }
  },
  computed: {
    pagesNumber() {
      return Math.ceil(this.rows.length / this.pagination.rowsPerPage)
    },
  },
  created: function () {
    this.getUserList()
  },
  methods: {
    async getUserList() {
      this.$api.get("/admin/user/list").then((res) => {
        this.rows = res.data.data
      })
    },
    goToDetail(id) {
      this.$router.push({ name: "UserDetail", params: { id } })
    },
  },
}
</script>
