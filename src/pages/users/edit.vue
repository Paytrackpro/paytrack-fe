<template>
  <q-card flat bordered class="q-pa-md">
    <q-form class="q-pa-lg">
      <div class="row q-mb-md q-col-gutter-md profile-padding">
        <div class="col-12">
          <div class="text-h6 profile-title">Update Profile</div>
          <q-separator />
        </div>
        <div class="col-3">
          <p class="text-weight-medium q-mt-none">User name</p>
          <div class="q-mt-none">
            <span class="text-grey-5">{{ user.userName }}</span>
          </div>
        </div>
        <div class="col-4">
          <p class="q-mt-none q-mb-xs text-weight-medium col-4">Display name </p>
          <q-input
            outlined
            dense
            lazy-rules
            stack-label
            hide-bottom-space
            v-model="user.displayName"
            placeholder="Your display name"
          />
        </div>
        <div class="col-4">
          <p class="q-mt-none q-mb-xs text-weight-medium col-4">Email </p>
          <q-input
            outlined
            dense
            lazy-rules
            stack-label
            hide-bottom-space
            v-model="user.email"
            placeholder="Email"
            :rules="[(val, rules) => !val || (val && rules.email(val)) || 'Please enter a valid email address',]"
          />
        </div>
        <div class="col-12">
          <payment-setting v-model="user.paymentSettings" label="Payment settings"></payment-setting>
        </div>
      </div>
      <div class="text-right">
        <q-btn label="Update Profile" class="q-mr-xs" :disable="loading"  type="button" color="primary" @click="submit"/>
        <q-btn label="Cancel"  type="button" :disable="loading" color="primary" @click="redirectUrl"/>
      </div>
    </q-form>
  </q-card>
</template>

<script>
import PaymentSetting from "components/payment/paymentSetting"
import { PAYMENT_TYPE_OPTIONS } from "src/consts/paymentType"
import { defineComponent } from "vue";
export default defineComponent({
  name: 'userProfileEdit',
  components: {
    PaymentSetting
  },
  data :function(){
    return {
      user : {
        userId : '',
        userName : '',
        email : '',
        paymentAddress : '',
        paymentType:'',
        displayName : '',
        role : '',
      },
      loading: false,
      paymentAddressOptions : PAYMENT_TYPE_OPTIONS,
    }
  },
  created: function () {
    this.getDataApi();
  },
  methods : {
    async getDataApi(){
      this.$api.get("/user/info").then((res) => {
        localStorage.setItem('user' ,JSON.stringify(res.data.data))
        this.setData(res.data.data);
      })
    },
    setData(user){
      this.user.userId = user.id;
      this.user.userName = user.userName;
      this.user.email = user.email;
      this.user.displayName = user.displayName;
      this.user.paymentSettings = user.paymentSettings
    },
    submit(){
      let userData = {
        id : this.user.userId,
        userName : this.user.userName,
        email : this.user.email,
        paymentSettings : this.user.paymentSettings,
        displayName : this.user.displayName
      }
      this.$store.dispatch("user/updateUserProfile", userData).then(res => {
        this.redirectUrl()
      }).catch(err => {
        let msg = "Error"
        if (err.response && err.response.status === 400) {
          msg = err.response.data.message
        }
        this.$q.notify({
          message: msg,
          color: "negative",
          icon: "alert",
        })
      });
    },
    redirectUrl() {
      this.$router.push({path: "/profile"})
    }
  }
})
</script>

<style lang="scss" scoped>
  .pad{
    padding-left: 20%;
    padding-right: 20%;
  }
  .user_hr{
    border: 1px rgb(244, 237, 237) solid;
    margin: 20px 0px;
  }
</style>
