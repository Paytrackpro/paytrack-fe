<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-form class="q-ma-md" @submit="markAsPaid">
    <div class="row q-mb-md q-col-gutter-md" v-if="payment.receiverId === user.id">
      <div class="col-12">
        <q-field label="Approved by" stack-label>
          {{ approverText }}
        </q-field>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <q-field label="Sender" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.senderName || payment.externalEmail }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-field label="Recipient" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.receiverName || payment.externalEmail }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <q-select
          v-if="processing"
          v-model="paymentStatus"
          :options="statusOption"
          outlined
          dense
          lazy-rules
          stack-label
          emit-value
          map-options
          label="Status"
          :rules="[(val) => !!val || 'Status is required']"
        />
        <q-field v-else label="Status" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <payment-status :payment="payment" />
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <q-field label="Amount (USD)" stack-label>
          <template v-slot:prepend>
            <q-icon name="attach_money" />
          </template>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ (payment.amount || 0).toFixed(2) }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-4">
        <PaymentRateInput
          :readonly="!processing"
          ref="rateInput"
          v-model="payment"
          v-model:loading="fetchingRate"
          @update:modelValue="updateLocal"
        />
      </div>
      <div class="col-4">
        <q-field :label="`Amount to send (${(payment.paymentMethod || '').toUpperCase()})`" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline text-weight-bolder" tabindex="0">
              {{ payment.expectedAmount }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <q-select
          v-if="processing"
          v-model="payment.paymentMethod"
          :options="methods"
          outlined
          dense
          lazy-rules
          stack-label
          label="Payment method"
          @update:modelValue="methodChange"
          :rules="[(val) => !!val || 'Payment method is required']"
        />
        <q-field v-else label="Payment method" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.paymentMethod }}
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-8">
        <q-field :label="`Payment address (${payment.paymentMethod})`" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline text-weight-bolder" tabindex="0">
              {{ payment.paymentAddress }}
            </div>
          </template>
          <template v-slot:after>
            <q-btn round dense flat icon="content_copy" @click="copyAddress" />
          </template>
        </q-field>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div v-if="payment.paymentSettings && payment.paymentSettings.length" class="col-12">
        <payment-setting :modelValue="payment.paymentSettings" readonly label="Accepted payment settings" />
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-12">
        <q-input
          v-if="processing"
          v-model="txId"
          label="Enter transaction ID of sent payment"
          ref="txId"
          outlined
          dense
          lazy-rules
          stack-label
        />
        <q-field v-if="!processing" label="Transaction id" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              {{ payment.txId }}
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-3">
        <q-field label="Created At" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <m-date :date="payment.createdAt"></m-date>
            </div>
          </template>
        </q-field>
      </div>
      <div class="col-3">
        <q-field label="Paid At" stack-label>
          <template v-slot:control>
            <div class="self-center full-width no-outline" tabindex="0">
              <m-date :date="payment.paidAt"></m-date>
            </div>
          </template>
        </q-field>
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col">
        <p class="q-mt-none q-mb-xs text-weight-medium">Description</p>
        <q-input v-model="payment.description" readonly outlined type="textarea" />
      </div>
    </div>
    <div class="row q-mb-md q-col-gutter-md" v-if="isShowInvoice">
      <div class="col">
        <invoices-mode v-model="payment.details" readonly :hourlyRate="Number(payment.hourlyRate)" />
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
        :disable="fetchingRate || paying"
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
import MDate from 'components/common/mDate'
import PaymentSetting from 'components/payment/paymentSetting'
import { PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'
import PaymentStatus from 'components/payment/paymentStatus'
import PaymentRateInput from 'components/payment/paymentRateInput'
import PaymentRejectDialog from 'components/payment/paymentRejectDialog'
import InvoicesMode from 'components/payment/invoicesMode'
export default {
  name: 'paymentDetail',
  components: {
    MDate,
    PaymentSetting,
    PaymentStatus,
    PaymentRateInput,
    PaymentRejectDialog,
    InvoicesMode,
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
      approverText: '',
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
    async copyAddress() {
      await navigator.clipboard.writeText(this.payment.paymentAddress || '')
      this.$q.notify({
        type: 'positive',
        message: 'copied.',
        position: 'bottom',
      })
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
        let appovers = this.payment.approvers || []
        this.approverText = appovers
          .map((el) => {
            if (el.isApproved) {
              return el.approverName
            }
          })
          .join(', ')
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
      let status = [
        {
          label: 'Ready for Payment',
          value: 'confirmed',
        },
      ]
      if (this.payment.approvers.length > 0) {
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
      if (this.user.id != this.payment.receiverId && this.user.id != this.payment.senderId) {
        return !this.isUserApproved()
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
  },
}
</script>

<style scoped></style>
