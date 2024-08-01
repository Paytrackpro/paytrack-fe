<template>
  <div class="row q-col-gutter-sm">
    <div v-if="label" class="col-12">
      <p class="q-mt-none q-mb-xs">{{ label }}</p>
    </div>
    <div v-if="!readonly" class="col-12">
      <q-field
        :model-value="settings"
        stack-label
        borderless
        :rules="[(val) => (val !== null && val.length !== 0) || 'Please select the coin types you accept for payment']"
      >
        <template v-slot:control>
          <div class="row">
            <div class="col-12 q-mt-sm" v-for="(coin, i) of coins" :key="i">
              <div class="row center-row">
                <q-checkbox v-model="coin.selected" @update:model-value="selectCoin" />
                <div align="center" class="col-2 col-sm-1 col-md-2 col-lg-1">
                  <coin-label :type="coin.data.value" />
                </div>
                <q-input
                  class="q-ml-sm"
                  style="width: 60%"
                  v-model="coin.address"
                  outlined
                  dense
                  lazy-rules
                  stack-label
                  :placeholder="coin.data.label + ' Address'"
                  :disable="!coin.selected"
                  @update:model-value="inputChange"
                >
                </q-input>
              </div>
            </div>
          </div>
        </template>
      </q-field>
    </div>
    <div class="col" v-if="settings && settings.length && readonly">
      <div class="row center-row" v-for="(setting, i) of settings" :key="i">
        <coin-label :type="setting.type" hasAddress :address="setting.address" />
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
      coins: [],
      selectedCoins: [],
      settings: [],
    }
  },
  methods: {
    emit() {
      this.$emit('update:modelValue', this.settings)
    },
    selectCoin() {
      const settings = this.settings || []
      const newSettings = []
      for (let coin of this.coins) {
        if (coin.selected) {
          let found = false
          for (let setting of settings) {
            if (setting.type === coin.data.value) {
              found = true
              newSettings.push({
                type: setting.type,
                address: setting.address,
              })
            }
          }
          if (!found) {
            newSettings.push({
              type: coin.data.value,
              address: '',
            })
          }
        }
      }
      this.$emit('update:modelValue', newSettings)
    },
    inputChange() {
      const settings = this.settings || []
      for (let coin of this.coins) {
        if (coin.selected) {
          for (let setting of settings) {
            if (setting.type === coin.data.value && setting.address !== coin.address) {
              setting.address = coin.address
              this.$emit('update:modelValue', settings)
            }
          }
        }
      }
    },
    getSelectedCoin(type) {
      for (let coin of this.coins) {
        if (coin.data.value === type) {
          return coin
        }
      }
    },
    getCoinColor(type) {
      for (let coin of this.coins) {
        if (coin.data.value === type) {
          return coin.color
        }
      }
    },
    getCoinData() {
      if (this.coins && this.coins.length > 0) {
        return this.coins
      }
      let result = []
      for (let coin of COINS) {
        result.push({ data: coin, selected: false, address: '' })
      }
      return result
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.coins = this.getCoinData()
        this.settings = cloneObject(newVal || [])
        for (let setting of this.settings) {
          const coin = this.getSelectedCoin(setting.type)
          if (coin) {
            coin.selected = true
            coin.address = setting.address
          }
        }
      },
    },
  },
}
</script>

<style scoped></style>
