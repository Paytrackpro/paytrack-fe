<template>
  <q-field v-if="label" label-slot stack-label borderless>
    <div class="row q-my-md">
      <q-option-group
        :disable="readonly"
        class="q-mr-md"
        v-model="value"
        @update:model-value="udpateValue"
        :options="paymentMethods"
        color="primary"
        inline
      />
    </div>
    <br />
    <template v-slot:label>
      <div class="row">
        <p class="q-mb-xs text-h6">{{ label }}</p>
      </div>
    </template>
  </q-field>
  <div class="row">
    <q-item-label lines="1">
      <span>Address: </span>
      <span class="text-weight-bold"> {{ address }}</span>
      <q-btn v-if="value != ''" round dense flat icon="content_copy" @click="copyAddress" />
    </q-item-label>
  </div>
</template>

<script>
export default {
  name: 'paymentSettingMethod',
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
        message: 'copied.',
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
