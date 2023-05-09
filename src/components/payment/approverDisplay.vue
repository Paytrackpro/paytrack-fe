<template>
  <div>
    <p><b>Approvers</b></p>
    <div class="q-gutter-xs">
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
    </div>
  </div>
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
