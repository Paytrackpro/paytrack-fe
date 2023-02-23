<template>
  <q-page>
    <q-card>
      <q-card-section>
        <q-form class="q-gutter-md pad">
          <div class="q-pt-lg">
            <div class="col text-h3">Profile</div>
            <hr class = "user_hr">
          </div>
          <input v-model="user.userId" type="hidden">
          <input v-model="user.userName" type="hidden">
          <div class="row">
            <div class="col-4 q-pr-xs">
              <p class="text-weight-medium q-mt-none">User name</p>
              <div class="q-mt-none">
                <span class="text-grey-5">{{ user.userName }}</span>
              </div>
            </div>
            <div class="col-4 q-pr-xs">
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
            <div class="col-4 q-pr-xs">
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
          </div>
          <q-separator inset />
          <div class="q-pt-sm">
            <q-card class="my-card">
              <q-card-section>
                <div class="text-h6 text-center q-pb-sm">Payment settings</div>
                <div class="text-subtitle3">
                    <div class="row">
                      <div class="col-12 q-pr-sm">
                          <q-checkbox
                            v-for=" paymentAddressOption in paymentAddressOptions"
                            :label = 'paymentAddressOption.label'
                            v-model="paymentAddressOption.isChecked"
                            @click.native = "addPaymentSetting(paymentAddressOption.value , paymentAddressOption.isChecked)"
                            class = "q-pa-sm"
                            :key="paymentAddressOption.value"
                          />
                      </div>
                      <div class="col-12" v-if="!this.isShowPayment">
                        <div class="row" >
                          <div class="col-12">
                            <p class="q-mt-none q-mb-xs text-weight-medium">Payment Address</p>
                            <q-input
                              outlined
                              dense
                              lazy-rules
                              stack-label
                              hide-bottom-space
                              placeholder="Payment Address"
                              disable
                            />
                          </div>
                        </div>
                      </div>
                      <div class="col-12" v-else>
                        <div v-for="payment in user.paymentSettings"  class="row" >
                          <div class="col-12">
                            <input v-model="payment.type" type="hidden"/>
                            <p class="q-mt-none q-mb-xs text-weight-medium">Payment Address <span class="text-uppercase"> {{ payment.type }} </span></p>
                            <q-input
                              outlined
                              dense
                              lazy-rules
                              stack-label
                              hide-bottom-space
                              v-model="payment.address"
                              placeholder="Payment Address"
                            />
                          </div>
                        </div>
                      </div>
                  </div>
                </div>
              </q-card-section>
            </q-card>
          </div>
          <div class="text-right">
            <q-btn label="Update Profile" class="q-mr-xs" :disable="loading"  type="button" color="primary" @click="submit"/>
            <q-btn label="Cancel"  type="button" :disable="loading" color="primary" @click="redirectUrl"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
  import { PAYMENT_TYPE_OPTIONS } from "../../consts/paymentType"
  import { defineComponent } from "vue";
  import { Notify } from 'quasar'
  import ROLE from "src/consts/role"

  export default defineComponent({
      name: 'Profile',
      data :function(){
        return {
          error : '',
          loading : false,
          user : {
            userId : '',
            userName : '',
            email : '',
            paymentAddress : '',
            paymentType:'',
            displayName : '',
            role : '',
            paymentSettings: [{
              type : '',
              address : '',
              checked : false ,
            }],
          },
          paymentAddressOptions : PAYMENT_TYPE_OPTIONS,
          isShowPayment : false
        }
      },
      watch: {
        'user.paymentSettings' : function(){
          (this.user.paymentSettings.length > 0)? this.isShowPayment = true : this.isShowPayment = false;
        }
      },
      created: function () {
        this.getDataApi();
      },
      methods : {
        redirectUrl(){
          if(this.user.role == ROLE.ADMIN){
              this.$router.push("/admin/profile");
          }else{
              this.$router.push("/profile");
          }
        },
        setCheckbox(data, dataApi){
          if(typeof dataApi !== 'undefined' && dataApi != null){
            data.map((obj) => {
              dataApi.map((objApi)=>{
                if(obj.value === objApi.type){
                  obj.isChecked = true;
                  return;
                }
              })
            });
          }
          return data;
        },
        addPaymentSetting(value,isChecked){
          if(isChecked === true){
            this.user.paymentSettings.push({
              type: value,
              address: '',
            })
          }else{
            let location = this.user.paymentSettings.findIndex(object => {
                return object.type == value;
            });
            this.user.paymentSettings.splice(location,1)
          }
        },
        async getDataApi(){
          this.$api.get("/user/info").then((res) => {
            localStorage.setItem('user' ,JSON.stringify(res.data.data))
            this.setData(res.data.data);
          })
        },
        setData(user){
          this.paymentAddressOptions = this.setCheckbox(this.paymentAddressOptions ,user.paymentSettings)
          this.user.userId = user.id;
          this.user.userName = user.userName;
          this.user.email = user.email;
          this.user.paymentType = user.paymentType;
          this.user.paymentAddress = user.paymentAddress;
          this.user.displayName = user.displayName;
          this.user.paymentSettings = (typeof user.paymentSettings !== 'undefined' && user.paymentSettings)? this.user.paymentSettings = user.paymentSettings : [];
          this.user.role = user.role;
        },
        submit(){
          this.loading = true
          let userData = {
            id : this.user.userId,
            userName : this.user.userName,
            email : this.user.email,
            paymentAddress : this.user.paymentAddress,
            paymentType : this.user.paymentType,
            displayName : this.user.displayName,
            paymentSettings : this.user.paymentSettings
          }
          this.$store.dispatch("user/updateUserProfile", userData).then((res)=> {
            this.loading = false;
            Notify.create({
              message: 'your information is updated',
              color: "positive",
              icon: "done",
            })
            this.redirectUrl();
          }).catch(err => {
            this.loading = false;
            Notify.create({
              message: err.data.message,
              color: "warning",
              icon: "warning",
            })
          });
        },
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
