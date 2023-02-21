<template>
  <div>
    <q-card flat>
      <q-toggle v-model="use2FA" color="green" label="Use two-factor authentication" />
    </q-card>
    <q-dialog v-model="dialog">
      <q-card>
        <q-form @submit="login">
          <q-card-section>
            <div class="text-h6">Confirm</div>
            <q-input v-model="password" type="password" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Confirm" color="primary" type="submit" />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  data() {
    return {
      use2FA: false,
      dialog: false,
      qrImage: null,
      password: "",
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
  },
  created() {
    this.use2FA = this.user.otp
    this.$watch("use2FA", (val) => {
      if (val) {
        this.dialog = true
      } else {
        this.updateOtp(val)
      }
    })
  },
  methods: {
    login() {
      this.$api
        .post("/auth/login", {
          username: this.user.userName,
          password: this.password,
        })
        .then((res) => {
          this.$router.push("settings/2fa")
        })
    },
    async updateOtp(val) {
      await this.$store.dispatch("user/updateUserProfile", {
        otp: false,
      })
      this.$store.commit("auth/setUser", {
        ...this.user,
        otp: val,
      })
    },
  },
}
</script>
