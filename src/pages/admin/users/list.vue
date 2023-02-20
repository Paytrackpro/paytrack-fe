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
      :pagination.sync="pagination"
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
      <q-pagination v-model="pagination.currentPage" color="grey-8" :max="pagination.pages" size="md" />
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
  watch: {
    "pagination.currentPage": function(){
      this.setParamUrls({
        'page': this.pagination.currentPage
      });
      this.getUserList();
    }
  },
  created: function(){
    let currentPage = this.getParamUrl([
        'page',
    ]);
    this.pagination.currentPage = (currentPage.page > 1)? parseInt(currentPage.page) : this.pagination.currentPage
    this.setParamUrls({
      'page': this.pagination.currentPage
    });
    this.getUserList();
  },
  methods: {
    async getUserList() {
      this.loading = true;
      this.$api.get(`/admin/user/list?page=${this.pagination.currentPage}&size=${this.pagination.rowsPerPage}`).then((res) => {
        this.rows = res.data.data.user;
        this.pagination.pages = Math.ceil(res.data.data.total / this.pagination.rowsPerPage);
      });
      this.loading = false;
    },
    goToDetail(id) {
      this.$router.push({ name: "admin.user.detail", params: { id } })
    },

    setParamUrls(Object){
      let urlParams = new URLSearchParams(window.location.search)
      for (let key in Object) {
        console.log(Object[key]);
        let newParam = (Object[key])? Object[key] : 1;
        urlParams.set(key, newParam)
      }
      let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
      window.history.pushState({}, '', newUrl);
    },

    getParamUrl(params){
      let reuslt = {};
      let urlParams = new URLSearchParams(window.location.search)
      params.map(function(value){
        reuslt[value] = urlParams.get(value);
      })
      return reuslt;
    }
  },
}
</script>
