<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="{ width: '30%' }">
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">Profile Info</div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md">
              <input v-model="userId"  type="hidden">
              <q-input filled v-model="email" label="Email" lazy-rules />
              <q-select
                filled
                :options="options"
                label="Select type coin"
                v-model="typeCoin"
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
  import { api } from "boot/axios";
  import { defineComponent } from "vue";
  export default defineComponent({
      data :function(){
        return {
            userId : '',
            userName : '',
            email : '',
            typeCoin : '',
            options: [
              'BTC', 'DCR', 'LTC'
            ]
        }
      },
      methods : {
        submit(){
          let url = '';
          let form = {
            id : this.userId,
            userName : this.userName,
            email : this.email,
          };
          api.post(url, form).then((response) => {
            if (response.status == 200) {
              this.$router.push("/");
            }
          });
        },
      }
  })
</script>

<style lang="scss" scoped>

</style>
