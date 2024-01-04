<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-form @submit="markAsPaid">
    <q-card-section class="card-header">
      <div class="row justify-between">
        <div class="row">
          <div class="text-h6 title-case">Payment request</div>
          <payment-status
            v-if="payment.status && (!isReceiver || isPaidStatus)"
            :paymentModel="payment"
            class="q-ml-md"
            :isShowIcon="true"
          />
        </div>
        <div class="row justify-end">
          <q-btn
            v-if="processable && !isRejectedStatus"
            label="Pay"
            type="button"
            color="primary"
            @click="payDialog = true"
            class="q-mr-sm btn btn-animated"
          />
          <q-btn
            v-if="isUploadDisplay"
            label="Upload"
            type="button"
            color="secondary"
            @click="uploadReceipt()"
            class="q-mr-sm btn btn-animated"
          />
          <q-btn
            v-if="editable"
            label="Edit"
            type="button"
            color="primary"
            @click="$emit('update:editing', true)"
            class="q-mr-sm btn btn-animated"
          />
          <q-btn
            v-if="isDraftStatus && editable"
            label="Delete Draft"
            type="button"
            color="white"
            text-color="black"
            @click="confirm = true"
            class="q-mr-sm btn btn-animated"
          />
          <q-dialog v-model="confirm" persistent>
            <q-card>
              <q-card-section class="row items-center">
                <q-avatar icon="warning" color="primary" text-color="white" size="md" />
                <span class="q-ml-sm">Are you sure to delete this draft payment request?</span>
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat unelevated rounded label="Delete" color="primary" v-close-popup @click="deleteDraft()" />
                <q-btn flat unelevated rounded label="Cancel" color="primary" v-close-popup />
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
            class="q-mr-sm btn btn-animated"
          />
        </div>
      </div>
      <q-select
        v-if="isReceiver && !isPaidStatus"
        v-model="paymentStatus"
        :options="statusOption"
        dense
        style="max-width: 250px"
        lazy-rules
        stack-label
        emit-value
        map-options
        borderless
        :class="'rounded bg-' + getStatusInfoColor(paymentStatus).statusColor + ' status-select'"
      >
        <template v-slot:prepend>
          <q-icon class="text-white q-ml-md" :name="getStatusInfoColor(paymentStatus).statusIcon" />
        </template>
        <template v-slot:option="scope">
          <q-item
            v-bind="scope.itemProps"
            v-on="scope.itemEvents"
            :class="'bg-' + getStatusInfoColor(scope.opt.value).statusColor"
          >
            <q-item-section>
              <q-item-label class="text-white text-size-14" caption>
                <q-icon size="sm" :name="getStatusInfoColor(scope.opt.value).statusIcon"></q-icon>
                {{ scope.opt.label }}</q-item-label
              >
            </q-item-section>
          </q-item>
        </template>
      </q-select>
      <p class="text-red" v-if="payment.status === 'rejected'">
        <q-icon name="info" color="red" />
        <b>Rejected Reason:</b> {{ payment.rejectionReason }}
      </p>
    </q-card-section>
    <div class="q-ma-lg">
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow" v-if="payment.senderId !== user.id">
          <custom-field :label="'Sender'" :value="getSenderName" />
        </div>
        <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow" v-if="payment.receiverId != user.id">
          <custom-field :label="'Recipient'" :value="getRecipientName" />
        </div>
        <div class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow" v-if="!isShowInvoice">
          <p class="q-mb-xs">
            <b class="text-weight-medium">Amount (USD)</b>
          </p>
          <q-field stack-label borderless>
            <template v-slot:control>
              <span class="amount-text">${{ (payment.amount || 0).toFixed(2) }}</span>
            </template>
          </q-field>
        </div>
        <div :class="'col-12 ' + getDescriptionColStyle() + ' q-py-sm q-my-sm field-shadow'">
          <custom-field :label="'Description'" :value="payment.description" />
        </div>
        <div v-if="!isDraftStatus" class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
          <p class="q-mb-xs">
            <b>{{ isSender ? 'Sent' : 'Received' }}:&nbsp;&nbsp;</b><m-time :time="payment.sentAt"></m-time>
          </p>
          <q-field stack-label borderless>
            <template v-slot:control>
              <b>Last Edited:&nbsp;&nbsp;</b><m-time :time="payment.updatedAt"></m-time>
            </template>
          </q-field>
        </div>
      </div>
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-12 col-lg-4 q-py-sm q-my-sm field-shadow" v-if="displayApprovers">
          <approver-display :approvers="payment.approvers" />
        </div>
      </div>
      <div class="row q-mb-xs q-col-gutter-md">
        <div v-if="isEditPaymentSetting" class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
          <payment-setting :modelValue="payment.paymentSettings" readonly label="Accepted Payment Settings" />
        </div>
        <div
          v-if="isApprover || (user.id == payment.receiverId && !processing && !isPaidStatus)"
          class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow"
        >
          <p><b class="text-weight-medium">Accepted Coins</b></p>
          <q-field stack-label borderless>
            <coin-label v-for="(setting, i) of payment.paymentSettings" :key="i" :type="setting.type" />
          </q-field>
        </div>
        <div v-if="!isApprover && isPaidStatus" class="col-12 col-sm-6 col-lg-4 q-py-sm q-my-sm field-shadow">
          <p class="q-mb-xs">
            <b class="text-weight-medium">Paid in</b>
          </p>
          <q-field :class="customClass" :style="customStyle" stack-label borderless>
            <template v-slot:control>
              <coin-label :type="payment.paymentMethod" hasAddress :address="payment.paymentAddress" />
            </template>
          </q-field>
        </div>
        <div v-if="isShowExchangeRate" class="col-12 col-sm-6 col-md-4 q-py-sm q-my-sm field-shadow">
          <PaymentRateInput
            :readonly="true"
            ref="rateInput"
            v-model="payment"
            v-model:loading="fetchingRate"
            @update:modelValue="updateLocal"
          />
        </div>
        <div v-if="isShowExchangeRate" class="col-12 col-sm-6 col-md-4 q-py-sm q-my-sm field-shadow">
          <div>
            <p class="q-mb-xs">
              <b class="text-weight-medium">Amount to send ({{ (payment.paymentMethod || '').toUpperCase() }}) </b>
            </p>
            <q-field stack-label borderless>
              <template v-slot:control>
                <span class="text-weight-bolder text-blue-8">{{ payment.expectedAmount }}</span>
              </template>
            </q-field>
          </div>
        </div>
        <div v-if="!isApprover && isPaidStatus" class="col-12 col-sm-6 col-md-4 q-py-sm q-my-sm field-shadow">
          <!-- <custom-field :label="'Transaction id'" :value="payment.txId" /> -->
          <p class="q-mb-xs">
            <b class="text-weight-medium">Transaction id</b>
          </p>
          <p>{{ payment.txId }}</p>
        </div>
        <div v-if="!isApprover && isPaidStatus" class="col-12 col-sm-6 col-md-4 q-py-sm q-my-sm field-shadow">
          <custom-field :label="'Paid At'" isTime :value="payment.paidAt" />
        </div>
        <div class="col-12" v-if="displayAttachReceipt">
          <p class="q-mb-xs">
            <b class="text-weight-medium">{{ isSender ? 'Attach Receipt' : 'Receipt' }}</b>
          </p>
          <q-field borderless v-if="isSender">
            <template v-slot:control>
              <q-file
                v-model="receiptAttachFile"
                accept=".jpg, .png, image/*"
                class="receipt-input-file"
                label="Pick files"
                filled
                @rejected="onRejected"
                style="max-width: 300px"
              >
                <template v-slot:prepend>
                  <q-icon name="attach_file" />
                </template>
              </q-file>
            </template>
          </q-field>
          <q-img
            style="height: 100px; max-width: 100px; justify-content: center; align-items: center"
            class="q-mt-sm"
            v-if="receiptAttachFile != null"
            :src="getImageUrl()"
          />
          <q-img
            style="height: 100px; max-width: 100px; justify-content: center; align-items: center"
            class="cursor-pointer zoom-hover-1-05 q-mt-sm"
            v-if="imageBase64 != '' && receiptAttachFile == null"
            @click="receiptImageDialog = true"
            :src="imageBase64"
          />
        </div>
      </div>
      <div class="row" v-if="isShowInvoice && isShowCost">
        <p>
          <b class="text-weight-medium">Hourly Rate (USD/h): ${{ payment.hourlyRate.toFixed(2) }} &nbsp;&nbsp;|</b>
        </p>
        <p class="q-mt-none q-ml-md q-mb-xs text-weight-medium">
          Total Hours :
          {{ (totalHours % 1 != 0 ? totalHours.toFixed(2) : totalHours) + ' hour' + (totalHours > 1.0 ? 's' : '') }}
          &nbsp;&nbsp;|
        </p>
        <p class="q-mt-none q-ml-md q-mb-xs text-weight-medium">Total Cost (USD) : ${{ payment.amount }}</p>
      </div>
      <div class="row q-mb-md q-col-gutter-md q-mt-xs" v-if="isShowInvoice">
        <div class="col">
          <invoices-mode
            v-model="payment.details"
            :amount="payment.amount"
            readonly
            v-model:hourlyRate="payment.hourlyRate"
            :showDateOnInvoiceLine="payment.showDateOnInvoiceLine"
            :showCost="isShowCost"
          />
        </div>
      </div>
      <div class="row q-mb-md q-col-gutter-md q-mt-xs" v-if="isDraftStatus && editable && payment.receiverId">
        <q-checkbox label="Show Draft for Recipient" v-model="payment.showDraftRecipient" @click="update" />
      </div>
      <PaymentRejectDialog
        v-model="paymentRejectDialog"
        @toggle="toggleOnChildRejectDialog"
        :paymentId="payment.id"
        :token="token"
      />
    </div>
    <q-dialog v-model="receiptImageDialog">
      <q-card style="width: 550px; max-width: 80vw">
        <q-img style="justify-content: center; align-items: center" :src="imageBase64" />
      </q-card>
    </q-dialog>

    <q-dialog v-model="payDialog">
      <q-card style="width: 550px; max-width: 80vw">
        <q-card-section class="row">
          <div class="text-h6">Pay For Payment Request</div>
        </q-card-section>
        <q-card-section class="q-pt-xs q-px-lg row">
          <div
            v-if="payment.paymentSettings && payment.paymentSettings.length && user.id == payment.receiverId"
            class="col-12 q-py-md field-shadow"
          >
            <payment-setting-method
              :defautMethod="payment.paymentMethod"
              @change="methodChange"
              :modelValue="payment.paymentSettings"
              label="Accepted payment coins"
            />
          </div>
          <div class="col-6 q-py-md field-shadow">
            <PaymentRateInput
              ref="rateInput"
              v-model="payment"
              v-model:loading="fetchingRate"
              @update:modelValue="updateLocal"
            />
          </div>
          <div class="col-6 q-py-md field-shadow">
            <div>
              <p class="q-mb-xs">
                <b class="text-weight-medium">Amount to send ({{ (payment.paymentMethod || '').toUpperCase() }}) </b>
              </p>
              <q-field stack-label borderless>
                <template v-slot:control>
                  <span class="text-weight-bolder text-blue-8 text-size-18">{{ payment.expectedAmount }}</span>
                  <q-btn round dense flat class="q-ml-sm" @click="copy(payment.expectedAmount || '')">
                    <q-icon size="sm" class="custom-icon" :name="'o_content_copy'" />
                    <q-tooltip>Copy Amount (BTC)</q-tooltip>
                  </q-btn>
                </template>
              </q-field>
            </div>
          </div>
          <div class="col-12 q-py-md">
            <p class="q-mb-xs">
              <b class="text-weight-medium">Enter transaction ID of sent payment</b>
            </p>
            <div class="row">
              <q-input class="col-12" v-model="txId" ref="txId" outlined dense lazy-rules stack-label />
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pb-md">
          <q-btn color="secondary" label="Mark paid" @click="markAsPaid" :disable="fetchingRate || txId == ''" />
          <q-btn label="Cancel" type="button" color="white" text-color="black" @click="payDialog = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MTime from 'components/common/mTime'
