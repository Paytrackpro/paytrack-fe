<template>
  <q-card class="col" flat bordered>
    <q-card-section class="q-pa-lg">
      <q-form class="q-gutter-y-md" @submit="loginOtp()">
        <div>
          <p class="q-mt-none q-mb-xs text-weight-medium">OTP</p>
          <q-input
            v-model="otp"
            outlined
            dense
            placeholder="OTP"
            lazy-rules
            stack-label
            hide-bottom-space
            :rules="[(val) => (val && val.length > 0) || 'Please enter your otp']"
          />
        </div>
        <p class="q-mb-none text-red">{{ error }}</p>
        <q-btn label="Confirm" type="button" color="primary" class="full-width" @click="loginOtp" />
      </q-form>
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'OptLogin',
  props: {
    login: Function,
    error: String,
  },
  data() {
    return {
      otp: '',
    }
  },
  methods: {
    loginOtp() {
      this.$emit('login', this.otp)
    },
  },
}
</script>

<style lang="scss">
.link {
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
}
</style>
