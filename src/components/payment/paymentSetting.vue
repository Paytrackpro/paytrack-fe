<template>
  <div class="row q-mb-md q-col-gutter-md">
    <div v-if="label" class="col-12">
      <p class="q-mt-none q-mb-xs text-weight-medium">{{ label }}</p>
    </div>
    <div v-if="!readonly" class="col-12 col-sm-6 col-lg-3">
      <q-field
        :model-value="selectedCoins"
        label="Coins you accept"
        stack-label
        :rules="[(val) => (val !== null && val.length !== 0) || 'Please select the coin types you accept for payment']"
      >
        <template v-slot:control>
          <q-option-group
            :options="coins"
            type="checkbox"
            inline
            v-model="selectedCoins"
            @update:model-value="changeCoins"
          />
        </template>
      </q-field>
    </div>
    <div class="col" v-if="settings && settings.length">
      <q-markup-table v-if="!readonly">
        <thead>
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
      <div v-if="readonly">
        <div class="row center-row" v-for="(setting, i) of settings" :key="i">
          <coin-label :type="setting.type" hasAddress :address="setting.address" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { cloneObject } from 'src/helper/helper'
import { COINS } from 'src/consts/common'
import coinLabel from '../common/coin_label.vue'

export default {
  name: 'paymentSetting',
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
      coins: COINS,
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
          if (setting.type === coin) {
            found = true
            newSettings.push({
              type: setting.type,
              address: setting.address,
            })
          }
        }
        if (!found) {
          newSettings.push({
            type: coin,
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
    getCoinColor(type) {
      for (let coin of this.coins) {
        if (coin.value === type) {
          return coin.color
        }
      }
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.settings = cloneObject(newVal || [])
        let selectedCoins = []
        for (let setting of this.settings) {
          const coin = this.getSelectedCoin(setting.type)
          if (coin) {
            selectedCoins.push(coin.value)
          }
        }
        this.selectedCoins = selectedCoins
      },
    },
  },
}
</script>

<style scoped></style>
