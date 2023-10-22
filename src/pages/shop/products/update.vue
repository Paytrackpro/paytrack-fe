<template>
  <q-card flat class="q-pa-md content-container">
    <product-form :product="product" :isEdit="true" />
  </q-card>
</template>

<script>
import ProductForm from 'components/product/productForm.vue'

export default {
  name: 'createProduct',
  components: {
    ProductForm,
  },
  props: {
    paymentType: String,
  },
  data() {
    return {
      product: {},
      errorStatus: 0,
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.$api
        .get(`/shop/product/info/${this.$route.params.id}`)
        .then((data) => {
          this.loading = false
          this.product = data
        })
        .catch((err) => {
          this.loading = false
          this.errorStatus = err.status
        })
    },
  },
}
</script>

<style scoped></style>
