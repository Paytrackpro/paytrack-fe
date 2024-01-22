<template>
  <div class="d-flex">
    <div class="d-flex q-mb-xs ai-center" v-if="label">
      <b class="text-weight-medium">{{ label }} </b>
    </div>
    <q-field class="q-ml-sm" label-slot stack-label borderless>
      <div class="row">
        <q-option-group
          size="xs"
          :disable="readonly"
          class="q-mr-md"
          v-model="value"
          @update:model-value="udpateValue"
          :options="paymentMethods"
          color="primary"
          inline
        >
          <template v-slot:label="payMethod">
            <div class="row items-center">
              <coin-label :type="payMethod.value" />
            </div>
          </template>
        </q-option-group>
      </div>
      <br />
    </q-field>
  </div>
  <div class="d-flex q-mt-xs">
    <span class="address-label">Address: </span>
    <p class="text-weight-bold text-blue-8 custom-link show-address" @click="copyAddress">
      {{ address }}
    </p>
    <q-btn v-if="value != ''" class="copy-width-btn" round dense flat @click="copyAddress">
      <q-icon size="xs" class="custom-icon" :name="'o_content_copy'" />
      <q-tooltip>Copy address</q-tooltip>
    </q-btn>
  </div>
</template>

<script>
import coinLabel from '../common/coin_label.vue'
export default {
  name: 'paymentSettingMethod',
  components: {
    coinLabel,
  },
  props: {
    modelValue: Array,
    label: String,
    readonly: Boolean,
    defautMethod: String,
  },
  emits: ['change'],
  data() {
    return {
      value: this.defautMethod,
      allMethods: {},
    }
  },
  methods: {
    udpateValue(value) {
      let tempValue = this.value.split('-')
      this.$emit('change', tempValue[0])
    },
    async copyAddress() {
      await navigator.clipboard.writeText(this.address || '')
      this.$q.notify({
        type: 'positive',
        message: 'Copied.',
        position: 'bottom',
      })
    },
  },
  watch: {
    modelValue: {
      immediate: true,
      handler(methods) {
        methods.forEach((el) => {
          this.allMethods[el.type] = el
        })
      },
    },
  },
  computed: {
    paymentMethods() {
      let methods = []
      let datas = this.modelValue || []
      datas.forEach((el) => {
        methods.push({
          label: el.type.toUpperCase(),
          value: el.type,
        })
      })
      return methods
    },
    address() {
      if (this.value == '') {
        return this.value
      }
      return this.allMethods[this.value].address
    },
  },
}
</script>
