<template>
  <q-table
    :title="label || 'Payments'"
    :loading="loading"
    :rows="rows"
    :columns="columns"
    row-key="name"
    v-model:pagination="pagination"
    flat
    bordered
    @row-click="(_, row) => goToDetail(row.id)"
    @request="onRequest"
  >
    <template v-if="type === 'request'" v-slot:top-right>
      <q-btn
        color="white"
        text-color="black"
        label="Create"
        to="/get-paid/create"
      />
    </template>
    <template v-slot:body-cell-online="props">
      <q-td :props="props">
        <q-badge rounded :color="props.value ? 'green' : 'grey'" />
      </q-td>
    </template>
  </q-table>
</template>

<script>
import {
  pathParamsToPaging,
  pagingToPathParams,
  defaultPaging,
} from "src/helper/paging";
import { date } from "quasar";
import { MDateFormat } from "src/consts/common";
import { mapGetters } from "vuex";
import role from "src/consts/role";
import { PAYMENT_OBJECT_REQUEST } from "src/consts/paymentType";
import { responseError } from "src/helper/error";

export default {
  name: "paymentList",
  data() {
    return {
      loading: false,
      pagination: {
        ...defaultPaging,
      },
      rows: [],
      fixedColumns: [
        {
          name: "status",
          align: "center",
          label: "Status",
          field: "status",
          sortable: true,
        },
        {
          name: "amount",
          align: "center",
          label: "Amount(USD)",
          field: "amount",
          format: (val) => {
            return val;
          },
        },
        {
          name: "createdAt",
          align: "center",
          label: "Created At",
          field: "createdAt",
          sortable: true,
          format: (val) => date.formatDate(val, MDateFormat),
        },
      ]
    };
  },
  props: {
    type: String,
    label: String,
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
    }),
    isUser() {
      return this.user.role === role.USER;
    },
    columns() {
      let flexibleCol = this.type === PAYMENT_OBJECT_REQUEST ? {
        name: "senderName",
        align: "center",
        label: "Payer",
        field: (row) => {
          if (
            row.creatorId === row.senderId ||
            row.contactMethod === "internal"
          ) {
            return row.senderName;
          }
          return row.externalEmail;
        },
      } : {
        name: "receiverName",
        required: true,
        label: "Requester",
        align: "center",
        field: (row) => {
          if (
            row.creatorId === row.receiverId ||
            row.contactMethod === "internal"
          ) {
            return row.receiverName;
          }
          return row.externalEmail;
        },
        format: (val) => `${val}`,
      }

      return [
        flexibleCol,
        ... this.fixedColumns
      ]
    }
  },
  methods: {
    async getPayments(f) {
      this.loading = true;
      this.$api
        .get("/payment/list", {
          params: f,
        })
        .then((res) => {
          this.loading = false;
          this.rows = res.payments;
          this.pagination.rowsNumber = res.count;
        })
        .catch((err) => {
          responseError(err);
          this.loading = false;
        });
    },
    goToDetail(id) {
      if (this.isUser) {
        const path = this.type === PAYMENT_OBJECT_REQUEST ? "get-paid" : "pay";
        this.$router.push({ path: `/${path}/${id}` });
      }
    },
    onRequest(props) {
      const query = pagingToPathParams(props);
      this.$router.push({
        path: this.$route.fullPath,
        query,
      });
    },
  },
  watch: {
    $route: {
      immediate: true,
      handler(to) {
        const filter = pathParamsToPaging(to, this.pagination);
        this.getPayments({
          ...filter,
          requestType: this.type,
        });
      },
    },
  },
};
</script>

<style scoped></style>
