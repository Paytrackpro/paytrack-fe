<template>
  <tr>
    <td class="text-right">
      <q-input
        style="max-width: 200px"
        label="Hours"
        v-model="invoice.hours"
        dense
        stack-label
        hide-bottom-space
        type="number"
        :error="submitted && invoice.hours < 0"
        @input="calculateCost"
      />
    </td>
    <td class="text-right">
      <q-input
        style="max-width: 200px"
        label="Cost"
        v-model="invoice.cost"
        :readonly="invoice.hours > 0"
        dense
        stack-label
        hide-bottom-space
        type="number"
        :error="submitted && invoice.cost <= 0"
      />
    </td>
    <td class="text-right">
      <q-input
        label="Description"
        v-model="invoice.description"
        dense
        stack-label
        hide-bottom-space
        rows="1"
        type="textarea"
        :error="submitted && !invoice.description"
      />
    </td>
    <td class="text-right">
      <span class="event-txt q-ma-xs text-secondary" @click="save">Save</span>
      <span class="event-txt q-ma-xs" @click="cancel">Cancel</span>
    </td>
  </tr>
</template>

<script>
export default {
  name: "newInvoice",
  props: {
    hourlyRate: Number,
  },
  data() {
    return {
      submitted: false,
      invoice: {
        hours: "",
        cost: "",
        description: "",
      },
    };
  },
  methods: {
    save() {
      this.submitted = true;
      if (
        !this.invoice.description ||
        this.invoice.cost <= 0 ||
        this.invoice.hours < 0
      ) {
        return;
      }
      this.$emit("save", {
        hours: Number(this.invoice.hours),
        cost: Number(this.invoice.cost),
        description: this.invoice.description,
      });
      this.cancel();
    },
    cancel() {
      this.submitted = false;
      this.invoice = {
        hours: "",
        cost: "",
        description: "",
      };
    },
    calculateCost() {
      this.invoice.cost = Number(this.invoice.hours) * this.hourlyRate;
    },
  },
  watch: {
    hourlyRate: {
      immediate: true,
      handler(newHR) {
        if (this.invoice.hours > 0) {
          this.invoice.cost = Number(this.invoice.hours) * newHR;
        }
      },
    },
  },
};
</script>

<style scoped></style>
