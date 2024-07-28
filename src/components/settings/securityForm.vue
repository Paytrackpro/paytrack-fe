<template>
  <q-form>
    <div class="q-pb-md">
      <SwitchButton2FA v-model="enabled2FA" @onUpdateValue="showDialogs" />
    </div>
    <QRCodeVerify @verified="verified" />
    <EnableOtpDialog v-model="enableDialog" @hideDialog="hideDialog" />
    <DisableOtpDialog v-model="disableDialog" @hideDialog="hideOtpDialog" />
    <q-btn v-if="!qrImage && authType != 1" color="primary" label="Change password" @click="changePassDialog = true" />
    <q-btn v-if="!qrImage && authType == 1" color="primary" label="Reset Passkey" @click="resetPasskey()" />
    <q-btn v-if="!qrImage && authType == 1" color="primary" label="Add Key" class="q-ml-sm" @click="addPasskey()" />
    <ChangePassword v-model="changePassDialog" :is-otp="user.otp || false" />
    <q-dialog v-model="passkeyDialog" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="primary" text-color="white" size="md" />
          <span class="q-ml-sm">{{ updatePasskeyMsg }}</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat unelevated rounded label="Yes" color="primary" v-close-popup @click="handlerUpdatePasskey()" />
          <q-btn flat unelevated rounded label="Cancel" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script>
import ChangePassword from 'components/settings/changePassword'
import { SwitchButton2FA, EnableOtpDialog, QRCodeVerify, DisableOtpDialog } from 'components/settings'
import { mapGetters, mapMutations, mapActions } from 'vuex'
import { startRegistration } from '@simplewebauthn/browser'
export default {
  name: 'securityUser',
  components: {
    SwitchButton2FA,
    EnableOtpDialog,
    QRCodeVerify,
    DisableOtpDialog,
    ChangePassword,
  },
  props: {
    modelValue: Object,
  },
  data() {
    return {
      loading: false,
      user: {},
      enabled2FA: false,
      enableDialog: false,
      disableDialog: false,
      changePassDialog: false,
      passkeyDialog: false,
      authType: 0,
      isResetPasskey: false,
      updatePasskeyMsg: '',
    }
  },
  created() {
    this.$api
      .get(`/auth/auth-method`)
      .then((data) => {
        this.authType = data
      })
      .catch((err) => {
        responseError(err)
      })
  },
  methods: {
    ...mapMutations({
      updateUserState: 'user/setUser',
    }),
    ...mapActions({
      setLogin: 'user/setLogin',
    }),
    resetPasskey() {
      this.isResetPasskey = true
      this.updatePasskeyMsg = 'Invalidated your current passkey and makes a new one. Would you like to continue?'
      this.passkeyDialog = true
    },
    addPasskey() {
      this.isResetPasskey = false
      this.updatePasskeyMsg = 'Resend your current passkey to your passkey manager. Would you like to continue?'
      this.passkeyDialog = true
    },
    handlerUpdatePasskey() {
      this.passkeyDialog = false
      this.$api
        .post('/auth/update-passkey-start', {})
        .then((resultData) => {
          this.handlerFinishUpdatePasskey(resultData.options, resultData.sessionkey)
        })
        .catch((err) => {
          responseError(err)
        })
    },
    async handlerFinishUpdatePasskey(opts, sessionKey) {
      let asseResp
      try {
        asseResp = await startRegistration(opts.publicKey)
      } catch (error) {
        console.log('Conditional UI request was aborted')
        this.cancelRegisterUser(sessionKey)
        return
      }
      this.$api
        .post('/auth/update-passkey-finish?sessionKey=' + sessionKey + '&isReset=' + this.isResetPasskey, asseResp)
        .then((res) => {
          this.setLogin(res)
          this.$q.notify({
            message: 'Passkey updated successfully',
            color: 'positive',
            icon: 'check',
          })
        })
        .catch((err) => {
          this.cancelRegisterUser(sessionKey)
          responseError(err)
        })
    },
    cancelRegisterUser(sessionKey) {
      this.$api
        .post('/auth/cancel-register?sessionKey=' + sessionKey)
        .then((res) => {
          console.log('cancel register successfully')
        })
        .catch((err) => {
          responseError(err)
        })
    },
    showDialogs(enable) {
      if (enable && !this.user.otp) {
        this.enableDialog = true
      }
      if (!enable && this.user.otp) {
        this.disableDialog = true
      }
    },
    hideDialog(ok) {
      this.enableDialog = false
      this.enabled2FA = ok
    },
    hideOtpDialog(ok) {
      this.enabled2FA = !ok
      if (ok) {
        this.updateUser({
          ...this.user,
          otp: false,
        })
      }
      this.disableDialog = false
    },
    verified(ok) {
      this.enabled2FA = ok
      if (ok) {
        this.enabled2FA = true
        this.updateUser({
          ...this.user,
          otp: true,
        })
      }
    },
    updateUser(user) {
      this.updateUserState(user)
      this.$emit('update:modelValue', user)
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.user = { ...newVal }
        this.enabled2FA = !!this.user.otp
      },
    },
  },
  computed: {
    ...mapGetters({
      qrImage: 'user/getQrImage',
    }),
  },
}
</script>

<style scoped></style>
