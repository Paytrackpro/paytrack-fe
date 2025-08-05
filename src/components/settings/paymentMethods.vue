<template>
  <div>
    <!-- Hour Rate Section -->
    <q-card class="q-ma-md">
      <q-card-section>
        <h6 class="q-mb-md">Hour Rate & Payments</h6>
        <q-paragraph class="q-mb-md">
          Hourly rate is the rate you charge for each hour of work. It reflects the cost of services based on the time
          you work.
        </q-paragraph>
      </q-card-section>
    </q-card>

    <q-form @submit="saveHourRate">
      <div class="row q-mb-md items-center">
        <div class="col-auto">
          <custom-input
            class="q-px-sm"
            :label="'Hour Rate (USD/h)'"
            notitleCase
            :type="'number'"
            v-model="hourlyLaborRate"
            :step="'any'"
            :rules="priceRules"
            style="min-width: 200px"
          />
        </div>
        <div class="col-auto">
          <q-btn
            label="Update"
            class="btn-animated btn q-ml-sm"
            style="margin-top: 25px"
            :disable="loading"
            type="submit"
            color="primary"
          />
        </div>
      </div>
    </q-form>

    <!-- Crypto Wallets Section -->
    <q-card class="q-ma-md q-mt-lg">
      <q-card-section>
        <div class="row items-center justify-between">
          <h6 class="q-mb-none">Crypto Wallets</h6>
          <q-btn color="primary" icon="add" label="Add New Address" @click="showAddDialog = true" unelevated />
        </div>
      </q-card-section>

      <q-card-section v-if="loadingMethods" class="text-center q-py-lg">
        <q-spinner color="primary" size="50px" />
        <p class="text-grey-6 q-mt-md">Loading payment methods...</p>
      </q-card-section>

      <q-card-section v-else-if="paymentMethods.length === 0" class="text-center q-py-lg">
        <q-icon name="wallet" size="60px" color="grey-5" class="q-mb-md" />
        <p class="text-grey-6">No payment methods added yet</p>
        <q-btn color="primary" icon="add" label="Add Your First Wallet" @click="showAddDialog = true" unelevated />
      </q-card-section>

      <div class="relative-position">
        <q-markup-table v-if="!loadingMethods" flat bordered>
          <thead>
            <tr>
              <th class="text-left">COIN</th>
              <th class="text-left">NETWORK</th>
              <th class="text-left">WALLET ADDRESS</th>
              <th class="text-center">STATUS</th>
              <th class="text-center">ACTION</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="method in paymentMethods" :key="method.id">
              <td>
                <div class="row items-center">
                  <coin-label :type="method.coin.toLowerCase()" />
                  <span class="q-ml-sm">{{ method.coin }}</span>
                </div>
              </td>
              <td>{{ getNetworkDisplayName(method.network) }}</td>
              <td>
                <div class="row items-center">
                  <span class="text-monospace">{{ method.address }}</span>
                  <q-btn
                    icon="content_copy"
                    flat
                    dense
                    size="sm"
                    class="q-ml-sm"
                    @click="copyToClipboard(method.address)"
                  >
                    <q-tooltip>Copy address</q-tooltip>
                  </q-btn>
                </div>
              </td>
              <td class="text-center">
                <q-toggle v-model="method.enabled" color="primary" @update:model-value="togglePaymentMethod(method)" />
              </td>
              <td class="text-center">
                <q-btn icon="delete" flat dense color="negative" @click="confirmDelete(method)">
                  <q-tooltip>Delete</q-tooltip>
                </q-btn>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </div>
    </q-card>

    <!-- Add Payment Method Dialog -->
    <AddPaymentMethodDialog
      v-model="showAddDialog"
      :supported-networks="supportedNetworks"
      @added="onPaymentMethodAdded"
    />

    <!-- Delete Confirmation Dialog -->
    <q-dialog v-model="showDeleteConfirm" persistent>
      <q-card style="min-width: 400px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6">Delete Payment Method</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup :disable="deletingMethod" />
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pt-lg">
          <div class="row items-center q-mb-md">
            <q-icon name="warning" color="negative" size="24px" />
            <span class="q-ml-sm">Are you sure you want to delete this payment method?</span>
          </div>

          <q-card flat bordered>
            <q-card-section>
              <div class="row items-center q-mb-xs">
                <coin-label :type="selectedMethod?.coin?.toLowerCase()" />
                <span class="q-ml-sm text-weight-medium">{{ selectedMethod?.coin }}</span>
              </div>
              <div class="text-caption text-grey-7">
                <strong>Network:</strong> {{ getNetworkDisplayName(selectedMethod?.network) }}
              </div>
              <div class="text-caption text-grey-7">
                <strong>Address:</strong>
                <span class="text-monospace">{{ selectedMethod?.address }}</span>
              </div>
            </q-card-section>
          </q-card>

          <div class="text-caption text-negative q-mt-md">
            <q-icon name="info" size="16px" />
            This action cannot be undone.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="Cancel" color="primary" v-close-popup :disable="deletingMethod" />
          <q-btn unelevated label="Delete" color="negative" @click="deletePaymentMethod" :loading="deletingMethod" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
