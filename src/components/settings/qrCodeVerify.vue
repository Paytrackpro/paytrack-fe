<template>
  <q-form v-if="isShowForm" @submit.prevent="onSubmit">
    <q-card class="row q-px-md" flat>
      <div class="col">
        <div class="text-h6">Setup authenticator app</div>
        <p>Scan the QR code</p>
        <div class="row">
          <div class="col-12 col-sm-6 q-mt-sm">
            <q-img :src="qrImage" width="200px" height="200px"></q-img>
          </div>
          <div class="col-12 col-sm-6 q-mt-md">
            <div class="q-mb-md"><b>Can't scan the code?</b></div>
            <div class="q-mb-md">
              To add the entry manually, provide the following details to the application on your phone.
            </div>
            <div>Account: {{ qrAccount }}</div>
            <div>
              Key: <code>{{ qrKey }}</code>
            </div>
            <div>Time based: Yes</div>
          </div>
        </div>
        <p class="q-mt-sm">
          Use an authenticator app from your phone to scan.<br />
          Enter the 6-digit code from your authenticator app below.
        </p>
        <div class="row">
          <div class="col-12 col-sm-6">
            <q-input class="q-mt-sm" placeholder="Code" dense outlined v-model="code"></q-input>
          </div>
        </div>
        <div class="q-mt-lg">
          <q-btn type="submit" :loading="loading" :disable="loading" color="primary" class="q-mr-sm btn-animated btn">
            Verify
          </q-btn>
          <q-btn type="button" :loading="loading" :disable="loading" @click="clearQr" class="btn-animated btn">
            Cancel
          </q-btn>
        </div>
      </div>
    </q-card>
  </q-form>
</template>

<script>
import { mapGetters, mapActions, mapMutations } from 'vuex'
import { responseError } from 'src/helper/error'

export default {
  name: 'QRCodeVerify',
  data() {
    return {
      code: '',
      loading: false,
    }
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
      qrImage: 'user/getQrImage',
      qrAccount: 'user/getQrAccount',
      qrKey: 'user/getQrKey',
      tempPassword: 'user/getTempPassword',
    }),
    isShowForm() {
      return this.qrImage && !this.user.otp
    },
  },
  methods: {
    ...mapActions({
      verifyOtp: 'user/verifyOtp',
    }),
    ...mapMutations({
      updateUser: 'user/setUser',
      removeQrImage: 'user/setQrImage',
      removeTempPassword: 'user/setTempPassword',
    }),
    async onSubmit() {
      this.loading = true
      const err = await this.verifyOtp({
        otp: this.code,
        firstTime: true,
        password: this.tempPassword,
      })
      this.loading = false
      if (err) {
        responseError(err)
        return
      }
      this.$q.notify({
        message: '2FA activated',
        color: 'positive',
        icon: 'check',
      })
      this.removeQrImage('')
      this.removeTempPassword('')
      this.$emit('verified', true)
    },
    clearQr() {
      this.removeQrImage('')
      this.removeTempPassword('')
      this.$emit('verified', false)
    },
  },
  watch: {
    qrImage: {
      immediate: true,
      handler() {
        this.code = ''
      },
    },
  },
}
</script>
