<template>
  <product-list hasHeader :title="'Product List'" hasSearch hasPagination :productPerPage="18" />
</template>

<script>
import productList from 'components/product/productList'

export default {
  name: 'homePage',
  props: {
    type: String,
  },
  components: { productList },
  data() {},
}
</script>
