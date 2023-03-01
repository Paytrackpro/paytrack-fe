<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="position-relative">
          <img class="absolute q-ma-md" v-bind:style="{ height: '2em' }" src="~assets/team_raedah.svg" />
          <div v-bind:style="{ maxWidth: '28rem' }" class="flex flex-center q-mx-auto window-height">
            <div class="column justify-center q-pa-xl col-grow">
              <div class="flex items-center q-mb-md q-gutter-sm text-grey-7">
                <span class="text-bold">Login</span>
              </div>
              <q-card class="col" flat bordered>
                <q-card-section class="q-pa-lg">
                  <q-form class="q-gutter-y-md" @submit="verifyOtp">
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
                    <p v-if="error" class="q-mb-none text-red">{{ error }}</p>
                    <q-btn label="Confirm" type="submit" color="primary" class="full-width" />
                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import role from 'src/consts/role'
import { mapGetters } from "vuex"
export default {
  name: "pageOpt",
  data() {
    return {
      otp: "",
      error: null,
      tempUser: JSON.parse(localStorage.getItem("tempUser"))
    }
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
  },
  created() {
    if (!this.tempUser) {
      this.$router.push({ name: 'login' })
    }
  },
  methods: {
    verifyOtp() {
      this.$store
        .dispatch("auth/verifyOtp", {
          otp: this.otp,
          userId: `${this.tempUser.userId}`,
        })
        .then(() => {
          this.$router.push({ name: "homse" })
        })
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
