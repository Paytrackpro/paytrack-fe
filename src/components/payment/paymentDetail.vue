<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-form class="q-ma-md" @submit="markAsPaid">
    <div class="row q-mb-md q-col-gutter-md">
      <div v-if="!isDraftStatus" class="col-12 col-sm-6 col-lg-4">
        <q-field :label="isSender ? 'Sent' : 'Received'" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <m-time :time="payment.sentAt"></m-time>
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <q-field label="Last Edited" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <m-time :time="payment.updatedAt"></m-time>
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-12 col-sm-12 col-lg-4" v-if="displayApprovers">
        <approver-display :approvers="payment.approvers" />
      </div>
      <div class="col-12 col-sm-6 col-lg-4" v-if="payment.senderId !== user.id">
        <q-field label="Sender" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.senderName || payment.externalEmail }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-12 col-sm-6 col-lg-4" v-if="payment.receiverId != user.id">
        <q-field label="Recipient" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.receiverName || payment.externalEmail }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <q-select
          v-if="processing"
          v-model="paymentStatus"
          :options="statusOption"
          outlined
          dense
          style="max-width: 300px"
          lazy-rules
          stack-label
          emit-value
          map-options
          borderless
          label="Status"
          :rules="[(val) => !!val || 'Status is required']"
        />
        <q-field v-else label="Status" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <payment-status :payment="payment" />
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <q-field label="Amount (USD)" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">${{ (payment.amount || 0).toFixed(2) }}</div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col">
        <p class="q-mt-none q-mb-xs text-weight-medium">Description</p>
        <q-input v-model="payment.description" readonly outlined type="textarea" borderless />
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div v-if="isEditPaymentSetting" class="col-12">
        <payment-setting :modelValue="payment.paymentSettings" readonly label="Accepted payment settings" />
      </div>
      <div v-if="isApprover || (user.id == payment.receiverId && !processing && !isPaidStatus)" class="col-12">
        <p><b class="text-weight-medium">Accepted coins: </b>{{ coinsAccepted }}</p>
      </div>
      <div v-if="!isApprover && isPaidStatus" class="col-12">
        <p>
          <b class="text-weight-medium">Paid in {{ (payment.paymentMethod || '').toUpperCase() }}: </b
          >{{ payment.paymentAddress }}
        </p>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div
        v-if="payment.paymentSettings && payment.paymentSettings.length && user.id == payment.receiverId && processing"
        class="col-12 col-sm-12 col-md-4"
      >
        <payment-setting-method
          :defautMethod="payment.paymentMethod"
          :readonly="!processing"
          @change="methodChange"
          :modelValue="payment.paymentSettings"
          label="Accepted payment coins"
        />
      </div>
      <div class="col-12 col-sm-6 col-md-4">
        <PaymentRateInput
          :readonly="!processing"
          :isShow="isShowExchangeRate"
          ref="rateInput"
          v-model="payment"
          v-model:loading="fetchingRate"
          @update:modelValue="updateLocal"
        />
      </div>
      <div v-if="isShowExchangeRate" class="col-12 col-sm-6 col-md-4">
        <q-field :label="`Amount to send (${(payment.paymentMethod || '').toUpperCase()})`" stack-label borderless>
          <template v-slot:control>
            <div class="self-center no-outline text-weight-bolder q-my-md rate-content" tabindex="0">
              {{ payment.expectedAmount }}
            </div>
            <q-btn
              v-if="processing"
              round
              dense
              flat
              class="q-ml-sm"
              icon="content_copy"
              @click="copy(payment.expectedAmount || '')"
            />
          </template>
        </q-field>
      </div>
    </div>
    <div v-if="!isApprover" class="row q-mb-md q-col-gutter-md">
      <div class="col-12">
        <q-input
          v-if="processing && !isConfirmedStatusChange"
          v-model="txId"
          label="Enter transaction ID of sent payment"
          ref="txId"
          outlined
          dense
          lazy-rules
          stack-label
        />
      </div>
      <p v-if="processing && isConfirmedStatusChange" class="text-caption text-italic col-12">
        Use Bulk Pay BTC to enter a Transaction ID
      </p>
      <div v-if="isPaidStatus" class="col-12 col-sm-6 col-md-4">
        <q-field label="Transaction id" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.txId }}
            </div>
          </template>
        </q-field>
      </div>
      <div v-if="!isApprover && isPaidStatus" class="col-12 col-sm-6 col-md-4">
        <q-field label="Paid At" stack-label borderless>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <m-time :time="payment.paidAt"></m-time>
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row q-mt-md" v-if="isShowInvoice && isShowCost">
      <p><b class="text-weight-medium">Hourly rate(USD/h): </b> ${{ payment.hourlyRate }}</p>
    </div>
    <div class="row q-mb-md q-col-gutter-md" v-if="isShowInvoice">
      <div class="col">
        <invoices-mode
          v-model="payment.details"
          readonly
          :hourlyRate="Number(payment.hourlyRate)"
          :showCost="isShowCost"
        />
      </div>
    </div>
    <div class="row justify-end q-mt-lg">
      <q-btn
        v-if="processable && processing"
        label="save"
        type="button"
        color="primary"
        :disable="fetchingRate || paying"
        class="q-mr-sm"
        @click="update"
      />
      <q-btn
        v-if="processable && processing"
        label="mark paid"
        type="submit"
        color="primary"
        :disable="fetchingRate || paying || isConfirmedStatusChange"
        class="q-mr-sm"
      />
      <q-btn
        v-if="processable && !processing"
        label="Process Payment"
        type="button"
        color="primary"
        @click="processPayment"
        class="q-mr-sm"
      />
      <q-btn
        v-if="rejectable && !processing"
        label="reject"
        type="button"
        color="primary"
        :disable="paying"
        @click="toggleRejectDialog(true)"
        class="q-mr-sm"
      />
      <q-btn
        v-if="editable && !processing"
        label="Edit"
        type="button"
        color="primary"
        @click="$emit('update:editing', true)"
        class="q-mr-sm"
      />
      <q-btn
        v-if="isDraftStatus && editable"
        label="Delete Draft"
        type="button"
        color="white"
        text-color="black"
        @click="confirm = true"
        class="q-mr-sm"
      />
      <q-dialog v-model="confirm" persistent>
        <q-card>
          <q-card-section class="row items-center">
            <q-avatar icon="warning" color="primary" text-color="white" />
            <span class="q-ml-sm">Are you sure to delete this draft payment request?</span>
          </q-card-section>
          <q-card-actions align="right">
            <q-btn flat label="Delete" color="primary" v-close-popup @click="deleteDraft()" />
            <q-btn flat label="Cancel" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
      <q-btn
        label="Approve"
        type="button"
        color="teal"
        text-color="white"
        v-if="approvalable"
        @click="handlerApprovalAction()"
        class="q-mr-sm"
      />
      <q-btn label="Cancel" type="button" color="white" text-color="black" @click="cancel" />
    </div>
    <PaymentRejectDialog
      v-model="paymentRejectDialog"
      @toggle="toggleRejectDialog"
      :paymentId="payment.id"
      :token="token"
    />
  </q-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MTime from 'components/common/mTime'
