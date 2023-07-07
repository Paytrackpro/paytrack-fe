<template>
  <div class="q-pa-lg">
    <!--    <q-breadcrumbs>
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Payment" to="/payment"/>
    </q-breadcrumbs>-->
    <router-view :approvalCount="approvalCount" />
  </div>
</template>

<script>
export default {
  name: 'pagePayment',
  props: {
    approvalCount: Number,
  },
}
</script>

<style scoped></style>
