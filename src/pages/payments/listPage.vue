<template>
  <div class="q-pa-md">
    <q-table
      title="Payments"
      :data="rows"
      :columns="columns"
      row-key="name"
      :pagination.sync="pagination"
      hide-pagination
      flat
      bordered
      @row-click="(_, row) => goToDetail(row.id)"
    >
      <template v-slot:top-right>
        <q-btn outline color="secondary" label="Create payment" to="payment/create" />
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
import { date } from "quasar"
import { MDateFormat } from "src/consts/common"

export default {
  name: "listPayments",
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
          name: "requesterName",
          required: true,
          label: "requester",
          align: "center",
          field: (row) => row.requesterName,
          format: (val) => `${val}`,
          sortable: true,
        },
        {
          name: "senderName",
          align: "center",
          label: "sender",
          field: (row) => {
            if (row.contactMethod === "email") {
              return row.senderEmail
            }
            return row.senderName
          },
          sortable: true,
        },
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
  computed: {
    pagesNumber() {
      return Math.ceil(this.rows.length / this.pagination.rowsPerPage)
    },
  },
  created: function () {
    this.getPayments()
  },
  methods: {
    async getPayments() {
      this.$api.get("/payment/list").then((res) => {
        this.rows = res.data.data
      })
    },
    goToDetail(id) {
      this.$router.push({ name: "payment.detail", params: { id } })
    },
  },
}
</script>
