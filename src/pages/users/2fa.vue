<template>
  <q-form @submit.prevent="verifyOtp">
    <q-card class="row q-pa-md" flat bordered>
      <div class="col-6">
        <div class="text-h6">Setup authenticator app</div>
        <p>Scan the QR code</p>
        <q-img :src="qrImage" width="200px" height="200px"></q-img>

        <p>
          Use an authenticator app from your phone to scan.<br />
          Enter the 6-digit code from your authenticator app below.
        </p>

        <q-input v-model="otp" placeholder="Code" dense outlined></q-input>
        <q-btn type="submit" :loading="loading" :disable="loading">Verify</q-btn>
      </div>
    </q-card>
  </q-form>
</template>

<script>
import { mapGetters } from "vuex"
import {responseError} from "src/helper/error";
export default {
  name: "2faPage",
  data() {
    return {
      dialog: false,
      qrImage: null,
      otp: null,
      loading: false,
    }
  },
  created() {
    this.enable2FA()
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
      role: "auth/getRole",
    }),
  },
  methods: {
    enable2FA() {
      this.$api.get("/user/generate-otp").then((data) => {
        this.qrImage = data.mfa_qr_image
      })
    },
    verifyOtp() {
      this.loading = true
      this.$store
        .dispatch("auth/verifyOtp", {
          otp: this.otp,
          userId: `${this.user.id}`,
          firstTime: true,
        })
        .then(() => {
          this.$store.commit("auth/setUser", {
            ...this.user,
            otp: true,
          })
          this.$q.notify({
            message: "2FA activated",
            color: "positive",
            icon: "check",
          })
          this.$router.push({ name: `${this.role}.settings` })
        })
        .catch(err => {
          responseError(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>
