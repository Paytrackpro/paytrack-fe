<template>
  <q-card flat>
    <SwitchButton2FA v-model="enabled2FA" @onUpdateValue="showDialogs" />
    <QRCodeVerify @verified="verified" />
    <EnableOtpDialog v-model="enableDialog" @hideDialog="hideDialog" />
    <DisableOtpDialog v-model="disableDialog" @hideDialog="hideOtpDialog" />
  </q-card>
</template>

<script>
import { mapGetters } from "vuex";

import {
  SwitchButton2FA,
  EnableOtpDialog,
  QRCodeVerify,
  DisableOtpDialog,
} from "components/settings";

export default {
  name: "userSetting",
  components: {
    SwitchButton2FA,
    EnableOtpDialog,
    QRCodeVerify,
    DisableOtpDialog,
  },
  data() {
    return {
      enabled2FA: false,
      enableDialog: false,
      disableDialog: false,
    };
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
  },
  created() {
    this.enabled2FA = this.user.otp;
  },
  methods: {
    showDialogs(enable) {
      if (enable && !this.user.otp) {
        this.enableDialog = true;
      }
      if (!enable && this.user.otp) {
        this.disableDialog = true;
      }
    },
    hideDialog() {
      this.enabled2FA = this.user.otp;
      this.enableDialog = false;
    },
    hideOtpDialog() {
      this.enabled2FA = this.user.otp;
      this.disableDialog = false;
    },
    verified() {
      this.enabled2FA = this.user.otp;
    },
  },
};
</script>
