<template>
  <div class="row q-mb-md q-col-gutter-sm">
    <div v-if="label" class="col-12">
      <p class="q-mt-none q-mb-xs">{{ label }}</p>
    </div>

    <!-- Saved Addresses -->
    <div v-if="!readonly" class="col-12">
      <div v-if="savedMethods.length === 0" class="text-center q-pa-md">
        <q-icon name="wallet" size="48px" color="grey-5" />
        <p class="text-grey-6 q-mt-sm">No saved payment methods found</p>
        <q-btn label="Add Payment Method" color="primary" size="sm" @click="goToSettings" outline />
      </div>

      <q-field
        v-else
        :model-value="settings"
        stack-label
        borderless
        :rules="[(val) => (val !== null && val.length !== 0) || 'Please select at least one payment method']"
      >
        <template v-slot:control>
          <div class="full-width">
            <div v-for="method in savedMethods" :key="method.id" class="q-mb-sm">
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row items-center">
                    <q-checkbox
                      :model-value="isMethodSelected(method)"
                      @update:model-value="toggleSavedMethod(method)"
                    />
                    <div class="col-auto q-mx-sm">
                      <coin-label :type="method.coin.toLowerCase()" />
                    </div>
                    <div class="col">
                      <div class="text-weight-medium">{{ method.label }}</div>
                      <div class="text-caption text-grey-6">
                        {{ getNetworkName(method.network) }} • {{ truncateAddress(method.address) }}
                      </div>
                    </div>
                    <q-btn icon="content_copy" flat dense size="sm" @click="copyAddress(method.address)">
                      <q-tooltip>Copy address</q-tooltip>
                    </q-btn>
                  </div>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </template>
      </q-field>
    </div>

    <!-- Readonly Display -->
    <div class="col" v-if="settings && settings.length && readonly">
      <div class="q-mb-sm" v-for="(setting, i) of settings" :key="i">
        <div class="row items-center">
          <div class="col-auto">
            <coin-label :type="setting.type" />
          </div>
          <div class="col q-ml-sm">
            <div class="text-weight-medium">{{ setting.type.toUpperCase() }}</div>
            <div class="text-caption text-grey-6">{{ getNetworkNameForSetting(setting) }} • {{ setting.address }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneObject } from 'src/helper/helper'
import coinLabel from '../common/coin_label.vue'
import { copyToClipboard } from 'quasar'

export default {
  name: 'paymentSettingV2',
  components: {
    coinLabel,
  },
  props: {
    modelValue: Array,
    readonly: Boolean,
    label: String,
  },
  data() {
    return {
      settings: [],
      savedMethods: [],
      supportedNetworks: {},
    }
  },
  async created() {
    await this.loadSavedMethods()
    await this.loadSupportedNetworks()
  },
  methods: {
    async loadSavedMethods() {
      try {
        const data = await this.$api.get('/user/payment-methods')
        this.savedMethods = data || []
      } catch (error) {
        console.error('Failed to load saved payment methods:', error)
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

    getNetworkName(networkCode) {
      for (const coin of Object.keys(this.supportedNetworks)) {
        const network = this.supportedNetworks[coin]?.find((n) => n.code === networkCode)
        if (network) {
          return network.name
        }
      }
      return networkCode
    },

    truncateAddress(address) {
      if (!address) return ''
      if (address.length <= 20) return address
      return `${address.slice(0, 10)}...${address.slice(-10)}`
    },

    copyAddress(address) {
      copyToClipboard(address)
      this.$q.notify({
        type: 'positive',
        message: 'Address copied to clipboard',
        timeout: 1000,
      })
    },

    isMethodSelected(method) {
      return this.settings.some((s) => s.type === method.coin.toLowerCase() && s.address === method.address)
    },

    toggleSavedMethod(method) {
      const isSelected = this.isMethodSelected(method)

      if (isSelected) {
        // Remove from settings
        this.settings = this.settings.filter(
          (s) => !(s.type === method.coin.toLowerCase() && s.address === method.address)
        )
      } else {
        // Add to settings
        this.settings.push({
          type: method.coin.toLowerCase(),
          address: method.address,
          network: method.network,
        })
      }

      this.$emit('update:modelValue', this.settings)
    },

    goToSettings() {
      this.$router.push('/settings/payment_method')
    },

    getNetworkNameForSetting(setting) {
      // If setting has network property, use it
      if (setting.network) {
        return this.getNetworkName(setting.network)
      }
      // Try to find matching saved method to get network
      const savedMethod = this.savedMethods.find(
        (method) => method.coin.toLowerCase() === setting.type && method.address === setting.address
      )
      if (savedMethod) {
        return this.getNetworkName(savedMethod.network)
      }
      // Default fallback
      return 'Network'
    },
  },

  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.settings = cloneObject(newVal || [])
      },
    },
  },
}
</script>

<style scoped>
.center-row {
  align-items: center;
}
</style>
