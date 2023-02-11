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
          <div>
            <p class="text-weight-medium q-mt-none">User name</p>
            <div class="q-mt-none">
              <span class="text-grey-5">{{ user.userName }}</span>
            </div>
          </div>
          <div>
            <p class="q-mt-none q-mb-xs text-weight-medium">Display name </p>
            <q-input outlined dense lazy-rules stack-label hide-bottom-space v-model="user.displayName" placeholder="Your display name">
            </q-input>
          </div>
          <div>
            <p class="q-mt-none q-mb-xs text-weight-medium">Email </p>
            <q-input
            outlined
            dense
            lazy-rules
            stack-label
            hide-bottom-space
            v-model="user.email"
            placeholder="Email"
            :rules="[(val, rules) => !val || (val && rules.email(val)) || 'Please enter a valid email address',]">
            </q-input>
          </div>
          <div>
            <p class ="q-mt-none q-mb-xs text-weight-medium">Default Payment Type</p>
            <q-select
            outlined dense lazy-rules stack-label hide-bottom-space
            :options="paymentAddressOptions"
            v-model="user.paymentType"
            emit-value
            map-options
            >
            </q-select>
          </div>
          <div>
            <p class="q-mt-none q-mb-xs text-weight-medium">Default Payment Address</p>
            <q-input outlined dense lazy-rules stack-label hide-bottom-space v-model="user.paymentAddress" placeholder="Payment Address">
            </q-input>
          </div>
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
      name: 'Profile',
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
              label: "BTC",
              value: "btc",
            },
            {
              label: "LTC",
              value: "ltc",
            },
            {
              label: "DCR",
              value: "dcr",
            },
          ],
        }
      },
      created: function () {
        this.getDataApi();
      },
      methods : {
        async getDataApi(){
          this.$api.get("/user/info").then((res) => {
            localStorage.setItem('profile' ,JSON.stringify(res.data.data))
            this.setData(res.data.data);
          })
        },
        setData(user){
          this.user.userId = user.id;
          this.user.userName = user.userName;
          this.user.email = user.email;
          this.user.paymentType = user.paymentType;
          this.user.paymentAddress = user.paymentAddress;
          this.user.displayName = user.displayName;
        },
        submit(){
          let userData = {
            id : this.user.userId,
            userName : this.user.userName,
            email : this.user.email,
            paymentAddress : this.user.paymentAddress,
            paymentType : this.user.paymentType,
            displayName : this.user.displayName
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
  .user_hr{
    border: 1px rgb(244, 237, 237) solid;
    margin: 20px 0px;
  }
</style>
