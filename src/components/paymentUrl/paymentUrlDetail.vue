<!-- eslint-disable vue/no-mutating-props -->
<template>
  <q-form @submit="markAsPaid">
    <!-- Pay Page -->
    <q-card-section class="card-header">
      <div class="row justify-between">
        <div class="row">
          <div class="text-h6 title-case">Payment request by URL</div>
          <payment-status
            v-if="payment.status && (isPaidStatus || isDraftStatus || !isApprovedPayment())"
            :paymentModel="payment"
            class="q-ml-md"
            :isShowIcon="true"
          />
        </div>
        <div class="row justify-end">
          <q-btn
            v-if="processable && !isRejectedStatus && isApprovedPayment()"
            label="Pay"
            type="button"
            color="primary"
            :disable="isDraftStatus"
            @click="showPayDialog()"
            class="q-mr-sm btn btn-animated"
          />
          <q-btn
            v-if="processable && !isRejectedStatus && isApprovedPayment()"
            label="Pay With Account"
            type="button"
            color="primary"
            @click="showPayOptionDialog()"
            class="q-mr-sm btn btn-animated"
          />
        </div>
      </div>
    </q-card-section>

    <!-- Payment Details -->
    <div class="q-ma-lg text-size-15">
      <div class="row q-mb-xs q-col-gutter-md">
        <div class="col-12 col-sm-6 col-lg-4 col-xl-3 q-py-xs q-my-xs field-shadow">
          <p class="q-mb-md" v-if="!approvalable">
            <span v-if="!isPaymentUrl"
              >{{ isSender ? 'To' : 'From' }}:&nbsp;&nbsp; {{ isSender ? getRecipientName : getSenderName }}</span
            >
            <span v-if="isPaymentUrl"> {{ isSender ? 'URL: ' + getRecipientName : getSenderName }}</span>
          </p>
          <p class="q-mb-xs d-flex" v-if="approvalable">
            <span style="width: 40px">From</span>
            :&nbsp;&nbsp;{{ getSenderName }}
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
          <div class="q-mb-xs row" style="align-items: center" v-if="isPaidStatus">
            <span class="paid-area-label">Means:</span>
            <q-chip class="sm-chip q-ml-none" square text-color="white" :color="coinColor(payment.paymentMethod)">
              {{ selectedCoin(payment.paymentMethod).label }}
            </q-chip>
          </div>
          <div class="q-mb-xs row" v-if="isPaidStatus">
            <span class="paid-area-label">Address:</span>
            <p class="paid-area-value">{{ payment.paymentAddress }}</p>
          </div>
          <div v-if="!processing && !isPaidStatus">
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
          <div class="q-mb-xs row" v-if="isPaidStatus">
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
          <p class="q-mb-xs d-flex" v-if="isPaidStatus">
            <span class="width-70">Paid:</span><m-time :time="payment.paidAt"></m-time>
          </p>
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
      <div
        class="row q-mb-xs q-col-gutter-md q-mt-xs"
        v-if="isShowInvoice && payment.showProjectOnInvoice && payment.projectId > 0"
      >
        <p>
          <span>Invoice Project:</span>&nbsp;<a :href="getProjectLink" class="fw-600 underline-link">{{
            payment.projectName
          }}</a>
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
    </div>
    <!-- Pay Dialog -->
    <q-dialog v-model="payDialog" @update:model-value="disableClose">
      <q-card style="width: 900px; max-width: 80vw">
        <q-card-section class="row q-pb-none">
          <div class="text-h6">Pay</div>
        </q-card-section>
        <q-card-section class="q-py-none q-px-lg row">
          <div v-if="payment.paymentSettings && payment.paymentSettings.length" class="col-12 q-pb-none field-shadow">
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
          <div class="col-12 q-pt-sm">
            <p>
              <b class="text-weight-medium">Amount (USD):&nbsp;</b>
              <span>${{ (payment.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 }) }}</span>
            </p>
          </div>
          <div class="col-6 q-py-sm field-shadow">
            <PaymentRateInput
              ref="rateInput"
              v-model="payment"
              v-model:loading="fetchingRate"
              v-model:exchange="exchange"
              @update:modelValue="updateLocal"
              :rateType="rateFor"
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
    <!-- Pay Option Dialog -->
    <q-dialog v-model="payOptionDialog">
      <q-card :style="{ width: selectedOptionPay ? '50%' : 'auto', maxWidth: selectedOptionPay ? '500px' : 'none' }">
        <q-card-section>
          <div class="text-h6">Choose an Option</div>
        </q-card-section>

        <q-card-section class="q-mb-none q-pb-none">
          <q-radio v-model="selectedOptionPay" label="Login" val="login" :style="{ marginRight: '25px' }" />
          <q-radio v-model="selectedOptionPay" label="Create New Account" val="register" />
        </q-card-section>

        <q-card-section class="q-mt-none q-pt-none">
          <q-form class="form-area" @submit="goLogin()" v-if="loginType == 0">
            <div class="inputContainer">
              <input id="user_name_id" v-model="username" type="text" class="input" placeholder="Username" required />
              <label for="user_name_id" class="label">
                <q-icon name="person" class="input-icon" />
                <span class="input-label q-ml-xs">Username</span></label
              >
            </div>
            <div class="between-area">
              <span class="text-accent msg-error" v-if="msg.username">{{ msg.username }}</span>
            </div>
            <div class="inputContainer" align="right">
              <input
                id="password_id"
                v-model="password"
                :type="isPwd ? 'password' : 'text'"
                class="input"
                placeholder="Password"
                required
              />
              <label for="password_id" class="label">
                <q-icon name="key" class="input-icon" />
                <span class="input-label q-ml-xs">Password</span>
              </label>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer after-input-icon"
                @click="isPwd = !isPwd"
              />
            </div>
            <div class="between-area" v-if="authType == 0">
              <span class="text-accent msg-error" v-if="msg.password">{{ msg.password }}</span>
            </div>
            <div class="inputContainer" align="right" v-if="methodOptionPay">
              <input
                id="password_id"
                v-model="passwordCfm"
                :type="isRePwd ? 'password' : 'text'"
                class="input"
                placeholder="Password"
                required
              />
              <label for="re_password_id" class="label">
                <q-icon name="key" class="input-icon" />
                <span class="input-label q-ml-xs">Re-Password</span>
              </label>
              <q-icon
                :name="isRePwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer after-input-icon"
                @click="isRePwd = !isRePwd"
              />
            </div>
            <div class="between-area" v-if="authType == 0">
              <span class="text-accent msg-error" v-if="msg.passwordCfm">{{ msg.passwordCfm }}</span>
            </div>
            <p v-if="error" class="q-mb-none text-red">{{ error }}</p>
          </q-form>
        </q-card-section>

        <q-card-section>
          <div class="row justify-end">
            <q-card-actions :style="{ display: 'flex', alignItems: 'center', gap: '12px' }">
              <q-btn flat label="Cancel" @click="cancel()" />
              <div v-if="selectedOptionPay" class="d-flex justify-content-center q-ml-2">
                <q-btn
                  :label="!methodOptionPay ? 'Sign in' : 'Sign up'"
                  color="primary"
                  class="text-center"
                  :loading="signBtnLoading"
                  :disable="!username || !password"
                  @click="!methodOptionPay ? goLogin() : register()"
                />
              </div>
            </q-card-actions>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import MTime from 'components/common/mTime'
