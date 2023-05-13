<template>
  <q-field label="Approvers" stack-label borderless>
    <q-chip
      v-for="item in approvers"
      :key="item.approverId"
      :clickable="false"
      dense
      square
      :icon="item.isApproved ? 'done' : 'pending_actions'"
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
