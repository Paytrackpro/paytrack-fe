<template>
  <div class="row q-mb-md q-col-gutter-md">
    <div v-if="label" class="col-12">
      <p class="q-mt-none q-mb-xs text-weight-medium">{{ label }}</p>
    </div>
    <div v-if="!readonly" class="col-3">
      <q-select
        filled
        v-model="selectedCoins"
        multiple
        :options="coins"
        use-chips
        stack-label
        label="Coins you accept"
        @update:model-value="changeCoins"
      />
    </div>
    <div class="col">
      <q-markup-table v-if="settings && settings.length">
        <thead v-if="!readonly">
          <tr>
            <td style="width: 80px">Default</td>
            <td>Address</td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(setting, i) of settings" :key="i">
            <td>
              <span v-if="readonly">{{ setting.type }}</span>
              <q-radio
                v-else
                v-model="isDefault"
                checked-icon="task_alt"
                unchecked-icon="panorama_fish_eye"
                :val="setting.type"
                :label="setting.type"
                @update:model-value="changeDefault"
              />
            </td>
            <td>
              <q-input
                v-model="setting.address"
                :label="`${setting.type} address`"
                :readonly="readonly"
                outlined
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
import {cloneObject} from "src/helper/helper"
export default {
  name: "paymentSetting",
  props: {
    modelValue: Array,
    readonly: Boolean,
    label: String,
  },
  data() {
    return {
      coins: ["btc", "ltc", "dcr"],
      selectedCoins: [],
      isDefault: "",
      settings: []
    };
  },
  methods: {
    emit() {
      this.$emit("update:modelValue", this.settings);
    },
    changeCoins(coins) {
      const settings = this.settings || [];
      const newSettings = [];
      for (let coin of coins) {
        let found = false;
        for (let setting of settings) {
          if (setting.type === coin) {
            found = true;
            newSettings.push({
              type: setting.type,
              address: setting.address,
              isDefault: setting.isDefault,
            });
          }
        }
        if (!found) {
          newSettings.push({
            type: coin,
            address: "",
            isDefault: false,
          });
        }
      }
      this.$emit("update:modelValue", newSettings);
    },
    changeDefault(coin) {
      for (let setting of this.settings) {
        setting.isDefault = setting.type === coin;
      }
      this.emit();
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.settings = cloneObject(newVal)
        const selectedCoins = [];
        for (let setting of this.settings) {
          selectedCoins.push(setting.type);
          if (setting.isDefault) {
            this.isDefault = setting.type;
          }
        }
        this.selectedCoins = selectedCoins;
      },
    },
  },
};
</script>

<style scoped></style>
