<template>
  <q-input outlined v-bind="$props" :type="visible ? 'text' : 'password'">
    <template v-slot:append>
      <q-icon :name="visible ? 'visibility' : 'visibility_off'" class="cursor-pointer" @click="visible = !visible" />
    </template>
  </q-input>
</template>

<script>
export default {
  name: 'qInputPw',
  data() {
    return {
      visible: false,
    }
  },
}
</script>

<style scoped></style>
