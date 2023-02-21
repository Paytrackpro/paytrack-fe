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
        <q-input outlined dense debounce="300" v-model="filter" placeholder="Search" >
          <template v-slot:prepend>
            <q-icon name="search" @click="searching()"/>
          </template>
        </q-input>
      </template>
      <template v-slot:header>
        <q-tr>
          <q-th
            v-for="col in columns"
            :key="col.name"
            :sortable="col.sortable"
            @click="() => sortBy(col.name)"
          >
            {{ col.label }}
            <q-icon
              v-if="col.sortable"
              :name="getSortIcon(col.name)"
              size="15px"
            />
          </q-th>
        </q-tr>
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
      count:1,
      filter: "",
      pagination: {
        sortBy: "desc",
        descending: false,
        page: 1,
        rowsPerPage: 10,
      },
      sort:{
        field: ''
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
    }
  },
  watch: {
    filter:function(){
      if(this.filter == ''){
          this.unSetParamUrls([
            'KeySearch',
          ]);
      }
      this.searching();
    },
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
        'KeySearch',
        'order'
    ]);
    this.pagination.currentPage = (parseInt(currentPage.page) > 1)? parseInt(currentPage.page) : this.pagination.currentPage;
    this.filter = (!this.isEmpty(currentPage.KeySearch))? currentPage.KeySearch : this.filter;
    this.sort.field = (!this.isEmpty(currentPage.order))? currentPage.order : this.sort.field;

    this.setParamUrls({
      'page': this.pagination.currentPage,
    });
    this.getUserList();
  },
  methods: {
    async getUserList() {
      this.loading = true;
      let url = `/admin/user/list?page=${this.pagination.currentPage}&size=${this.pagination.rowsPerPage}`;
      if(this.sort.field != ''){
          url += `&order=${this.sort.field}`
      }
      if(this.filter){
          url += `&KeySearch=${this.filter}`
      }
      this.$api.get(url).then((res) => {
        this.rows = res.data.data.users;
        this.pagination.pages = Math.ceil(res.data.data.count / this.pagination.rowsPerPage);
      });
      this.loading = false;
    },
    goToDetail(id) {
      this.$router.push({ name: "admin.user.detail", params: { id } })
    },

    setParamUrls(Object){
      let urlParams = new URLSearchParams(window.location.search)
      for (let key in Object) {
         (Object[key])? urlParams.set(key, Object[key])  : '';
      }
      let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
      window.history.pushState({}, '', newUrl);
    },
    unSetParamUrls(params){
      let urlParams = new URLSearchParams(window.location.search)
      params.map(function(value){
        urlParams.delete(value)
      })
      let newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?' + urlParams.toString();
      window.history.pushState({}, '', newUrl);
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

    sortBy(column) {
      this.sort.field = column;
      this.pagination.sortBy = (this.count % 2)? "asc" : "desc";
      console.log(this.count);
      this.sort.field = this.sort.field +" "+ this.pagination.sortBy;
      this.setParamUrls({
        'page': this.pagination.currentPage,
        'order' : this.sort.field
      });
      this.getUserList();
      this.count++;
    },

    searching(){
      let param = this.getParamUrl([
        'page',
        'order',
      ])
      if(param.page){
        this.pagination.currentPage = parseInt(param.page);
      }
      if(param.order){
        this.sort.field = param.order;
      }
      this.setParamUrls({
        'KeySearch' : this.filter,
      });
      this.getUserList();
    },
    getSortIcon() {
      return (this.count % 2)? "arrow_downward" : "arrow_upward";
    },
    isEmpty(str){
      return (typeof str == 'undefined' || !str || str.length === 0 || str === "" || !/[^\s]/.test(str) || /^\s*$/.test(str) || str.replace(/\s/g,"") === "");
    }
  },
}
</script>
