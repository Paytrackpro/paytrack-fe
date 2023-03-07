<template>
  <q-card flat bordered class="q-pa-md">
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-12">
        <div class="text-h6 profile-title">User Profile</div>
        <q-separator />
      </div>
      <div class="col-4">
        <q-field label="User name" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ user.userName }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Display Name" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ user.displayName }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Email" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ user.email }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-12">
        <payment-setting v-model="user.paymentSettings" readonly label="Payment settings"></payment-setting>
      </div>
    </div>
    <div class="text-right">
      <q-btn color="primary" label="Edit" to="profile/edit" />
    </div>
  </q-card>
</template>

<script>
import ROLE from "src/consts/role"
import { defineComponent } from "vue"
import PaymentSetting from "components/payment/paymentSetting"
import {responseError} from "src/helper/error";
export default defineComponent ({
  name: "ProfileInfo",
  components: {
    PaymentSetting,
  },
  data() {
    return {
      user: {},
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {},
    };
  },
  methods:{
    async getDataApi(){
      this.$api.get("/user/info").then((data) => {
        this.user = data;
        localStorage.setItem('user' ,JSON.stringify(data))
      }).catch(err => {
        responseError(err)
      })
    },
    redirectUrl(){
      if(this.user.role === ROLE.ADMIN){
        this.$router.push("/admin/profile/edit")
      }else{
        this.$router.push("/profile/edit")
      }
    }
  },
  created: function () {
    this.getDataApi()
  },
})
</script>

<style scoped>
.profile-padding {
  padding: 20px 50px;
}
.profile-title {
  text-transform: uppercase;
  font-weight: bold;
}
</style>
