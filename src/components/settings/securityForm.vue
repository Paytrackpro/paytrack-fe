<template>
  <q-form>
    <div class="q-pb-md">
      <SwitchButton2FA v-model="enabled2FA" @onUpdateValue="showDialogs" />
    </div>
    <QRCodeVerify @verified="verified" />
    <EnableOtpDialog v-model="enableDialog" @hideDialog="hideDialog" />
    <DisableOtpDialog v-model="disableDialog" @hideDialog="hideOtpDialog" />
    <q-btn v-if="!qrImage" color="white" text-color="black" label="Change password" @click="changePassDialog = true" />
    <ChangePassword v-model="changePassDialog" :is-otp="user.otp || false"/>
  </q-form>
</template>

<script>
import ChangePassword from "components/settings/changePassword";
import {
  SwitchButton2FA,
  EnableOtpDialog,
  QRCodeVerify,
  DisableOtpDialog,
} from "components/settings";
import {mapGetters, mapMutations} from "vuex";
export default {
  name: "securityUser",
  components: {
    SwitchButton2FA,
    EnableOtpDialog,
    QRCodeVerify,
    DisableOtpDialog,
    ChangePassword,
  },
  props: {
    modelValue: Object
  },
  data() {
    return {
      loading: false,
      user: {},
      enabled2FA: false,
      enableDialog: false,
      disableDialog: false,
      changePassDialog: false
    }
  },
  methods: {
    ...mapMutations({
      updateUserState: "user/setUser",
    }),
    showDialogs(enable) {
      if (enable && !this.user.otp) {
        this.enableDialog = true;
      }
      if (!enable && this.user.otp) {
        this.disableDialog = true;
      }
    },
    hideDialog() {
      this.enableDialog = false;
    },
    hideOtpDialog(ok) {
      this.enabled2FA = !ok
      if (ok) {
        this.updateUser({
          ...this.user,
          otp: false
        })
      }
      this.disableDialog = false;
    },
    verified(ok) {
      this.enabled2FA = ok
      if (ok) {
        this.enabled2FA = true
        this.updateUser({
          ...this.user,
          otp: true
        })
      }
    },
    updateUser(user){
      this.updateUserState(user)
      this.$emit("update:modelValue", user)
    }
  },
  watch: {
    modelValue : {
      immediate: true,
      handler(newVal) {
        this.user = {...newVal}
        this.enabled2FA = !!this.user.otp
      }
    }
  },
  computed: {
    ...mapGetters({
      qrImage: "user/getQrImage",
    }),
  }
}
</script>

<style scoped>

</style>
