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
              <input v-model="user.userId" type="hidden">
              <q-input filled v-model="user.displayName" label="Full Name" lazy-rules />
              <q-input filled v-model="user.userName" label="Username" disable lazy-rules />
              <q-input filled v-model="user.email" label="Email" lazy-rules />
              <q-select
                filled
                :options="paymentAddressOptions"
                label="Select payment address"
                v-model="user.paymentAddress"
                emit-value
                map-options
              />
              <q-select
                filled
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
          this.$store.dispatch("auth/getUserInfo");
          let user =  this.$store.getters['auth/getUserInfo'];
          this.user.userId = user.Id;
          this.user.userName = user.UserName;
          this.user.email = user.Email;
          this.user.displayName = user.DisplayName;
          this.user.paymentType = Number(user.PaymentType);
          this.user.paymentAddress = Number(user.PaymentAddress);
        },
        submit(){
          let form = {
              Id : this.user.userId,
              UserName : this.user.userName,
              Email : this.user.email,
              PaymentAddress : this.user.paymentAddress,
              paymentType : this.user.paymentType,
          }
          this.$store.dispatch("auth/updateUserInfo", form);
        },
      }
  })
</script>

<style lang="scss" scoped>

</style>
