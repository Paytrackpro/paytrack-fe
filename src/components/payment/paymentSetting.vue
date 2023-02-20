<template>
  <div class="row q-mb-md q-col-gutter-md">
    <div class="col-12">
      <p class="q-mt-none q-mb-xs text-weight-medium">Payment setting</p>
    </div>
    <div class="col-3">
      <q-select
        filled
        v-model="selectedCoins"
        multiple
        :options="coins"
        use-chips
        stack-label
        label="Coins you accept"
        @input="changeCoins"
      />
    </div>
    <div class="col">
      <q-markup-table v-if="value && value.length">
        <thead>
        <tr>
          <td style="width: 80px">Default</td>
          <td>Address</td>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(setting, i) of value" :key="i">
          <td>
            <q-radio v-model="isDefault" checked-icon="task_alt" unchecked-icon="panorama_fish_eye" :val="setting.type"
             :label="setting.type" @input="changeDefault" />
          </td>
          <td>
            <q-input
              v-model="setting.address"
              :label="`${setting.type} address`"
              outlined
              dense
              lazy-rules
              stack-label
              hide-bottom-space
            />
          </td>
        </tr>
        </tbody>
      </q-markup-table>
    </div>
  </div>
</template>

<script>
export default {
  name: "paymentSetting",
  props: {
    value: Array
  },
  data() {
    return {
      coins: ["btc", "ltc", "dcr"],
      selectedCoins: [],
      isDefault: ""
    }
  },
  methods: {
    changeCoins(coins) {
      const settings = this.value || []
      const newSettings = []
      for (let coin of coins) {
        let found = false
        for (let setting of settings) {
          if (setting.type === coin) {
            found = true
            newSettings.push({
              type: setting.type,
              address: setting.address,
              isDefault: setting.isDefault
            })
          }
        }
        if (!found) {
          newSettings.push({
            type: coin,
            address: "",
            isDefault: false
          })
        }
      }
      this.$emit("input", newSettings)
    },
    changeDefault(coin) {
      const settings = this.value || []
      for (let setting of settings) {
        setting.isDefault = setting.type === coin
      }
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        const settings = newVal || []
        const selectedCoins = []
        for (let setting of settings) {
          selectedCoins.push(setting.type)
          if (setting.isDefault) {
            this.isDefault = setting.type
          }
        }
        this.selectedCoins = selectedCoins
      }
    }
  }
}
</script>

<style scoped>

</style>