import { copyToClipboard } from 'quasar'
import customInput from '../common/custom_input.vue'
import coinLabel from '../common/coin_label.vue'
import AddPaymentMethodDialog from './AddPaymentMethodDialog.vue'

export default {
  name: 'paymentMethods',
  components: {
    customInput,
    coinLabel,
    AddPaymentMethodDialog,
  },
  props: {
    modelValue: Object,
  },
  data() {
    return {
      user: {},
      loading: false,
      loadingMethods: false,
      deletingMethod: false,
      showAddDialog: false,
      showDeleteConfirm: false,
      selectedMethod: null,
      paymentMethods: [],
      supportedNetworks: {},
      priceRules: [
        (v) =>
          (v && v.toString().split('.').length < 2) ||
          (v && v.toString().split('.')[1].length <= 2) ||
          'No more than 2 digits after the decimal point',
      ],
    }
  },
  emits: ['update:modelValue'],
  computed: {
    hourlyLaborRate: {
      get() {
        return this.user.hourlyLaborRate
      },
      set(hourRate) {
        this.user.hourlyLaborRate = Number(hourRate)
      },
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.user = { ...newVal }
      },
    },
  },
  async created() {
    await this.loadPaymentMethods()
    await this.loadSupportedNetworks()
  },
  methods: {
    ...mapActions({
      updateUser: 'user/updateUser',
    }),

    async saveHourRate() {
      this.loading = true
      try {
        const newUser = await this.updateUser(this.user)
        if (newUser) {
          this.$emit('update:modelValue', newUser)
          this.$q.notify({
            type: 'positive',
            message: 'Hour rate updated successfully',
          })
        }
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to update hour rate',
        })
      }
      this.loading = false
    },

    async loadPaymentMethods() {
      this.loadingMethods = true
      try {
        const data = await this.$api.get('/user/payment-methods')
        this.paymentMethods = data.map((method) => ({
          ...method,
          enabled: true, // Assume all methods are enabled by default
        }))
      } catch (error) {
        console.error('Failed to load payment methods:', error)
        this.$q.notify({
          type: 'negative',
          message: 'Failed to load payment methods',
        })
      } finally {
        this.loadingMethods = false
      }
    },

    async loadSupportedNetworks() {
      try {
        const data = await this.$api.get('/payment-methods/supported-networks')
        this.supportedNetworks = data.supportedCoins.reduce((acc, coin) => {
          acc[coin.coin] = coin.networks
          return acc
        }, {})
      } catch (error) {
        console.error('Failed to load supported networks:', error)
      }
    },

    getNetworkDisplayName(networkCode) {
      for (const coin of Object.keys(this.supportedNetworks)) {
        const network = this.supportedNetworks[coin].find((n) => n.code === networkCode)
        if (network) {
          return network.name
        }
      }
      return networkCode
    },

    copyToClipboard(text) {
      copyToClipboard(text)
      this.$q.notify({
        type: 'positive',
        message: 'Address copied to clipboard',
        timeout: 1000,
      })
    },

    togglePaymentMethod(method) {
      // Here you could implement enable/disable functionality
      // For now, we'll just show a notification
      this.$q.notify({
        type: 'info',
        message: `Payment method ${method.enabled ? 'enabled' : 'disabled'}`,
        timeout: 1000,
      })
    },

    confirmDelete(method) {
      this.selectedMethod = method
      this.showDeleteConfirm = true
    },

    onPaymentMethodAdded() {
      // Small delay to ensure dialog closes smoothly
      setTimeout(() => {
        this.loadPaymentMethods()
      }, 300)
    },

    async deletePaymentMethod() {
      this.deletingMethod = true
      try {
        await this.$api.delete(`/user/payment-methods/${this.selectedMethod.id}`)
        this.$q.notify({
          type: 'positive',
          message: 'Payment method deleted successfully',
        })
        this.showDeleteConfirm = false
        this.selectedMethod = null
        await this.loadPaymentMethods()
      } catch (error) {
        this.$q.notify({
          type: 'negative',
          message: 'Failed to delete payment method',
        })
      } finally {
        this.deletingMethod = false
      }
    },
  },
}
</script>

<style scoped>
.text-monospace {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 0.9em;
}
</style>