import PaymentSetting from 'components/payment/paymentSetting'
import { PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'
import PaymentStatus from 'components/payment/paymentStatus'
import PaymentRateInput from 'components/payment/paymentRateInput'
import PaymentRejectDialog from 'components/payment/paymentRejectDialog'
import InvoicesMode from 'components/payment/invoicesMode'
import ApproverDisplay from 'components/payment/approverDisplay'
import paymentSettingMethod from 'components/payment/paymentSettingMethod'
export default {
  name: 'paymentDetail',
  components: {
    MTime,
    PaymentSetting,
    PaymentStatus,
    PaymentRateInput,
    PaymentRejectDialog,
    InvoicesMode,
    ApproverDisplay,
    paymentSettingMethod,
  },
  data() {
    return {
      txId: '',
      methods: [],
      expanded: false,
      processing: false,
      fetchingRate: false,
      paying: false,
      payment: {},
      paymentRejectDialog: false,
      paymentStatus: '',
      confirm: false,
    }
  },
  props: {
    modelValue: Object,
    user: Object,
    token: String,
    paymentType: String,
    editing: Boolean,
  },
  methods: {
    ...mapActions({
      savePayment: 'payment/save',
    }),
    cancel() {
      if (this.processing) {
        this.processing = false
        return
      }
      const path = this.paymentType === PAYMENT_OBJECT_REQUEST ? 'get-paid' : 'pay'
      this.$router.push({ path: `/${path}` })
    },
    processPayment() {
      this.processing = true
      if (this.payment.paymentMethod !== 'none') {
        this.$refs.rateInput.fetchRate()
      }
    },
    markAsPaid() {
      const txId = this.txId.trim()
      if (
        txId.length === 0 &&
        !confirm(
          'Are you sure you want to mark the payment as paid? providing the txId will make the requester confirm your payment faster'
        )
      ) {
        this.$refs.txId.$el.focus()
        return
      }
      const reqData = {
        id: this.payment.id,
        txId: txId,
        token: this.token,
        paymentMethod: this.payment.paymentMethod,
        paymentAddress: this.payment.paymentAddress,
      }
      this.$api
        .post('/payment/process', reqData)
        .then((data) => {
          this.paying = false
          this.$emit('update:modelValue', data)
          this.$q.notify({
            message: 'Request marked as paid',
            color: 'positive',
            icon: 'check',
          })
        })
        .catch((err) => {
          this.paying = false
          responseError(err)
        })
    },
    async update() {
      const form = {
        ...this.payment,
        token: this.token,
        txId: this.txId,
      }
      if (this.isConfirmedStatusChange) {
        form.txId = ''
      }
      form.status = this.paymentStatus
      this.paying = true
      const { data } = await this.savePayment(form)
      this.paying = false
      if (data) {
        this.updateLocal(data.payment)
        this.$q.notify({
          message: 'payment is updated',
          color: 'positive',
          icon: 'check',
        })
      }
    },
    handlerApprovalAction(status) {
      const reqData = {
        paymentId: this.payment.id,
      }
      this.paying = true
      this.$api
        .post('/payment/approve', reqData)
        .then((data) => {
          if (data) {
            this.updateLocal(data)
            this.$q.notify({
              message: 'payment is updated',
              color: 'positive',
              icon: 'check',
            })
          }
        })
        .catch((err) => {
          responseError(err)
        })
        .finally(() => {
          this.paying = false
        })
    },
    updateLocal(payment, editing) {
      payment = payment || this.payment
      this.$emit('update:modelValue', payment)
      if (editing) {
        this.$emit('update:editing', true)
      }
    },
    methodChange(method) {
      const settings = this.payment.paymentSettings || []
      const setting = settings.find((s) => s.type === method)
      if (setting) {
        this.payment.paymentMethod = method
        this.payment.paymentAddress = setting.address
      }
      this.$refs.rateInput.fetchRate()
    },
    toggleRejectDialog(val) {
      this.paymentRejectDialog = val
    },
    isUserApproved() {
      let approver = this.payment.approvers || []
      let isApproved = false
      approver.forEach((el) => {
        if (el.approverId == this.user.id) {
          isApproved = el.isApproved
        }
      })
      return isApproved
    },
    isPaymentApproved() {
      let isAllApproved = true
      this.payment.approvers.forEach((el) => {
        if (!el.isApproved) {
          isAllApproved = false
        }
      })
      return isAllApproved
    },
    async copy(text) {
      await navigator.clipboard.writeText(text)
      this.$q.notify({
        type: 'positive',
        message: 'copied.',
        position: 'bottom',
      })
    },
    deleteDraft() {
      this.$api
        .delete(`/payment/delete/${this.payment.id}`)
        .then(() => {
          this.$q.notify({
            message: 'Draft has been deleted',
            color: 'positive',
            icon: 'check',
          })
          this.back()
        })
        .catch((err) => {
          responseError(err)
        })
    },
    back() {
      const path = this.paymentType === PAYMENT_OBJECT_REQUEST ? 'get-paid' : 'pay'
      this.$router.push({ path: `/${path}` })
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newPayment) {
        this.txId = newPayment.txId
        let settings = newPayment.paymentSettings || []
        this.methods = settings.map((s) => s.type)
        this.payment = { ...newPayment }
        this.paymentStatus = this.payment.status
        // setup default payment method
        const paymentSettings = this.payment.paymentSettings || []
        if (this.payment.paymentMethod === 'none' && paymentSettings.length) {
          let setting = paymentSettings[0]
          for (let ps of paymentSettings) {
            if (ps.isDefault) {
              setting = ps
              break
            }
          }
          this.payment.paymentMethod = setting.type
          this.payment.paymentAddress = setting.address
        }
      },
    },
  },
  computed: {
    ...mapGetters({
      role: 'user/getRole',
    }),
    statusOption() {
      let status = []
      if (this.payment.paymentMethod == 'btc') {
        status.push({
          label: 'Ready for Bulk BTC Payment',
          value: 'confirmed',
        })
      }
      if (this.payment.approvers && this.payment.approvers.length > 0) {
        if (this.isPaymentApproved()) {
          status.push({
            label: 'Approved',
            value: 'sent',
          })
        } else {
          status.push({
            label: 'Waiting for Approval',
            value: 'sent',
          })
        }
      } else {
        status.push({
          label: 'Received',
          value: 'sent',
        })
      }
      return status
    },
    coinsAccepted() {
      if (this.payment.paymentSettings && this.payment.paymentSettings.length) {
        return this.payment.paymentSettings
          .map((el) => el.type)
          .join(', ')
          .toUpperCase()
      }
      return ''
    },
    isApprover() {
      return this.payment.receiverId != this.user.id && this.payment.senderId != this.user.id
    },
    editable() {
      let isAllowStatus =
        ['draft', 'sent', 'confirmed', 'wait approve', 'approved', 'rejected'].indexOf(this.payment.status) !== -1
      let isSender = this.payment.senderId === this.user.id
      return isAllowStatus && isSender
    },
    processable() {
      return (
        ['draft', 'sent', 'confirmed', 'wait approve', 'approved'].indexOf(this.payment.status) !== -1 &&
        (this.payment.receiverId === this.user.id || (this.token && this.payment.receiverId === 0))
      )
    },
    approvalable() {
      if (this.user.id != this.payment.receiverId && this.user.id != this.payment.senderId && this.payment.status) {
        return !this.isUserApproved() && !['rejected', 'paid', 'confirmed'].includes(this.payment.status)
      } else {
        return false
      }
    },
    rejectable() {
      return this.user.id == this.payment.receiverId && ['sent', 'confirmed'].includes(this.payment.status)
    },
    isShowInvoice() {
      if (!this.payment.details) {
        return false
      }
      return this.payment.details.length > 0
    },
    isReceiver() {
      return this.user.id == this.payment.receiverId
    },
    isSender() {
      return this.payment.senderId === this.user.id
    },
    isEditPaymentSetting() {
      const isPaymentSettingExist = this.payment.paymentSettings && this.payment.paymentSettings.length
      return isPaymentSettingExist && !this.isApprover && !this.isReceiver && !this.isPaidStatus
    },
    isPaidStatus() {
      return this.payment.status == 'paid'
    },
    isDraftStatus() {
      return this.payment.status == 'draft'
    },
    isConfirmedStatusChange() {
      return this.paymentStatus == 'confirmed'
    },
    isShowExchangeRate() {
      return !this.isApprover && (this.payment.status == 'paid' || this.processing)
    },
    displayApprovers() {
      return this.payment.receiverId === this.user.id && this.payment.approvers && this.payment.approvers.length > 0
    },
    isShowCost() {
      var isShowCost = true
      let approver = this.payment.approvers || []
      approver.forEach((el) => {
        if (el.approverId == this.user.id) {
          isShowCost = el.showCost
          return
        }
      })
      return isShowCost
    },
  },
}
</script>

<style scoped></style>
