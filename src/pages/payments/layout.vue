<template>
  <div class="q-pa-md">
    <q-breadcrumbs>
      <q-breadcrumbs-el label="Home" to="/"/>
      <q-breadcrumbs-el label="Payment" to="/payment"/>
    </q-breadcrumbs>
    <router-view/>
  </div>
</template>

<script>
export default {
  name: "payment"
}
</script>

<style scoped>

</style>
