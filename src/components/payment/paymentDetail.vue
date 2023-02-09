<template>
  <q-card-section>
    <q-field label="The receiver" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">{{payment.requesterName}}</div>
      </template>
    </q-field>
    <q-field label="The sender" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">
          {{payment.contactMethod === "internal" ? payment.senderName : payment.senderEmail}}
        </div>
      </template>
    </q-field>
    <q-field label="Amount(USD)" stack-label>
      <template v-slot:prepend>
        <q-icon name="attach_money" />
      </template>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">
          {{payment.amount}}
        </div>
      </template>
    </q-field>
    <q-field :label="`Payment address (${payment.paymentMethod})`" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">
          {{payment.paymentAddress}}
        </div>
      </template>
    </q-field>
    <q-field label="Created At" stack-label>
      <template v-slot:control>
        <div class="self-center full-width no-outline" tabindex="0">
          <m-date :date="payment.createdAt"></m-date>
        </div>
      </template>
    </q-field>
    <div class="col-12">
      <div class="text-h6">Description</div>
      <div>
        {{payment.description}}
      </div>
    </div>
  </q-card-section>
</template>

<script>
import MDate from "components/common/mDate";
export default {
  name: "paymentDetail",
  components: {MDate},
  props: {
    payment: Object,
    processable: Boolean,
  }
}
</script>

<style scoped>

</style>
