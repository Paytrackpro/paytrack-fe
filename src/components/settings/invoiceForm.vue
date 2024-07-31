<template>
  <q-form @submit="submit">
    <div class="row"><q-checkbox label="Show Draft for Recipient" v-model="user.showDraftForRecipient" /></div>
    <div class="row"><q-checkbox label="Show Date on Invoice Line" v-model="user.showDateOnInvoiceLine" /></div>
    <div class="q-mt-lg">
      <q-btn label="Save" class="q-mr-xs btn-animated btn" :disable="loading" type="submit" color="primary" />
    </div>
  </q-form>
</template>

<script>
import { mapActions } from 'vuex'
export default {
  data() {
    return {
      user: {},
      loading: false,
    }
  },
  name: 'invoiceForm',
  props: {
    modelValue: Object,
  },
  emits: ['update:modelValue'],
  watch: {
    modelValue(val) {
      this.user = { ...val }
    },
  },
  methods: {
    ...mapActions({
      updateUser: 'user/updateUser',
    }),
    async submit() {
      this.loading = true
      const newUser = await this.updateUser(this.user)
      if (newUser) {
        this.$emit('update:modelValue', newUser)
      }
      this.loading = false
    },
  },
  created() {
    this.user = { ...this.modelValue }
  },
}
</script>

<style scoped></style>
