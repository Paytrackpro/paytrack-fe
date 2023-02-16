<template>
  <q-card flat bordered class="q-pa-md">
    <q-card-section>
      <div class="text-h6 profile-title">User Profile</div>
    </q-card-section>
    <q-separator inset />
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-4">
        <q-field label="User name" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{ user.userName }}</div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Display Name" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{ user.displayName }}</div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Email" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">{{ user.email }}</div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="text-right">
      <q-btn color="primary" label="Edit" to='profile'/>
    </div>
  </q-card>
</template>

<script>
export default {
  name: "ProfileInfo",
  components: {},
  data() {
    let user = localStorage.getItem("user")
    if (typeof(user) == "string" && user.length > 0) {
      user = JSON.parse(user)
    } else {
      user = {}
    }
    return {
      user,
      loading: false,
      editing: false,
      isForbidden: false,
      isNotfound: false,
      isUnknownError: false,
      payment: {}
    }
  },
}
</script>

<style scoped>
 .profile-padding{
    padding: 20px 50px;
 }
 .profile-title{
  text-transform: uppercase;
  font-weight: bold;
 }
</style>
