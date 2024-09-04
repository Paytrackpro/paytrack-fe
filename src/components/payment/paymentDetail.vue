<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-form @submit="markAsPaid">
    <q-card-section class="card-header">
      <div class="row justify-between">
        <div class="row">
          <div class="text-h6 title-case">Payment request</div>
          <payment-status
            v-if="payment.status && (!isReceiver || isPaidStatus || isDraftStatus)"
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
            :disable="isDraftStatus"
            @click="showPayDialog()"
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
            v-if="isSentStatus && editable"
            label="Unsend"
            type="button"
            color="orange"
            @click="unsentInvoice()"
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
        v-if="isReceiver && !isPaidStatus && !isDraftStatus"
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
    <div class="q-ma-lg text-size-15">
      <div class="row q-mb-xs q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-3 col-xl-3 q-py-xs q-my-xs field-shadow">
          <p class="q-mb-md" v-if="!approvalable">
            <span>{{ isSender ? 'To' : 'From' }}:&nbsp;&nbsp;</span>
            {{ isSender ? getRecipientName : getSenderName }}
          </p>
          <p class="q-mb-xs d-flex" v-if="approvalable">
            <span style="width: 40px">From</span>
            :&nbsp;&nbsp;{{ getSenderName }}
          </p>
          <p class="q-mb-md d-flex" v-if="approvalable">
            <span style="width: 40px">To</span>
            :&nbsp;&nbsp;{{ getRecipientName }}
          </p>
          <p class="q-mb-xs text-size-18" v-if="!isShowInvoice">
            <span>Amount (USD):&nbsp;</span>
            <span class="fw-600"
              >${{ (payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span
            >
          </p>
          <p class="q-mb-xs row rate-area" v-if="isShowInvoice && isShowCost">
            <span class="width-110px">Rate:&nbsp;</span>
            <span>${{ payment.hourlyRate.toFixed(2) }} USD/h</span>
          </p>
          <p class="q-mb-xs row" v-if="isShowInvoice && isShowCost">
            <span class="width-110px">Hours:&nbsp;</span>
            <span>{{
              (totalHours % 1 != 0 ? totalHours.toFixed(2) : totalHours) + ' hour' + (totalHours > 1.0 ? 's' : '')
            }}</span>
          </p>
          <q-separator class="total-separator q-my-sm" v-if="isShowInvoice && isShowCost" />
          <p class="q-mb-xs text-size-18 row" v-if="isShowInvoice && isShowCost">
            <span class="width-110px">Amount Due:&nbsp;</span>
            <span class="fw-600">${{ payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 }) }} USD</span>
          </p>
        </div>
        <div class="col-12 col-sm-6 col-lg-4 q-py-xs q-my-xs field-shadow">
          <div class="q-mb-xs row" style="align-items: center" v-if="!isApprover && isPaidStatus">
            <span class="paid-area-label">Means:</span>
            <q-chip class="sm-chip q-ml-none" square text-color="white" :color="coinColor(payment.paymentMethod)">
              {{ selectedCoin(payment.paymentMethod).label }}
            </q-chip>
          </div>
          <div class="q-mb-xs row" v-if="!isApprover && isPaidStatus">
            <span class="paid-area-label">Address:</span>
            <p class="paid-area-value">{{ payment.paymentAddress }}</p>
          </div>
          <div v-if="isEditPaymentSetting">
            <payment-setting :modelValue="payment.paymentSettings" readonly label="Accepted Payment Settings" />
          </div>
          <div v-if="isApprover || (user.id == payment.receiverId && !processing && !isPaidStatus)">
            <p><span class="text-size-15">Accepted Coins</span></p>
            <q-field stack-label borderless>
              <coin-label v-for="(setting, i) of payment.paymentSettings" :key="i" :type="setting.type" />
            </q-field>
          </div>
          <PaymentRateInput
            v-if="isShowExchangeRate"
            :readonly="true"
            ref="rateInput"
            v-model="payment"
            v-model:loading="fetchingRate"
            @update:modelValue="updateLocal"
          />
          <div class="q-mb-xs row" v-if="isShowExchangeRate">
            <span class="paid-area-label">Amount:</span>
            <span class="paid-area-value"
              >{{ payment.expectedAmount }} {{ (payment.paymentMethod || '').toUpperCase() }}</span
            >
          </div>
          <div class="q-mb-xs row" v-if="!isApprover && isPaidStatus">
            <span class="paid-area-label">TxId:</span>
            <p class="paid-area-value">{{ payment.txId }}</p>
          </div>
        </div>
        <div class="col-12 col-sm-6 col-lg-4 q-py-xs q-my-xs field-shadow">
          <p class="q-mb-xs d-flex" v-if="!isDraftStatus">
            <span class="width-70">{{ isSender ? 'Sent' : 'Received' }}:</span><m-time :time="payment.sentAt"></m-time>
          </p>
          <p class="q-mb-xs d-flex" v-if="!isDraftStatus">
            <span class="width-70">Edited:</span><m-time :time="payment.updatedAt"></m-time>
          </p>
          <p class="q-mb-xs d-flex" v-if="!isApprover && isPaidStatus">
            <span class="width-70">Paid:</span><m-time :time="payment.paidAt"></m-time>
          </p>
        </div>
      </div>
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-12 col-lg-4 q-py-xs q-my-xs field-shadow" v-if="displayApprovers">
          <approver-display :approvers="payment.approvers" />
        </div>
      </div>
      <div class="row q-mb-xs q-mt-sm q-col-gutter-md">
        <div :class="'col-12 q-py-xs q-my-xs field-shadow'">
          <p class="q-mb-xs">
            <span class="text-size-15"> Description: </span>
          </p>
          <q-field stack-label borderless class="description-field">
            <template v-slot:control>
              <span class="content-wrap">{{ payment.description }}</span>
            </template>
          </q-field>
        </div>
      </div>
      <div class="row q-mb-md q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-4" v-if="displayAttachReceipt">
          <p class="q-mb-xs">
            <span class="text-size-15">{{ isSender ? 'Attach Receipt' : 'Receipt' }}</span>
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
      <div
        class="row q-mb-xs q-col-gutter-md q-mt-xs"
        v-if="isShowInvoice && payment.showProjectOnInvoice && payment.projectId > 0"
      >
        <p>
          <span>Invoice Project:</span>&nbsp;<span class="fw-600">{{ payment.projectName }}</span>
        </p>
      </div>
      <div class="row q-mb-md q-col-gutter-md q-mt-xs" v-if="isShowInvoice">
        <div class="col q-pt-xs">
          <invoices-mode
            v-model="payment.details"
            :amount="payment.amount"
            readonly
            v-model:hourlyRate="payment.hourlyRate"
            :showDateOnInvoiceLine="payment.showDateOnInvoiceLine"
            :showProjectOnInvoice="payment.showProjectOnInvoice"
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

    <q-dialog v-model="payDialog" @update:model-value="disableClose">
      <q-card style="width: 550px; max-width: 80vw">
        <q-card-section class="row q-pb-none">
          <div class="text-h6">Pay</div>
        </q-card-section>
        <q-card-section class="q-py-none q-px-lg row">
          <div
            v-if="payment.paymentSettings && payment.paymentSettings.length && user.id == payment.receiverId"
            class="col-12 q-pb-none field-shadow"
          >
            <payment-setting-method
              :defautMethod="payment.paymentMethod"
              @change="methodChange"
              :modelValue="payment.paymentSettings"
              label="Payment Method"
            />
          </div>
          <div class="col-12">
            <div class="row">
              <div class="col-6 field-shadow q-py-sm">
                <b class="text-weight-medium">Exchange</b>
                <q-select
                  class="row q-mt-sm"
                  v-model="exchange"
                  :options="exchangeOption"
                  outlined
                  dense
                  style="min-width: 40px"
                  lazy-rules
                  stack-label
                  emit-value
                  map-options
                  borderless
                >
                  <template v-slot:prepend>
                    <img src="../../assets/binance-icon.png" width="20" height="20" v-if="exchange == 'binance'" />
                    <img src="../../assets/kucoin-icon.png" width="20" height="20" v-if="exchange == 'kucoin'" />
                    <img src="../../assets/mexc-icon.png" width="20" height="20" v-if="exchange == 'mexc'" />
                  </template>
                  <template v-slot:option="scope">
                    <q-item v-bind="scope.itemProps" v-on="scope.itemEvents">
                      <q-item-section>
                        <div>
                          <img
                            src="../../assets/binance-icon.png"
                            width="20"
                            height="20"
                            v-if="scope.opt.value == 'binance'"
                          />
                          <img
                            src="../../assets/kucoin-icon.png"
                            width="20"
                            height="20"
                            v-if="scope.opt.value == 'kucoin'"
                          />
                          <img
                            src="../../assets/mexc-icon.png"
                            width="20"
                            height="20"
                            v-if="scope.opt.value == 'mexc'"
                          />
                          <span class="q-ml-sm">{{ scope.opt.label }}</span>
                        </div>
                      </q-item-section>
                    </q-item>
                  </template>
                </q-select>
              </div>
            </div>
          </div>
          <div class="col-12 q-py-sm">
            <p>
              <span>Amount (USD):&nbsp;</span>
              <span class="fw-600"
                >${{ (payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span
              >
            </p>
          </div>
          <div class="col-6 q-py-sm field-shadow">
            <PaymentRateInput
              ref="rateInput"
              v-model="payment"
              v-model:loading="fetchingRate"
              v-model:exchange="exchange"
              @update:modelValue="updateLocal"
            />
          </div>
          <div class="col-6 q-py-sm field-shadow">
            <div>
              <p class="q-mb-xs">
                <b class="text-weight-medium">Amount to send ({{ (payment.paymentMethod || '').toUpperCase() }}) </b>
              </p>
              <span class="text-weight-bolder text-blue-8 text-size-18">{{ payment.expectedAmount }}</span>
              <q-btn round dense flat class="q-ml-sm copy-width-btn" @click="copy(payment.expectedAmount || '')">
                <q-icon size="xs" class="custom-icon" :name="'o_content_copy'" />
                <q-tooltip>Copy Amount (BTC)</q-tooltip>
              </q-btn>
            </div>
          </div>
          <div class="col-12 q-py-sm">
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
          <q-btn label="Cancel" type="button" color="white" text-color="black" @click="hidePayDialog()" />
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
import coinLabel from '../common/coin_label.vue'
import PaymentStatus from 'components/payment/paymentStatus'
import { ref } from 'vue'
import { api, axios } from 'boot/axios'
import { STATUS_INFO } from 'src/consts/common'
import { COINS } from 'src/consts/common'
import { joinRoom, leftRoom, listenSocketEvent, removeListenSocketEvent } from 'src/helper/socket'

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
      exchangeOption: [],
      exchange: 'binance',
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
  created() {
    //if exhchange options empty, initialization
    if (this.exchangeOption.length == 0 && !this.isPaidStatus) {
      //if projectList empty, get projectList
      this.$api
        .get(`/payment/exchange-list`)
        .then((data) => {
          data.forEach((exchange) => {
            this.exchangeOption.push({
              label: this.getExchangeName(exchange),
              value: exchange,
            })
          })
          this.exchange = data[0]
        })
        .catch((err) => {
          responseError(err)
          return { error: err }
        })
    }
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
        expectedAmount: Number(this.payment.expectedAmount),
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
          this.hidePayDialog()
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
      listenSocketEvent(this.payment.paymentMethod, this.onSocketMessage)
      this.$emit('update:modelValue', payment)
      if (editing) {
        this.$emit('update:editing', true)
      }
    },
    methodChange(method) {
      const settings = this.payment.paymentSettings || []
      const setting = settings.find((s) => s.type === method)
      if (setting) {
        const oldMethod = this.payment.paymentMethod
        removeListenSocketEvent(oldMethod, this.onSocketMessage)
        this.payment.paymentMethod = method
        listenSocketEvent(method, this.onSocketMessage)
        this.payment.paymentAddress = setting.address
        this.payment.convertRate = 0
        this.payment.expectedAmount = 0
        this.$emit('update:modelValue', this.payment)
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
    disableClose() {
      this.payDialog = true
    },
    showPayDialog() {
      this.payDialog = true
      joinRoom('exchangeRate')
    },
    hidePayDialog() {
      this.payDialog = false
      removeListenSocketEvent('btc', this.onSocketMessage)
      removeListenSocketEvent('ltc', this.onSocketMessage)
      removeListenSocketEvent('dcr', this.onSocketMessage)
      leftRoom('exchangeRate')
    },
    onSocketMessage(data) {
      if (data && data[this.exchange]) {
        const rateData = data[this.exchange]
        if (this.payment.convertRate != rateData.rate) {
          this.payment.convertRate = rateData.rate
          this.payment.convertTime = rateData.convertTime
          this.payment.expectedAmount = parseFloat(this.payment.amount / rateData.rate).toFixed(8)
          this.$emit('update:modelValue', this.payment)
        }
      }
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
    unsentInvoice() {
      this.paymentStatus = 'draft'
      this.payment.status = 'draft'
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
          return 'col-md-12 col-lg-8'
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
    selectedCoin(coinType) {
      for (let coin of COINS) {
        if (coin.value === coinType) {
          return coin
        }
      }
      return {}
    },
    coinColor(coinType) {
      for (let coin of COINS) {
        if (coin.value === coinType) {
          return coin.color
        }
      }
      return ''
    },
    getExchangeName(exchange) {
      switch (exchange) {
        case 'binance':
          return 'Binance'
        case 'kucoin':
          return 'Kucoin'
        case 'dex':
          return 'Dex'
        case 'mexc':
          return 'Mexc'
        default:
          return ''
      }
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newPayment) {
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
    exchange: {
      immediate: true,
      handler(newExchange) {
        if (this.isPaidStatus) {
          return
        }
        this.payment.convertRate = 0
        this.payment.expectedAmount = 0
        this.$emit('update:modelValue', this.payment)
        this.exchange = newExchange
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
    isSentStatus() {
      return this.payment.status == 'sent'
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
