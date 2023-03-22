<template>
  <q-card class="q-px-lg q-gutter-none">
    <q-card-section class="q-pa-none" v-if="!readonly">
      <q-tabs align="left" v-model="tab">
        <q-tab label="Simple" name="simple" />
        <q-tab label="Invoice Mode" name="invoice" />
      </q-tabs>
    </q-card-section>
    <q-separator v-if="!readonly" />
    <q-card-section class="q-pa-none">
      <q-tab-panels
        class="q-mx-none"
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="jump-up"
        transition-next="jump-down"
      >
        <q-tab-panel class="q-px-none" name="simple">
          <div class="row q-mb-md q-col-gutter-md">
            <div v-if="!readonly" class="col-12">
              <span class="text-caption text-grey">
                SIMPLE MODE will only be active when there are no invoices is
                entered on INVOICE MODE. Please ensure there are no entered
                invoices if you want to use SIMPLE MODE
              </span>
            </div>
            <div v-if="!readonly" class="col-3">
              <q-input
                v-model="payment.amount"
                @update:modelValue="updateBack('simple')"
                label="Amount(USD)"
                type="number"
                outlined
                dense
                lazy-rules
                stack-label
                hide-bottom-space
                :rules="[(val) => !!val || 'Recipient is required']"
              />
            </div>
            <div class="col-12">
              <p v-if="readonly" class="q-mt-none q-mb-xs text-weight-medium">
                Description
              </p>
              <q-input
                v-model="payment.description"
                @update:modelValue="updateBack('simple')"
                :label="readonly ? '' : 'Description'"
                :readonly="readonly"
                type="textarea"
                autogrow
                outlined
                dense
                lazy-rules
                stack-label
                hide-bottom-space
                :rules="[
                  (val) =>
                    !!val ||
                    payment.details.length ||
                    'Description is required',
                ]"
              />
            </div>
          </div>
        </q-tab-panel>
        <q-tab-panel class="q-px-none" name="invoice">
          <div class="row q-mb-md q-col-gutter-md">
            <div class="col-12">
              <p v-if="readonly" class="q-mt-none q-mb-xs text-weight-medium">
                Invoices information
              </p>
              <span v-else class="text-caption text-grey">
                INVOICE MODE will be active if you entered any invoices.
              </span>
            </div>
            <div v-if="!readonly" class="col-3">
              <q-input
                v-model="invoicesAmount"
                label="Amount(USD)"
                type="number"
                outlined
                readonly
                dense
                lazy-rules
                stack-label
                hide-bottom-space
              />
            </div>
            <div class="col-3">
              <q-input
                v-model="payment.hourlyRate"
                label="Hourly rate(USD/h)"
                type="number"
                outlined
                dense
                lazy-rules
                stack-label
                hide-bottom-space
                :readonly="readonly"
                @update:modelValue="updateBack"
              />
            </div>
          </div>
          <invoices
            :readonly="readonly"
            v-model="payment.details"
            :hourlyRate="Number(payment.hourlyRate)"
            @update:modelValue="updateBack"
          ></invoices>
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script>
import Invoices from "components/payment/invoices";
export default {
  name: "PaymentInvoiceMode",
  components: {
    Invoices,
  },
  props: {
    modelValue: Object,
    readonly: Boolean,
  },
  data() {
    return {
      tab: "simple",
      payment: {
        details: [],
        hourlyRate: 0,
        amount: 0,
        description: "",
      },
    };
  },
  methods: {
    resetMode() {
      const { details } = this.modelValue;
      this.tab = details && details.length > 0 ? "invoice" : "simple";
      this.tab = details && details.length > 0 ? "invoice" : "simple";
    },
    updateBack(mode) {
      let { details, hourlyRate, amount, description } = this.payment;
      hourlyRate = Number(hourlyRate);
      amount = Number(amount);
      if (details && details.length > 0) {
        if (mode === "simple") {
          return;
        }
        amount = this.invoicesAmount;
        description = "";
      }
      this.$emit("update:modelValue", {
        ...this.modelValue,
        details,
        hourlyRate,
        amount,
        description,
      });
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.payment = { ...newVal };
      },
    },
  },
  computed: {
    invoicesAmount: function () {
      if (!this.payment.details) {
        return 0;
      }
      let amount = 0;
      for (let invoice of this.payment.details) {
        amount += Number(invoice.cost);
      }
      return amount;
    },
  },
  mounted() {
    this.resetMode();
  },
  updated() {
    if (this.readonly) {
      this.resetMode();
    }
  },
};
</script>

<style scoped></style>
