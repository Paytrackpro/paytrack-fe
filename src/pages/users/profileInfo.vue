<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 profile-title">User Profile</div>
    </q-card-section>
    <q-separator inset />
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-4">
        <q-field label="User name" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{ user.userName }}</div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Display Name" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{ user.displayName }}</div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Email" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{ user.email }}</div>
          </template>
        </q-field>
      </div>
      <div v-for="payment in user.paymentSettings" class="col-4" >
        <div class="row">
          <q-field stack-label class="col-12">
              <template v-slot:control class = "col-12">
                <p class=" text-size q-mb-none">payment Address <span class="text-uppercase"> {{ payment.type }} </span></p>
                <div class="self-center full-width no-outline" tabindex="0">{{ payment.address }}</div>
              </template>
          </q-field>
        </div>
      </div>
    </div>
    <div class="text-right">
      <q-btn color="primary" label="Edit" to='/admin/profile/edit'/>
    </div>
  </q-card>
</template>

<script>
export default {
  name: "ProfileInfo",
  components: {},
  data() {
    return {
      user:{},
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {}
    }
  },
  methods:{
    async getDataApi(){
      this.$api.get("/user/info").then((res) => {
        this.user = res.data.data;
      })
    },
  },
  created : function(){
    this.getDataApi();
  }
}
</script>

<style scoped>
 .profile-padding{
    padding: 20px 50px;
 }
 .profile-title{
  text-transform: uppercase;
  font-weight: bold;
 }
 .text-size{
  font-size: 12px;
  color: #ababab;
 }
</style>
