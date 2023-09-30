<template>
  <q-card flat class="q-pa-md content-container">
    <product-form />
  </q-card>
</template>

<script>
import ProductForm from 'components/product/productForm.vue'

export default {
  name: 'createProduct',
  components: {
    ProductForm,
  },
  data() {
    return {}
  },
}
</script>

<style scoped></style>
