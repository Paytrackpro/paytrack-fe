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
        { name: "paymentType", align: "center", label: "Payment Type", field: "paymentType" },
        { name: "createdAt", align: "center", label: "Created At", field: "createdAt" },
        { name: "lastSeen", align: "center", label: "Last Seen", field: "lastSeen" },
        { name: "online", align: "center", label: "Online", field: "online" },
      ],
      rows: [
        {
          userName: "Luella Dillon",
          displayName: "Beck",
          email: "beckdillon@medcom.com",
          paymentType: "BTC",
          createdAt: "26/11/2016",
          lastSeen: "23/08/2015",
          online: true,
        },
        {
          userName: "Jamie Knox",
          displayName: "Maria",
          email: "mariaknox@medcom.com",
          paymentType: "BTC",
          createdAt: "13/09/2014",
          lastSeen: "30/08/2014",
          online: true,
        },
        {
          userName: "Cummings Raymond",
          displayName: "Cecile",
          email: "cecileraymond@medcom.com",
          paymentType: "BTC",
          createdAt: "29/08/2014",
          lastSeen: "01/05/2018",
          online: true,
        },
        {
          userName: "Ashlee Travis",
          displayName: "Carly",
          email: "carlytravis@medcom.com",
          paymentType: "BTC",
          createdAt: "10/10/2018",
          lastSeen: "23/02/2017",
          online: true,
        },
        {
          userName: "Barton Bryan",
          displayName: "Juliet",
          email: "julietbryan@medcom.com",
          paymentType: "BTC",
          createdAt: "06/06/2016",
          lastSeen: "24/04/2017",
          online: true,
        },
        {
          userName: "Leanna Wells",
          displayName: "Summer",
          email: "summerwells@medcom.com",
          paymentType: "BTC",
          createdAt: "01/07/2020",
          lastSeen: "25/11/2018",
          online: true,
        },
        {
          userName: "Long Rogers",
          displayName: "Amelia",
          email: "ameliarogers@medcom.com",
          paymentType: "BTC",
          createdAt: "23/10/2019",
          lastSeen: "28/09/2018",
          online: true,
        },
        {
          userName: "Pearl Vargas",
          displayName: "Camacho",
          email: "camachovargas@medcom.com",
          paymentType: "BTC",
          createdAt: "14/09/2022",
          lastSeen: "19/08/2016",
          online: true,
        },
        {
          userName: "Pacheco Richards",
          displayName: "Goldie",
          email: "goldierichards@medcom.com",
          paymentType: "BTC",
          createdAt: "10/12/2019",
          lastSeen: "25/05/2014",
          online: true,
        },
        {
          userName: "Mullins Wolf",
          displayName: "Noreen",
          email: "noreenwolf@medcom.com",
          paymentType: "BTC",
          createdAt: "18/12/2014",
          lastSeen: "16/03/2019",
          online: true,
        },
        {
          userName: "Ewing Mcfarland",
          displayName: "Bush",
          email: "bushmcfarland@medcom.com",
          paymentType: "BTC",
          createdAt: "25/12/2020",
          lastSeen: "13/01/2023",
          online: true,
        },
        {
          userName: "Cooper Mcpherson",
          displayName: "Tina",
          email: "tinamcpherson@medcom.com",
          paymentType: "BTC",
          createdAt: "31/01/2021",
          lastSeen: "17/12/2019",
          online: true,
        },
        {
          userName: "Cleveland Garza",
          displayName: "Lelia",
          email: "leliagarza@medcom.com",
          paymentType: "BTC",
          createdAt: "07/08/2019",
          lastSeen: "13/02/2015",
          online: true,
        },
        {
          userName: "Montoya Riley",
          displayName: "Eve",
          email: "everiley@medcom.com",
          paymentType: "BTC",
          createdAt: "30/12/2016",
          lastSeen: "16/05/2021",
          online: true,
        },
        {
          userName: "Hope Greene",
          displayName: "Parks",
          email: "parksgreene@medcom.com",
          paymentType: "BTC",
          createdAt: "12/01/2018",
          lastSeen: "11/09/2020",
          online: true,
        },
        {
          userName: "Arline Francis",
          displayName: "Carolina",
          email: "carolinafrancis@medcom.com",
          paymentType: "BTC",
          createdAt: "12/04/2017",
          lastSeen: "03/03/2021",
          online: true,
        },
        {
          userName: "Ronda Sharp",
          displayName: "Melba",
          email: "melbasharp@medcom.com",
          paymentType: "BTC",
          createdAt: "27/09/2020",
          lastSeen: "22/08/2021",
          online: true,
        },
        {
          userName: "Keller Bray",
          displayName: "Gardner",
          email: "gardnerbray@medcom.com",
          paymentType: "BTC",
          createdAt: "27/07/2019",
          lastSeen: "17/05/2018",
          online: true,
        },
        {
          userName: "Arnold Erickson",
          displayName: "Stark",
          email: "starkerickson@medcom.com",
          paymentType: "BTC",
          createdAt: "19/08/2015",
          lastSeen: "23/02/2020",
          online: true,
        },
        {
          userName: "Shannon Dorsey",
          displayName: "Jewell",
          email: "jewelldorsey@medcom.com",
          paymentType: "BTC",
          createdAt: "12/08/2021",
          lastSeen: "29/06/2014",
          online: true,
        },
      ],
    }
  },
  computed: {
    pagesNumber() {
      return Math.ceil(this.rows.length / this.pagination.rowsPerPage)
    },
  },
}
</script>
