<template>
  <product-list
    hasHeader
    :title="'Product List'"
    hasSearch
    hasPagination
    :productPerPage="18"
    isHomePage
    :cartCount="cartCount"
    @updateCartCount="updateCartCount"
  />
</template>

<script>
import productList from 'components/product/productList'

export default {
  name: 'storeProducts',
  props: {
    type: String,
    cartCount: Number,
  },
  components: { productList },
  data() {},
  methods: {
    updateCartCount(count) {
      this.$emit('updateCartCount', count)
    },
  },
}
</script>
