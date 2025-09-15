<template>
  <q-dialog v-model="show" persistent>
    <q-card style="min-width: 500px">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">Add New Wallet Address</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="closeDialog" />
      </q-card-section>

      <q-separator />

      <q-card-section class="q-pt-lg">
        <q-form @submit="addPaymentMethod" class="q-gutter-lg">
          <!-- Coin Type -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Coin Type</div>
            <q-select
              v-model="form.coin"
              :options="coinOptions"
              placeholder="-- Select a coin --"
              outlined
              emit-value
              map-options
              :rules="[(val) => !!val || 'Please select a coin']"
              @update:model-value="onCoinChanged"
            >
              <template v-slot:option="scope">
                <q-item v-bind="scope.itemProps">
                  <q-item-section avatar>
                    <coin-label :type="scope.opt.value.toLowerCase()" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label>{{ scope.opt.label }}</q-item-label>
                  </q-item-section>
                </q-item>
              </template>
              <template v-slot:selected>
                <div class="row items-center" v-if="form.coin">
                  <coin-label :type="form.coin.toLowerCase()" />
                  <span class="q-ml-sm">{{ form.coin }}</span>
                </div>
              </template>
            </q-select>
          </div>

          <!-- Network -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Network</div>
            <q-select
              v-model="form.network"
              :options="networkOptions"
              placeholder="-- Select a network --"
              outlined
              emit-value
              map-options
              :disable="!form.coin"
              :rules="[(val) => !!val || 'Please select a network']"
            />
          </div>

          <!-- Wallet Address -->
          <div>
            <div class="text-subtitle2 q-mb-sm">Wallet Address</div>
            <q-input v-model="form.address" placeholder="Enter your wallet address" outlined :rules="addressRules" />
          </div>

          <!-- Validation Message -->
          <div v-if="addressValidation.message" class="q-mt-sm">
            <q-banner :class="addressValidation.isValid ? 'bg-positive text-white' : 'bg-negative text-white'" dense>
              {{ addressValidation.message }}
            </q-banner>
          </div>
        </q-form>
      </q-card-section>

      <q-card-actions align="right" class="q-pa-lg q-pt-none">
        <q-btn flat label="Cancel" color="grey-7" @click="closeDialog" class="q-mr-sm" />
        <q-btn
          label="Verify"
          color="positive"
          :loading="validating"
          :disable="!canVerify"
          @click="validateAddress"
          class="q-mr-sm"
        />
        <q-btn
          label="Save Address"
          color="primary"
          :loading="loading"
          :disable="!isFormValid"
          @click="addPaymentMethod"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import coinLabel from '../common/coin_label.vue'

export default {
  name: 'AddPaymentMethodDialog',
  components: {
    coinLabel,
  },
  props: {
    modelValue: Boolean,
    supportedNetworks: {
      type: Object,
      default: () => ({}),
    },
  },
  emits: ['update:modelValue', 'added'],
  data() {
    return {
      loading: false,
      validating: false,
      form: {
        coin: '',
        network: '',
        address: '',
      },
      addressValidation: {
        isValid: null,
        message: '',
      },
    }
  },
  computed: {
    show: {
      get() {
        return this.modelValue
      },
      set(val) {
        this.$emit('update:modelValue', val)
      },
    },
    coinOptions() {
      return Object.keys(this.supportedNetworks).map((coin) => ({
        label: coin,
        value: coin,
      }))
    },
    networkOptions() {
      if (!this.form.coin || !this.supportedNetworks[this.form.coin]) {
        return []
      }
      return this.supportedNetworks[this.form.coin].map((network) => ({
        label: network.name,
        value: network.code,
      }))
    },
    addressRules() {
      return [(val) => !!val || 'Wallet address is required', (val) => val.length >= 10 || 'Address seems too short']
    },
    canVerify() {
      return this.form.coin && this.form.network && this.form.address && this.form.address.length >= 10
    },
    isFormValid() {
      return this.form.coin && this.form.network && this.form.address && this.addressValidation.isValid === true
    },
  },
  watch: {
    modelValue(newVal) {
      if (newVal) {
        this.resetForm()
      }
    },
    'form.address'() {
      // Reset validation when address changes
      this.addressValidation = {
        isValid: null,
        message: '',
      }
    },
  },
  methods: {
    onCoinChanged() {
      // Reset network and address when coin changes
      this.form.network = ''
      this.form.address = ''
      this.addressValidation = {
        isValid: null,
        message: '',
      }
    },

    async validateAddress() {
      if (!this.form.coin || !this.form.network || !this.form.address) {
        return
      }

      this.validating = true
      try {
        const data = await this.$api.post('/user/payment-methods/validate-address', {
          coin: this.form.coin,
          network: this.form.network,
          address: this.form.address,
        })

        const { isValid, reason } = data
        this.addressValidation = {
          isValid,
          message: isValid ? 'Address is valid!' : reason || 'Invalid address',
        }
      } catch (error) {
        console.error('Address validation failed:', error)
        this.addressValidation = {
          isValid: false,
          message: 'Failed to validate address',
        }
      }
      this.validating = false
    },

    async addPaymentMethod() {
      // Validate address first if not already validated
      if (this.addressValidation.isValid !== true) {
        await this.validateAddress()
        if (this.addressValidation.isValid !== true) {
          return
        }
      }

      this.loading = true
      try {
        // Auto-generate label from coin and network
        const networkName = this.networkOptions.find((n) => n.value === this.form.network)?.label || this.form.network
        const label = `${this.form.coin} (${networkName})`

        await this.$api.post('/user/payment-methods', {
          label: label,
          coin: this.form.coin,
          network: this.form.network,
          address: this.form.address,
        })

        // Reset loading state first
        this.loading = false

        this.$q.notify({
          type: 'positive',
          message: 'Payment method added successfully',
          position: 'top',
          timeout: 2000,
        })

        // Reset form for next use
        this.resetForm()

        // Close dialog and emit event
        this.show = false
        this.$emit('added')
      } catch (error) {
        this.loading = false
        console.error('Failed to add payment method:', error)
        this.$q.notify({
          type: 'negative',
          message: error.response?.data?.message || error.message || 'Failed to add payment method',
          position: 'top',
          timeout: 3000,
        })
      }
    },

    resetForm() {
      this.form = {
        coin: '',
        network: '',
        address: '',
      }
      this.addressValidation = {
        isValid: null,
        message: '',
      }
    },

    closeDialog() {
      this.resetForm()
      this.show = false
    },
  },
}
</script>

<style scoped>
.q-banner {
  border-radius: 4px;
}
</style>
