<template>
  <q-page>
    <q-card>
      <q-card-section>
        <q-form class="q-gutter-md pad">
          <div class="q-pt-lg">
            <div class="col text-h4">Profile</div>
          </div>
          <input v-model="user.userId" type="hidden">
          <input v-model="user.userName" type="hidden">
          <div class="user-flex">
            <q-item-section top class="gt-sm user-info-label user-col">
              <q-item-label class="">Username :</q-item-label>
            </q-item-section>
            <q-item-section top>
              <q-item-label lines="1">
                <span class="text-grey-8">{{ user.userName }}</span>
              </q-item-label>
            </q-item-section>
          </div>
          <q-input outlined dense lazy-rules stack-label hide-bottom-space v-model="user.email" >
            <template v-slot:before>
              <label for="" class = "font-weight user-info-label">Email :</label>
            </template>
          </q-input>
          <q-input outlined dense lazy-rules stack-label hide-bottom-space v-model="user.paymentAddress">
            <template v-slot:before>
              <label for="" class = "font-weight user-info-label">payment address :</label>
            </template>
          </q-input>
          <q-select
            outlined dense lazy-rules stack-label hide-bottom-space
            :options="paymentAddressOptions"
            v-model="user.paymentType"
            emit-value
            map-options
            >
            <template v-slot:before>
              <label for="" class = "font-weight  user-info-label">Payment type :</label>
            </template>
          </q-select>
          <div class="text-right">
            <q-btn label="Update Profile"  type="button" color="primary" @click="submit"/>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-page>
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
            value: 'btc'
          },
          {
            label: 'DCR',
            value: 'dcr'
          },
          {
            label: 'LTC',
            value: 'ltc'
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
          this.user.userId = user.id;
          this.user.userName = user.user_name;
          this.user.email = user.email;
          this.user.paymentType = user.payment_type;
          this.user.paymentAddress = user.payment_address;
        },
        submit(){
          let token = this.$store.getters['auth/getToken']
          let userData = {
            token,
            form : {
              id : this.user.userId,
              user_name : this.user.userName,
              email : this.user.email,
              payment_address : this.user.paymentAddress,
              payment_type : this.user.paymentType,
            }
          }
          this.$store.dispatch("user/updateUserProfile", userData);
        },
      }
  })
</script>

<style lang="scss" scoped>
  .pad{
    padding-left: 20%;
    padding-right: 20%;
  }
  .user-info-label{
    width: 200px;
    font-size: 16px;
    color: black;
  }
  .user-col{
    flex: 0 0 auto;
  }
  .user-flex{
    padding-bottom: 15px;
    display: flex;
  }
</style>
