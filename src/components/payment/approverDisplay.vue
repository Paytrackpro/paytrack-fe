<template>
  <p>
    <b class="text-weight-medium">Approvers</b>
  </p>
  <q-field stack-label borderless>
    <template v-slot:control>
      <q-chip
        v-for="item in approvers"
        :key="item.approverId"
        :clickable="false"
        square
        dense
        text-color="white"
        :color="item.isApproved ? 'positive' : 'warning'"
        :icon="item.isApproved ? 'check_circle_outline' : 'schedule'"
      >
        {{ item.approverName }}
      </q-chip>
    </template>
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
