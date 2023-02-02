<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex  flex-center">
        <q-card v-bind:style="{ width: '30%' }">
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">Profile Info</div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md">
              <input v-model="userId"  type="hidden">
              <q-input filled v-model="displayName" label="Full Name" lazy-rules />
              <q-input filled v-model="userName" label="Username" disable lazy-rules />
              <q-input filled v-model="email" label="Email" lazy-rules />
              <q-select
                filled
                :options="paymentAddressOptions"
                label="Select payment address"
                v-model="paymentAddress"
                emit-value
                map-options
              />
              <q-select
                filled
                :options="paymentAddressOptions"
                label="Select payment type"
                v-model="paymentType"
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
  import { mapGetters } from 'vuex'
  import { defineComponent } from "vue";
import { is } from 'quasar';
  export default defineComponent({
      data :function(){
        return {
            userId : '',
            userName : '',
            email : '',
            paymentAddress : '',
            paymentType:'',
            displayName : '',
            role : '',
            paymentAddressOptions : [
            {
              label: 'BTC',
              value: '1'
            },
            {
              label: 'DCR',
              value: '2'
            },
            {
              label: 'LTC',
              value: '3'
            }],
        }
      },
      mounted: function(){
        this.setdata();
      },
      methods : {
        setdata(){
          let token =  this.$store.getters['auth/getToken'];
          this.$store.dispatch("auth/getUserInfo",token);
          let user =  this.$store.getters['auth/getUserInfo'];
          this.userId = user.Id;
          this.userName = user.UserName;
          this.email = user.Email;
          this.displayName = user.DisplayName;
        },
        submit(){
           let a =  this.$store.dispatch("auth/updateUserInfo", {
              Id : this.userId,
              UserName : this.userName,
              Email : this.email,
              PaymentAddress : this.paymentAddress,
              paymentType : this.paymentType,
              DisplayName : this.displayName
           });
        },
      }
  })
</script>

<style lang="scss" scoped>

</style>
