<template>
  <q-form v-if="isShowForm" @submit.prevent="onSubmit">
    <q-card class="row q-pa-md" flat bordered>
      <div class="col-6">
        <div class="text-h6">Setup authenticator app</div>
        <p>Scan the QR code</p>
        <q-img :src="qrImage" width="200px" height="200px"></q-img>
        <p>
          Use an authenticator app from your phone to scan.<br />
          Enter the 6-digit code from your authenticator app below.
        </p>
        <q-input placeholder="Code" dense outlined v-model="code"></q-input>
        <div class="q-mt-md">
          <q-btn type="submit" :loading="loading" :disable="loading" color="primary" class="q-mr-xs"> Verify </q-btn>
          <q-btn type="button" :loading="loading" :disable="loading" @click="clearQr"> Cancel </q-btn>
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
