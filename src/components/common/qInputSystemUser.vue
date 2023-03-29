<template>
  <q-input
    v-bind="$props"
    v-model="partner.value"
    @blur="checkingDestination"
    :error="partnerError"
    :error-message="error"
    hint="expect an user name on mgmt or an email address"
  >
    <template v-slot:prepend>
      <q-icon name="person_add" />
    </template>
  </q-input>
</template>

<script>
import { emailPattern } from 'src/helper/validations'
const DESTINATION_CHECK_NONE = 0
const DESTINATION_CHECK_CHECKING = 1
const DESTINATION_CHECK_FAIL = 2
const DESTINATION_CHECK_DONE = 3

export default {
  name: 'qInputSystemUser',
  data() {
    return {
      partner: {
        id: 0,
        value: '',
        paymentSettings: [],
        contactMethod: '',
      },
      error: '',
      status: DESTINATION_CHECK_NONE,
    }
  },
  props: {
    modelValue: Object,
  },
  methods: {
    checkingDestination($e) {
      this.status = DESTINATION_CHECK_NONE
      this.error = ''
      this.partner.id = 0
      this.partner.contactMethod = ''
      if (!this.partner.value) {
        this.emit()
        return
      }
      if (emailPattern.test(this.partner.value)) {
        this.status = DESTINATION_CHECK_DONE
        this.partner.contactMethod = 'email'
        this.emit()
        return
      }
      // checking
      this.partner.status = DESTINATION_CHECK_CHECKING
      this.$api
        .get(`/user/exist-checking?userName=${this.partner.value}`)
        .then(({ found, id, userName, paymentSettings, message }) => {
          if (found) {
            this.status = DESTINATION_CHECK_DONE
            this.partner.id = id
            this.partner.paymentSettings = paymentSettings || []
            this.partner.contactMethod = 'internal'
          } else {
            this.status = DESTINATION_CHECK_FAIL
            this.error = message
          }
        })
        .catch(() => {
          this.status = DESTINATION_CHECK_FAIL
          this.error = 'the user name is not found'
        })
        .finally(() => {
          this.emit()
        })
    },
    emit() {
      this.$emit('update:modelValue', this.partner)
    },
  },
  computed: {
    partnerError: function () {
      return this.status === DESTINATION_CHECK_FAIL
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler({ id, value, paymentSettings }) {
        this.partner = {
          id,
          value,
          paymentSettings,
        }
      },
    },
  },
}
</script>

<style scoped></style>
