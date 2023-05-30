<template>
  <p class="q-mb-xs">
    <b class="text-weight-medium">Approvers</b>
  </p>
  <q-field stack-label borderless>
    <q-chip
      v-for="item in approvers"
      :key="item.approverId"
      :clickable="false"
      square
      dense
      class="text-size-13"
      text-color="white"
      :color="item.isApproved ? 'positive' : 'warning'"
      :icon="item.isApproved ? 'check_circle_outline' : 'schedule'"
    >
      {{ item.approverName }}
    </q-chip>
  </q-field>
</template>

<script>
export default {
  name: 'ApproverDisplay',
  props: {
    approvers: Array,
  },
  data() {
    return {
      listApprover: [],
      approved: false,
    }
  },
}
</script>
<style scoped></style>
