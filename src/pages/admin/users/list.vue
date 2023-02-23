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
      :loading="loading"
      @row-click="(_, row) => goToDetail(row.id)"
    >
      <template v-slot:top-left>
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search" >
          <template v-slot:prepend>
            <q-icon name="search" @click="searching()"/>
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
  beforeRouteUpdate (to, from, next) {
    this.getUserList();
    next();
  },
  data() {
    return {
      count:1,
      filter: null,
      loading : false,
      pagination: {
        sortBy: "desc",
        descending: false,
        currentPage: 1,
        rowsPerPage: 5,
        pages: 0
      },
      columns: [
        {
          name: "userName",
          required: true,
          label: "User Name",
          align: "center",
          field: (row) => row.userName,
          format: (val) => `${val}`,
          sortable: true,
        },
        { name: "displayName", align: "center", label: "Dislay Name", field: "displayName", sortable: true },
        { name: "email", align: "center", label: "Email", field: "email", sortable: true },
        {
          name: "paymentType",
          align: "center",
          label: "Payment Type",
          field: "paymentType",
          sortable: false,
          format: (val) => {
            if (val == PAYMENT_TYPES.BTC) return "BTC"
            if (val == PAYMENT_TYPES.LTC) return "LTC"
            if (val == PAYMENT_TYPES.DCR) return "DCR"
          },
        },
        {
          name: "createdAt",
          align: "center",
          label: "Created At",
          field: "createdAt",
          sortable: false,
          format: (val) => date.formatDate(val, "DD/MM/YYYY"),
        },
        {
          name: "lastSeen",
          align: "center",
          label: "Last Seen",
          field: "lastSeen",
          sortable: false,
          format: (val) => date.formatDate(val, "DD/MM/YYYY"),
        },
      ],
      rows: [],
      orderby : '',
      tableOptions: {
        sortBy: 'userName',
        descending: false,
      },
    }
  },
  watch: {
    filter : function(){
      let param = {};
      if(this.pagination.currentPage != 1){
        param.page = this.pagination.currentPage;
      }
      if(!this.isEmpty(this.filter)){
        param.KeySearch = this.filter;
      }

      this.$router.push({ query: param})
    },
    "pagination.currentPage" : function(){
      let param = {};
      if(this.pagination.currentPage != 1){
        param.page = this.pagination.currentPage;
      }
      if(!this.isEmpty(this.filter)){
        param.KeySearch = this.filter;
      }
      this.$router.push({ query: param})
    },
  },

  created: function(){
    let param =  this.getParamUrl([
      'page',
      'KeySearch'
    ]);
    this.pagination.currentPage = (!this.isEmpty(param.page))? param.page : this.pagination.currentPage;
    this.filter = (!this.isEmpty(param.KeySearch))? param.KeySearch :  this.filter;
    this.getUserList()
  },
  methods: {
    async getUserList() {
      this.loading = true;
      let newOrder = ''
      if(!this.isEmpty(this.orderby)){
        newOrder = this.orderby + ` ${this.pagination.sortBy}`
      }
      this.$api.get('/admin/user/list',{
        params: {
          page: this.pagination.currentPage,
          size: this.pagination.rowsPerPage,
          KeySearch : this.filter,
          order : newOrder
        }
      }).then((res) => {
        this.rows = res.data.data.users;
        this.pagination.pages = Math.ceil(res.data.data.count / this.pagination.rowsPerPage);
      });
      this.loading = false;
    },
    goToDetail(id) {
      this.$router.push({ name: "admin.user.detail", params: { id } })
    },
    getParamUrl(params){
      let reuslt = {};
      let urlParams = new URLSearchParams(window.location.search)
      params.map(function(value){
        if(urlParams.get(value)){
          reuslt[value] = urlParams.get(value);
        }
      })
      return reuslt;
    },

    getSortIcon() {
      return (this.count % 2)? "arrow_downward" : "arrow_upward";
    },
    isEmpty(str){
      return (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,"") === "");
    },
    sortBy(data){
      this.orderby = data;
      console.log("doctor")
    }
  },
}
</script>
<style lang="scss">
  .list-user-header .list-user-icon-sort{
    display: flex;
    width: 100px;
  }
  .list-user-header:hover .list-user-icon-sort{
    display: block;
  }
</style>

