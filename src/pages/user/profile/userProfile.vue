<template>
  <q-layout>
    <q-page-container class="wrapper" style = "height: 100%;">
      <q-page>
        <q-card>
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h2 ellipsis">Profile</div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md pad">
              <input v-model="user.userId" type="hidden">
              <q-input outlined dense lazy-rules stack-label hide-bottom-space v-model="user.displayName" label="Full Name"/>
              <q-input outlined dense lazy-rules stack-label hide-bottom-space  v-model="user.userName" label="Username" disable/>
              <q-input outlined dense lazy-rules stack-label hide-bottom-space  v-model="user.email" label="Email"/>
              <q-select
                outlined dense lazy-rules stack-label hide-bottom-space
                :options="paymentAddressOptions"
                label="Select payment address"
                v-model="user.paymentAddress"
                emit-value
                map-options
              />
              <q-select
                outlined dense lazy-rules stack-label hide-bottom-space
                :options="paymentAddressOptions"
                label="Select payment type"
                v-model="user.paymentType"
                emit-value
                map-options
              />
              <div>
                <q-btn label="Update Profile" type="button" color="primary" @click="submit"/>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
  import { defineComponent } from "vue";
  export default defineComponent({
      name: 'userProfile',
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
          paymentAddressOptions : [
          {
            label: 'BTC',
            value: 1
          },
          {
            label: 'DCR',
            value: 2
          },
          {
            label: 'LTC',
            value: 3
          }],
        }
      },
      mounted: function(){
        this.setData();
      },
      methods : {
        setData(){
          let token = this.$store.getters['auth/getToken']
          this.$store.dispatch("user/getUserInfo",token);
          let user =  this.$store.getters['user/getUserProfile'];
          this.user.userId = user.Id;
          this.user.userName = user.UserName;
          this.user.email = user.Email;
          this.user.displayName = user.DisplayName;
          this.user.paymentType = Number(user.PaymentType);
          this.user.paymentAddress = Number(user.PaymentAddress);
        },
        submit(){
          let token = this.$store.getters['auth/getToken']
          let userData = {
            token,
            form : {
              Id : this.user.userId,
              UserName : this.user.userName,
              Email : this.user.email,
              PaymentAddress : this.user.paymentAddress,
              paymentType : this.user.paymentType,
            }
          }
          this.$store.dispatch("auth/updateUserInfo", userData);
        },
      }
  })
</script>

<style lang="scss" scoped>
  .pad{
    padding-left: 20%;
    padding-right: 20%;
  }
  .wrapper{
    height: 100vh;
  }
</style>