import PaymentSetting from 'components/payment/paymentSetting'
import { PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'
import PaymentRateInput from 'components/payment/paymentRateInput'
import PaymentRejectDialog from 'components/payment/paymentRejectDialog'
import InvoicesMode from 'components/payment/invoicesMode'
import ApproverDisplay from 'components/payment/approverDisplay'
import paymentSettingMethod from 'components/payment/paymentSettingMethod'
import customField from 'src/components/common/custom_field.vue'
import coinLabel from '../common/coin_label.vue'
import PaymentStatus from 'components/payment/paymentStatus'
import { ref } from 'vue'
import { api, axios } from 'boot/axios'
import { STATUS_INFO } from 'src/consts/common'

export default {
  name: 'paymentDetail',
  components: {
    MTime,
    PaymentSetting,
    PaymentRateInput,
    PaymentRejectDialog,
    InvoicesMode,
    ApproverDisplay,
    paymentSettingMethod,
    customField,
    coinLabel,
    PaymentStatus,
  },
  data() {
    return {
      txId: '',
      methods: [],
      expanded: false,
      fetchingRate: false,
      paying: false,
      payment: {},
      paymentRejectDialog: false,
      paymentStatus: '',
      confirm: false,
      payDialog: false,
      receiptAttachFile: ref(null),
      imageNewName: '',
      imageBase64: '',
      receiptImageDialog: false,
      totalHours: 0.0,
    }
  },
  props: {
    modelValue: Object,
    user: Object,
    token: String,
    paymentType: String,
    editing: Boolean,
    processing: Boolean,
    approvalCount: Number,
    unpaidCount: Number,
  },
  methods: {
    ...mapActions({
      savePayment: 'payment/save',
    }),
    cancel() {
      if (this.processing) {
        this.$emit('update:processing', false)
        return
      }
      //if is approvals list, back to prev page (dashboard)
      if (this.payment.receiverId != this.user.id && this.payment.senderId != this.user.id) {
        if (this.approvalCount < 1) {
          this.$router.push({ path: `/get-paid` })
          return
        }
        this.$router.back()
        return
      }
      const path = this.paymentType === PAYMENT_OBJECT_REQUEST ? 'get-paid' : 'pay'
      this.$router.push({ path: `/${path}` })
    },
    processPayment() {
      this.$emit('update:processing', true)
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
        convertRate: this.payment.convertRate,
        convertTime: this.payment.convertTime,
        expectedAmount: this.payment.expectedAmount,
      }
      this.$api
        .post('/payment/process', reqData)
        .then((data) => {
          this.paying = false
          this.$emit('update:modelValue', data)
          this.$emit('update:processing', false)
          this.$q.notify({
            message: 'Request marked as paid',
            color: 'positive',
            icon: 'check',
          })
          this.payDialog = false
          this.$emit('updateUnpaidCount', this.unpaidCount - 1)
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
          message: 'Payment is updated',
          color: 'positive',
          icon: 'check',
        })
      }
    },
    async saveTxIdAuto() {
      if (this.txId == this.payment.txId) {
        return
      }
      this.update()
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
              message: 'Payment is updated',
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
          window.location.reload()
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
    toggleOnChildRejectDialog(val, dialog) {
      if (!dialog && !val) {
        //reset status
        this.paymentStatus = this.payment.status
      }
      this.paymentRejectDialog = dialog
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
        message: 'Copied.',
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
    onRejected() {
      this.$q.notify({
        type: 'negative',
        message: `Image extensions are not allowed`,
      })
    },
    uploadReceipt() {
      if (this.receiptAttachFile == null) {
        this.$q.notify({
          type: 'negative',
          message: `Image has not been uploaded yet. Try again`,
        })
        return
      }
      this.createImageNewName()
      this.uploadImage()
      //create receipt upload handler
      this.payment.receiptImg = this.imageNewName
      this.update()
    },
    async uploadImage() {
      let formData = new FormData()
      formData.append('receipt', this.receiptAttachFile)
      formData.set('newImageName', this.imageNewName)
      let headers = {
        'Content-Type': 'multipart/form-data',
      }
      await api.post('/file/upload-one', formData, headers)
    },
    createImageNewName() {
      let nameArr = this.receiptAttachFile.name.split('.')
      if (nameArr.length < 2) return
      this.imageNewName = this.randomString(64, '#aA') + '.' + nameArr[1]
    },
    randomString(length, chars) {
      var mask = ''
      if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz'
      if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (chars.indexOf('#') > -1) mask += '0123456789'
      var result = ''
      for (var i = length; i > 0; --i) result += mask[Math.floor(Math.random() * mask.length)]
      return result
    },
    getImageUrl() {
      if (this.receiptAttachFile == null) {
        return ''
      }
      return URL.createObjectURL(this.receiptAttachFile)
    },
    getStatusInfoColor(status) {
      switch (status) {
        case 'sent':
          return STATUS_INFO.sent
        case 'confirmed':
          return STATUS_INFO.waiting_approval
        case 'rejected':
          return STATUS_INFO.rejected
        default:
          return STATUS_INFO.unknown
      }
    },
    getDescriptionColStyle() {
      const desc = this.payment.description
      if (desc) {
        if (desc.length <= 512 && desc.length > 256) {
          return 'col-sm-12 col-lg-6'
        }
        if (desc.length < 1024 && desc.length > 512) {
          return 'col-md-12 col-lg-10'
        }
        if (desc.length >= 1024) {
          return 'col-sm-12'
        }
      }
      return 'col-sm-6 col-lg-4'
    },
    setTotalHours(invoices) {
      let count = 0
      if (invoices && invoices.length > 0) {
        invoices.forEach((detail) => {
          if (detail.price == 0) {
            count += detail.quantity
          }
        })
      }
      this.totalHours = count
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
        this.setTotalHours(this.payment.details)
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
        if (this.payment.receiptImg != null && this.payment.receiptImg != '') {
          this.$api
            .get(`/file/base64-one`, {
              params: {
                image: this.payment.receiptImg,
              },
            })
            .then((data) => {
              this.imageBase64 = 'data:image/png;base64,' + data
            })
            .catch((err) => {
              responseError(err)
              return { error: err }
            })
        }
      },
    },
    paymentStatus: {
      immediate: true,
      handler(newStatus) {
        if (newStatus == this.payment.status) {
          return
        }
        if (newStatus == 'rejected') {
          this.toggleRejectDialog(true)
        } else {
          this.update()
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
      //17/10 - Status changes are not affected by the approver. Always display 3 editing statuses: Received, Rejected, Payable
      status.push({
        label: 'Received',
        value: 'sent',
      })
      status.push({
        label: 'Payable',
        value: 'confirmed',
      })
      status.push({
        label: 'Rejected',
        value: 'rejected',
      })
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
      return this.user.id == this.payment.receiverId && ['sent'].includes(this.payment.status)
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
    isRejectedStatus() {
      return this.payment.status == 'rejected'
    },
    isDraftStatus() {
      return this.payment.status == 'draft'
    },
    isConfirmedStatusChange() {
      return this.paymentStatus == 'confirmed'
    },
    isUnavailableMarkPaid() {
      return this.txId == ''
    },
    isShowExchangeRate() {
      return !this.isApprover && this.payment.status == 'paid'
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
    getRecipientName() {
      if (this.payment.receiverDisplayName && this.payment.receiverDisplayName.length > 0) {
        return this.payment.receiverDisplayName + ' (' + this.payment.receiverName + ')'
      }
      return this.payment.receiverName || this.payment.externalEmail
    },
    getSenderName() {
      if (this.payment.senderDisplayName && this.payment.senderDisplayName.length > 0) {
        return this.payment.senderDisplayName + ' (' + this.payment.senderName + ')'
      }
      return this.payment.senderName || this.payment.externalEmail
    },
    displayAttachReceipt() {
      return (this.isPaidStatus && this.isSender) || (this.imageBase64 != '' && this.isReceiver)
    },
    isUploadDisplay() {
      return this.isPaidStatus && this.isSender && this.receiptAttachFile != null
    },
  },
}
</script>
