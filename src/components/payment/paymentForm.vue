<template>
  <q-form @submit="submit" class="q-ma-md" ref="paymentForm">
    <div class="row q-mb-md q-col-gutter-md">
      <div class="col-4">
        <p class="q-mt-none q-mb-xs text-weight-medium">
          Sender
          <q-icon name="info">
            <q-tooltip>
              You are the sender of the payment request to the recipient
            </q-tooltip>
          </q-icon>
        </p>
        <q-input
          v-model="inPayment.senderName"
          placeholder="Sender"
          readonly
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
        >
          <template v-slot:prepend>
            <q-icon name="person" />
          </template>
        </q-input>
      </div>
      <div class="col-4">
        <p class="q-mt-none q-mb-xs text-weight-medium">
          Recipient
          <q-icon name="info">
            <q-tooltip>
              The user who will be paying the payment request
            </q-tooltip>
          </q-icon>
        </p>
        <q-input-system-user
          v-model="partner"
          placeholder="Recipient"
          :readonly="user.id !== inPayment.creatorId || ['draft', ''].indexOf(inPayment.status) === -1"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          :rules="[(val) => !!val || 'Recipient is required']"
          hint="expect an user name on mgmt or an email address"
        />
      </div>
      <div class="col-4"></div>
      <div class="col-4" v-if="!expanded">
        <p class="q-mt-none q-mb-xs text-weight-medium">Amount(USD)</p>
        <q-input
          v-model="amount"
          placeholder="Amount"
          type="number"
          readonly
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          :rules="[
            (val) =>
              val > 0 ||
              'Amount > 0. Please fill up the invoices and hourly rate',
          ]"
        >
          <template v-slot:prepend>
            <q-icon name="attach_money" />
          </template>
        </q-input>
      </div>
      <div class="col-8" v-if="!expanded" />
      <div v-if="paymentType === 'reminder'" class="col-4 col-md-3">
        <p class="q-mt-none q-mb-xs text-weight-medium">
          Choose payment method
        </p>
        <q-select
          v-model="setting.type"
          :options="paymentMethods"
          placeholder="Payment Type"
          :option-label="(v) => v.label"
          :option-value="(v) => v.value"
          emit-value
          map-options
          outlined
          dense
          stack-label
          hide-bottom-space
          @update:modelValue="changePaymentMethod"
        />
      </div>
      <div v-if="paymentType === 'reminder'" class="col-8 col-md-9">
        <p class="q-mt-none q-mb-xs text-weight-medium">Currency address</p>
        <q-input
          v-model="setting.address"
          placeholder="payment address"
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
        />
      </div>
      <div v-if="paymentType === 'request'" class="col-12">
        <payment-setting
          v-model="inPayment.paymentSettings"
          label="Payment setting"
        />
      </div>
      <div class="col-12">
        <q-expansion-item
          v-model="expanded"
          label="Payment invoices"
          caption="Click to expand"
        >
          <div class="row">
            <div class="col-3">
              <q-input
                style=""
                label="Hourly rate(USD)"
                dense
                lazy-rules
                stack-label
                outlined
                hide-bottom-space
                type="number"
                v-model="inPayment.hourlyRate"
                hint="Used to calculate cost from hours on invoices"
              />
            </div>
          </div>
          <invoices
            v-model="inPayment.details"
            :hourlyRate="Number(inPayment.hourlyRate)"
          ></invoices>
        </q-expansion-item>
      </div>
    </div>
    <div class="row justify-end q-gutter-sm">
      <q-btn
        :label="inPayment.status === '' ? 'Mark as draft' : 'Update'"
        type="button"
        color="primary"
        @click="submit(true)"
        :disable="submitting"
      >
        <q-tooltip v-if="inPayment.status === ''">
          'Mark as draft' will not notify the payment to the recipient
        </q-tooltip>
      </q-btn>
      <q-btn
        v-if="inPayment.status === 'draft' || inPayment.status === ''"
        label="Send"
        color="primary"
        :disable="submitting"
        @click="submit(false)"
      >
        <q-tooltip> 'Send' will notify the payment to the recipient </q-tooltip>
      </q-btn>
      <q-btn
        label="Cancel"
        type="button"
        color="white"
        text-color="black"
        @click="$emit('cancel')"
      />
    </div>
  </q-form>
