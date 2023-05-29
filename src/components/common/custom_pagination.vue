<template>
  <q-pagination
    v-model="paginationModel.page"
    :max="Math.ceil(pagination.rowsNumber / pagination.rowsPerPage)"
    direction-links
    outline
    :color="color"
    active-design="unelevated"
  />
</template>

<script>
import { computed } from 'vue'
export default {
  name: 'customInput',
  props: {
    pagination: Object,
    color: String,
  },
  emits: ['update:pageValue'],
  setup(props, { emit }) {
    const paginationModel = computed({
      get() {
        return props.pagination
      },
    })
    return { paginationModel }
  },
  computed: {
    pageChange() {
      return this.paginationModel.page
    },
  },
  watch: {
    pageChange: {
      handler: function (newVal) {
        this.paginationModel.page = newVal
        const query = this.getPagingPathParams(this.paginationModel)
        this.$router.push({
          path: this.$route.fullPath,
          query,
        })
      },
    },
  },
  methods: {
    getPagingPathParams(pagination) {
      return {
        sb: pagination.sortBy,
        d: pagination.descending ? '1' : '',
        p: pagination.page,
        r: pagination.rowsPerPage,
      }
    },
  },
}
</script>

<style scoped></style>
