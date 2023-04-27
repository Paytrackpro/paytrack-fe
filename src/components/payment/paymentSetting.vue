<template>
  <div class="row q-mb-md q-col-gutter-md">
    <div v-if="label" class="col-12">
      <p class="q-mt-none q-mb-xs text-weight-medium">{{ label }}</p>
    </div>
    <div v-if="!readonly" class="col-3">
      <q-select
        filled
        ref="selectedCoins"
        v-model="selectedCoins"
        multiple
        :options="coins"
        use-chips
        stack-label
        lazy-rules
        label="Coins you accept"
        @update:model-value="changeCoins"
        :rules="[(val) => (val !== null && val.length !== 0) || 'Please select the coin types you accept for payment']"
      />
    </div>
    <div class="col">
      <q-markup-table v-if="settings && settings.length">
        <thead v-if="!readonly">
          <tr>
            <td style="width: 80px">Coin type</td>
            <td>Address</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(setting, i) of settings" :key="i">
            <td>
              {{ getSelectedCoin(setting.type).label }}
            </td>
            <td>
              <q-input
                v-model="setting.address"
                :label="`${getSelectedCoin(setting.type).label} address`"
                :readonly="readonly"
                dense
                lazy-rules
                stack-label
                hide-bottom-space
                @update:model-value="emit"
              />
            </td>
          </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

<script>
import { cloneObject } from 'src/helper/helper'
export default {
  name: 'paymentSetting',
  props: {
    modelValue: Array,
    readonly: Boolean,
    label: String,
  },
  data() {
    return {
      coins: [
        { label: 'BTC', value: 'btc' },
        { label: 'LTC', value: 'ltc' },
        { label: 'DCR', value: 'dcr' },
      ],
      selectedCoins: [],
      settings: [],
    }
  },
  methods: {
    emit() {
      this.$emit('update:modelValue', this.settings)
    },
    changeCoins(coins) {
      const settings = this.settings || []
      const newSettings = []
      for (let coin of coins) {
        let found = false
        for (let setting of settings) {
          if (setting.type === coin.value) {
            found = true
            newSettings.push({
              type: setting.type,
              address: setting.address,
            })
          }
        }
        if (!found) {
          newSettings.push({
            type: coin.value,
            address: '',
          })
        }
      }
      this.$emit('update:modelValue', newSettings)
    },
    getSelectedCoin(type) {
      for (let coin of this.coins) {
        if (coin.value === type) {
          return coin
        }
      }
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.settings = cloneObject(newVal || [])
        const selectedCoins = []
        for (let setting of this.settings) {
          selectedCoins.push(this.getSelectedCoin(setting.type))
        }
        this.selectedCoins = selectedCoins
      },
    },
  },
}
</script>

<style scoped></style>
