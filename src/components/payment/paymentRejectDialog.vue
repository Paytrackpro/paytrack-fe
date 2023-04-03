<template>
  <q-dialog no-backdrop-dismiss no-esc-dismiss @before-hide="clearForm">
    <q-card class="note-wrap">
      <q-card-section>
        <div class="text-h6">Enter your reject notes</div>
        <q-input :autofocus="true" v-model="note" type="textarea" autogrow></q-input>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn flat label="Cancel" color="primary" type="button" @click="closeDialog" :disable="loading" />
        <q-btn flat label="Ok" color="primary" type="button" @click="doReject" :loading="loading" :disable="loading" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'PaymentRejectDialog',
  props: {
    dialog: Boolean,
    hideDialog: Function,
    paymentId: Number,
    token: String,
  },
  data() {
    return {
      note: '',
      loading: false,
    }
  },
  methods: {
    ...mapActions({
      enableOtp: 'user/enableOtp',
    }),
    async doReject() {
      this.loading = true
      try {
        await this.$api.post('/payment/reject', {
          rejectionReason: this.note,
          token: this.token,
          id: this.paymentId,
        })
        this.$q.notify({
          message: 'payment has been rejected',
          color: 'positive',
          icon: 'check',
        })
        this.closeDialog()
        this.$router.back()
      } catch (error) {
        responseError(err)
      }
      this.loading = false
    },
    closeDialog() {
      this.$emit('toggle', false)
    },
    clearForm() {
      this.note = ''
    },
  },
}
</script>

<style>
.note-wrap {
  width: 40vw;
}
</style>