import { PAYMENT_OBJECT_REQUEST } from 'src/consts/paymentType'
import { responseError } from 'src/helper/error'
import PaymentRateInput from 'components/payment/paymentRateInput'
import InvoicesMode from 'components/payment/invoicesMode'
import paymentSettingMethod from 'components/payment/paymentSettingMethod'
import coinLabel from '../common/coin_label.vue'
import PaymentStatus from 'components/payment/paymentStatus'
import { ref } from 'vue'
import { api } from 'boot/axios'
import { STATUS_INFO } from 'src/consts/common'
import { COINS } from 'src/consts/common'
import { joinRoom, leftRoom, listenSocketEvent, removeListenSocketEvent } from 'src/helper/socket'
export default {
  name: 'paymentUrlDetail',
  components: {
    MTime,
    PaymentRateInput,
    InvoicesMode,
    paymentSettingMethod,
    coinLabel,
    PaymentStatus,
  },
  props: {
    modelValue: Object,
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
      payOptionDialog: false,
      receiptAttachFile: ref(null),
      imageNewName: '',
      imageBase64: '',
      receiptImageDialog: false,
      totalHours: 0.0,
      exchangeOption: [],
      exchange: 'binance',
      selectedOptionPay: 'login',
      methodOptionPay: false,
      rateFor: 'rateForPayUrl',
      username: '',
      password: '',
      passwordCfm: '',
      error: null,
      isPwd: true,
      isRePwd: true,
      isOtp: false,
      otp: '',
      msg: [],
      authType: 0,
      loginType: 0,
      signBtnLoading: false,
      previousRouter: '',
      allowCreate: false,
    }
  },
  created() {
    if (this.exchangeOption.length == 0 && !this.isPaidStatus) {
      this.$api
        .get(`/payment-url/exchange-list`)
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
    this.$api
      .get(`/auth/auth-method`)
      .then((data) => {
        this.authType = data
        this.loginType = data
      })
      .catch((err) => {
        responseError(err)
      })
  },
  computed: {
    ...mapGetters({
      role: 'user/getRole',
      user: 'user/getUser',
    }),
    isAuthenticated() {
      return !!(this.user && this.user.id)
    },
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
        (this.payment.receiverId === this.user.id || this.payment.receiverId === 0)
      )
    },
    approvalable() {
      return !this.isUserApproved() && !['rejected', 'paid', 'confirmed'].includes(this.payment.status)
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
      return isPaymentSettingExist && !this.isReceiver && !this.isPaidStatus
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
      return this.payment.status == 'paid'
    },
    displayApprovers() {
      return (
        (this.payment.receiverId === this.user.id || this.payment.senderId === this.user.id) &&
        this.payment.approvers &&
        this.payment.approvers.length > 0
      )
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
      if (this.payment.receiverName) {
        return this.payment.receiverName
      }
      if (this.payment.externalEmail) {
        return this.payment.externalEmail
      }
      return this.payment.paymentUrl || 'URL undefined, please try again later'
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
    getProjectLink: function () {
      if (!this.payment || this.payment.projectId < 1) {
        return '#'
      }
      return '/settings/project/' + this.payment.projectId
    },
    isPaymentUrl() {
      return !!this.payment?.paymentUrl
    },
  },
  methods: {
    ...mapActions({
      savePayment: 'payment/save',
      login: 'user/login',
      setLogin: 'user/setLogin',
    }),
    cancel() {
      this.selectedOptionPay = 'login'
      this.payOptionDialog = false
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
        payerId: this.user.id,
        paymentMethod: this.payment.paymentMethod,
        paymentAddress: this.payment.paymentAddress,
        convertRate: this.payment.convertRate,
        convertTime: this.payment.convertTime,
        expectedAmount: Number(this.payment.expectedAmount),
      }
      this.$api
        .post('/payment-url/process', reqData)
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
          if (this.isAuthenticated) {
            this.goToDetail(data.id)
          }
        })
        .catch((err) => {
          this.paying = false
          responseError(err)
        })
    },
    goToDetail(id) {
      this.$router.push({ path: `/pay/${id}` })
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
    showPayOptionDialog() {
      this.payOptionDialog = true
      this.previousRoute = this.$route.fullPath
    },
    handleConfirmPayOption() {
      if (this.selectedOptionPay == 'login') {
        this.$router.push({ path: '/login' })
      } else {
        this.$router.push({ path: '/register' })
      }
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
    isApprovedPayment() {
      let isAllApproved = true
      if (this.payment.approvers !== null && this.payment.approvers.length > 0) {
        this.payment.approvers.forEach((el) => {
          if (!el.isApproved) {
            isAllApproved = false
          }
        })
      }
      return isAllApproved
    },
    async goLogin(otpString) {
      const { error, data } = await this.login({
        username: this.username,
        password: this.password,
        loginType: this.loginType,
        isOtp: this.isOtp,
        otp: otpString,
      })
      if (error) {
        this.error = error.message
        return
      }
      if (data.otp) {
        this.isOtp = true
        return
      }
      this.$q.notify({
        message: 'Login successful',
        color: 'positive',
        icon: 'check',
      })
      this.payOptionDialog = false
      this.payDialog = true
      this.$router.push({ path: this.previousRoute || '/approvals' })
    },
    validateRequiredField(name, value) {
      if (value && value.length > 0) {
        this.msg[name] = ''
        return
      }
      this.msg[name] = 'Please enter your ' + name
    },
    openPasskeyMgr() {
      this.signBtnLoading = true
      this.$api
        .post('/auth/assertion-options', {})
        .then((res) => {
          if (!res.error) {
            const resultData = JSON.parse(res.data)
            if (!resultData || !resultData.options) {
              return
            }
            const opts = resultData.options
            const sessionKey = resultData.sessionkey
            this.handlerLoginFinish(opts, sessionKey, false)
          } else {
            Notify.create({
              type: 'negative',
              message: res.msg,
            })
            this.signBtnLoading = false
          }
        })
        .catch((err) => {
          this.signBtnLoading = false
          responseError(err)
        })
    },
    loginWithOldAccount() {
      if (this.loginType == 0) {
        this.loginType = 1
      } else {
        this.loginType = 0
      }
    },
    async handlerLoginFinish(opts, sessionKey, startConditionalUI) {
      let asseResp
      try {
        asseResp = await startAuthentication(opts.publicKey, startConditionalUI)
      } catch (error) {
        this.signBtnLoading = false
        console.log('Conditional UI request was aborted')
        return
      }
      this.$api
        .post('/auth/assertion-result?sessionKey=' + sessionKey, asseResp)
        .then((res) => {
          this.setLogin(res)
          this.$router.push({ path: '/approvals' })
        })
        .catch((err) => {
          this.signBtnLoading = false
          responseError(err)
        })
    },
    async handlerFinishRegistration(options, sessionKey) {
      let asseResp
      try {
        asseResp = await startRegistration(options.publicKey)
      } catch (error) {
        this.loading = false
        console.log('Conditional UI request was aborted')
        this.cancelRegisterUser(sessionKey)
        return
      }
      this.$api
        .post(
          '/auth/register-finish?sessionKey=' + sessionKey + '&dispName=' + this.displayName + '&email=' + this.email,
          asseResp
        )
        .then((res) => {
          this.setLogin(res)
          this.$router.push({ path: '/approvals' })
        })
        .catch((err) => {
          this.loading = false
          this.cancelRegisterUser(sessionKey)
          responseError(err)
        })
    },
    registerUserPasskey() {
      this.loading = true
      this.$api
        .post('/auth/register-start?username=' + this.username, {})
        .then((res) => {
          const resultData = JSON.parse(res)
          let sessionKey
          let options
          if (resultData) {
            options = resultData.options
            sessionKey = resultData.sessionkey
          }
          if (!options) {
            if (sessionKey && sessionKey != '') {
              this.cancelRegisterUser(sessionKey)
            }
            this.loading = false
            return
          }
          this.handlerFinishRegistration(options, sessionKey)
        })
        .catch((err) => {
          this.loading = false
          responseError(err)
        })
    },
    async register() {
      if (!this.isValidUsername(this.username) || !this.isValidEmail(this.email)) {
        return
      }
      if (this.authType == 1) {
        this.registerUserPasskey()
        return
      }
      if (!this.isValidPassword(this.password) || !this.isValidPasswordCfm(this.passwordCfm)) {
        return
      }

      try {
        await this.$store.dispatch('user/register', {
          username: this.username,
          password: this.password,
          ...(this.displayName && { displayName: this.displayName }),
          ...(this.email && { email: this.email }),
        })

        this.$q.notify({
          message: 'Register successful',
          color: 'positive',
          icon: 'check',
        })

        await this.goLogin()
      } catch (error) {
        this.error = error.response ? error.response.data.message : error.message
      }
    },
    checkingDestination($e) {
      // checking
      let status = DESTINATION_CHECK_CHECKING
      this.$api
        .get(`/auth/username-checking?userName=` + this.username)
        .then(({ found, id, userName, message }) => {
          status = DESTINATION_CHECK_DONE
          if (found) {
            this.msg['username'] = 'Username already exists'
            this.allowCreate = false
          } else {
            this.msg['username'] = ''
            this.allowCreate = true
          }
        })
        .catch(() => {
          this.status = DESTINATION_CHECK_FAIL
          this.msg['username'] = 'Check username failed'
          this.allowCreate = false
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
    validateUsername(value) {
      if (this.isValidUsername(value)) {
        this.msg['username'] = ''
        return
      }
      this.msg['username'] = 'Please enter your username'
    },
    validatePasswordField(value) {
      if (this.isValidPassword(value)) {
        this.msg['password'] = ''
        return
      }
      this.msg['password'] = 'Password must be at least 6 characters. Please re-enter your password'
    },
    validateEmail(value) {
      if (this.isValidEmail(value)) {
        this.msg['email'] = ''
        return
      }
      this.msg['email'] = 'Please enter a valid email address'
    },
    validatePasswordConfirm(value) {
      if (this.isValidPasswordCfm(value)) {
        this.msg['passwordCfm'] = ''
        return
      }
      this.msg['passwordCfm'] = 'Password confirmation does not match'
    },
    isValidEmail(value) {
      return !value || (value && /^[^@]+@\w+(\.\w+)+\w$/.test(value))
    },
    isValidUsername(value) {
      return value && value.length > 0
    },
    isValidPassword(value) {
      return value && value.length >= 6
    },
    isValidPasswordCfm(value) {
      return !value || (value && value === this.password)
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
    selectedOptionPay: {
      immediate: true,
      handler(newOption) {
        if (newOption == 'login') {
          this.methodOptionPay = false
        } else {
          this.methodOptionPay = true
        }
      },
    },
    username(value) {
      this.username = value
      this.validateRequiredField('username', value)
    },
    password(value) {
      this.password = value
      this.validateRequiredField('password', value)
    },
    passwordCfm(value) {
      this.passwordCfm = value
      this.validatePasswordConfirm(value)
    },
  },
}
</script>
