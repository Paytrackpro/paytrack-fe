<template>
  <q-layout>
    <q-page-container>
      <q-page class="flex bg-image flex-center">
        <q-card v-bind:style="{ width: '30%' }">
          <q-card-section>
            <div class="text-center q-pt-lg">
              <div class="col text-h6 ellipsis">Log in</div>
            </div>
          </q-card-section>
          <q-card-section>
            <q-form class="q-gutter-md" >
              <q-input ref = "username" filled v-model="username" label="Username" lazy-rules :rules="[this.required, this.validateUserName]" />
              <q-input type="password" filled v-model="password" label="Password" lazy-rules />
              <div>
                <q-btn label="Login" type="button" color="primary" @click="submit"/>
              </div>
            </q-form>
          </q-card-section>
        </q-card>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue"
export default defineComponent({
  name: "login",
  data: function () {
    return {
      username: "",
      password: "",
    };
  },
  mounted: function() {
    if(this.$store.state.login.isLogin){
      this.$router.push("/");
    }
  },
  methods: {
    required (val) {
      return  (val && val.length > 0 || 'field is required.')
    },
    validateUserName(val){
      return (4 <= val.length && 32 >= val.length) || 'Username at least 4 chars no special chars and no more than 32 chars.';
    },
    submit() {
      if(this.refs.username.validate()){
        this.$store.dispatch("login/USER_LOGIN",{
          username : this.username,
          password : this.password ,
        });
        if(this.$store.state.login.isLogin){
          this.$router.push("/");
        }
      }
    },
  }
})
</script>