</template>

<script>
import { PAYMENT_TYPE_OPTIONS } from "src/consts/paymentType";
import Invoices from "components/payment/invoices";
import QInputSystemUser from "components/common/qInputSystemUser";
import PaymentSetting from "components/payment/paymentSetting";
import { mapActions } from "vuex";

export default {
  name: "paymentForm",
  components: { Invoices, PaymentSetting, QInputSystemUser },
  data() {
    return {
      expanded: false,
      setting: {
        type: "",
        address: "",
      },
      partner: {
        id: 0,
        value: "",
        paymentSettings: [],
      },
      paymentMethods: PAYMENT_TYPE_OPTIONS,
      submitting: false,
      inPayment: {},
    };
  },
  props: {
    payment: Object,
    user: Object,
    token: String,
    paymentType: String,
  },
  watch: {
    payment: {
      immediate: true,
      handler(newPayment) {
        const payment = { ...newPayment };
        this.partner.contactMethod = payment.contactMethod;
        if (payment.contactMethod === "email") {
          this.partner.value = newPayment.externalEmail;
          this.partner.id = 0;
        } else {
          this.partner.value = payment.receiverName;
          this.partner.id = payment.receiverId;
        }
        this.inPayment = payment;
        // setup correct payment setting
        if (payment.paymentMethod && payment.paymentAddress) {
          this.setting = {
            type: payment.paymentMethod,
            address: payment.paymentAddress,
          };
        } else {
          const settings = payment.paymentSettings || [];
          let filled = true;
          for (let setting of settings) {
            if (setting.isDefault) {
              this.setting = { ...setting };
              return;
            }
          }
          if (!filled && settings.length > 0) {
            this.setting = {
              ...settings[0],
            };
          }
        }
      },
    },
  },
  methods: {
    ...mapActions({
      savePayment: "payment/save",
    }),
    async submit(isDraft) {
      if (this.submitting || !this.partner.contactMethod) {
        return;
      }
      const valid = await this.$refs.paymentForm.validate();
      if (!valid) {
        return;
      }
      if (this.amount === 0) {
        this.$q.notify({
          type: "negative",
          message:
            "Amount must greater than 0. Please fill up the invoices and hourly rate",
        });
        return;
      }
      const payment = { ...this.inPayment };
      payment.hourlyRate = Number(payment.hourlyRate);
      payment.contactMethod = this.partner.contactMethod;
      if (isDraft !== true) {
        payment.status = "sent";
      }
      if (payment.contactMethod === "email") {
        if (!payment.id || this.user.id === payment.creatorId) {
          payment.externalEmail = this.partner.value;
        }
      }
      payment.paymentMethod = this.setting.type;
      payment.paymentAddress = this.setting.address;
      payment.receiverId = this.partner.id;
      payment.token = this.token;
      this.submitting = true;
      let successNotify = "Payment request created";
      if (payment.id > 0) {
        successNotify = "Payment request updated";
      }
      if (isDraft !== true) {
        successNotify = "Payment request sent";
      }
      const { data } = await this.savePayment(payment);
      this.submitting = false
      if (data) {
        this.$emit("saved", data.payment);
        this.$q.notify({
          message: successNotify,
          color: "positive",
          icon: "check",
        });
      }
    },
    changePaymentMethod(val) {
      const settings = this.inPayment.paymentSettings || [];
      this.setting.address = "";
      for (let setting of settings) {
        if (setting.type === this.setting.type) {
          this.setting.address = setting.address;
        }
      }
    },
  },
  computed: {
    amount: function () {
      if (!this.inPayment.details) {
        return 0;
      }
      let amount = 0;
      for (let invoice of this.inPayment.details) {
        amount += Number(invoice.cost);
      }
      return amount;
    },
  },
};
</script>

<style scoped></style>
