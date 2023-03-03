<template>
  <q-card flat>
    <q-toggle
      v-model="use2FA"
      color="green"
      label="Use two-factor authentication"
    />
    <q-toggle v-model="usePasskey" color="green" label="Use passkey" />
    <q-dialog v-model="dialog" no-backdrop-dismiss no-esc-dismiss>
      <q-card>
        <q-form @submit="login">
          <q-card-section>
            <div class="text-h6">
              Please confirm your password to active two-factor authentication
            </div>
            <q-input v-model="password" type="password" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              type="button"
              @click="hideDialog"
            />
            <q-btn
              flat
              label="Confirm"
              color="primary"
              type="submit"
              :loading="loading"
              :disable="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
    <q-dialog v-model="otpDialog" no-backdrop-dismiss no-esc-dismiss>
      <q-card>
        <q-form @submit="disableOtp">
          <q-card-section>
            <div class="text-h6">
              Please confirm your OTP to disable this function
            </div>
            <q-input v-model="otp" type="text" />
          </q-card-section>

          <q-card-actions align="right">
            <q-btn
              flat
              label="Cancel"
              color="primary"
              type="button"
              @click="hideOtpDialog"
            />
            <q-btn
              flat
              label="Confirm"
              color="primary"
              type="submit"
              :loading="loading"
              :disable="loading"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "userSetting",
  data() {
    return {
      use2FA: false,
      usePasskey: false,
      dialog: false,
      qrImage: null,
      password: "",
      loading: false,
      otpDialog: false,
      otp: null,
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
  },
  watch: {
    usePasskey(val) {
      if (val) {
        this.enablePasskey();
      }
    },
  },
  created() {
    this.use2FA = this.user.otp;
    this.$watch("use2FA", (val) => {
      if (val != this.user.otp) {
        if (val) this.dialog = true;
        else this.otpDialog = true;
      }
    });
  },
  methods: {
    login() {
      this.loading = true;
      this.$api
        .post("/auth/login", {
          username: this.user.userName,
          password: this.password,
        })
        .then((res) => {
          this.$router.push("settings/2fa");
        })
        .finally(() => {
          this.loading = false;
        });
    },
    async disableOtp(val) {
      await this.$store.dispatch("user/disableOtp", {
        otp: this.otp,
      });
      this.otpDialog = false;
      this.$store.commit("auth/setUser", {
        ...this.user,
        otp: false,
      });
    },
    hideDialog() {
      this.use2FA = !this.use2FA;
      this.dialog = false;
    },
    hideOtpDialog() {
      this.use2FA = !this.use2FA;
      this.otpDialog = false;
    },
    async enablePasskey() {
      const options = {
        // TODO: replace with random string from server
        challenge: new Uint8Array(26),
        rp: {
          name: "MGMT",
        },
        // TODO: replace with actual user info
        user: {
          id: Uint8Array.from("userId", (c) => c.charCodeAt(0)),
          name: "testmgmt@mail.com",
          displayName: "testmgmt",
        },

        pubKeyCredParams: [
          { alg: -257, type: "public-key" },
          // { alg: -7, type: "public-key" },
        ],
        // authenticatorSelection: {
        //   authenticatorAttachment: "cross-platform",
        // },
        timeout: 60000,
        attestation: "direct",
      };

      const credential = await navigator.credentials.create({
        publicKey: options,
      });

      console.log(credential);
    },
  },
};
</script>
