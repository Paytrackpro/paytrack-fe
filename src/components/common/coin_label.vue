<template>
  <q-chip class="sm-chip" square text-color="white" :color="coinColor">
    {{ selectedCoin.label }}
  </q-chip>
  <p class="text-caption q-ml-sm" v-if="hasAddress">
    <b>{{ address }}</b>
  </p>
</template>

<script>
import { computed } from 'vue'
import { COINS } from 'src/consts/common'
export default {
  name: 'coinLabel',
  props: {
    type: String,
    hasAddress: Boolean,
    address: String,
  },
  computed: {
    coinColor() {
      for (let coin of COINS) {
        if (coin.value === this.type) {
          return coin.color
        }
      }
      return ''
    },
    selectedCoin() {
      for (let coin of COINS) {
        if (coin.value === this.type) {
          return coin
        }
      }
      return ''
    },
  },
}
</script>

<style scoped></style>
