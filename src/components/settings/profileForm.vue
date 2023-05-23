<template>
  <q-form @submit="submit">
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-12 col-sm-6 col-lg-3">
        <p class="text-weight-medium q-mt-none title-case">User name</p>
        <div class="q-mt-none">
          <span class="text-grey-5">{{ user.userName }}</span>
        </div>
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <p class="q-mt-none q-mb-xs text-weight-medium col-4 title-case">Display name</p>
        <q-input
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          v-model="user.displayName"
          placeholder="Your display name"
        />
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <p class="q-mt-none q-mb-xs text-weight-medium col-4">Email</p>
        <q-input
          outlined
          dense
          lazy-rules
          stack-label
          hide-bottom-space
          v-model="user.email"
          placeholder="Email"
          :rules="[(val, rules) => !val || (val && rules.email(val)) || 'Please enter a valid email address']"
        />
      </div>
    </div>
    <q-separator />
    <div class="q-mt-md">
      <q-btn label="Save" class="q-mr-xs" :disable="loading" type="submit" color="primary" />
    </div>
  </q-form>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      user: {},
      loading: false,
    }
  },
  name: 'profileForm',
  props: {
    modelValue: Object,
  },
  emits: ['update:modelValue'],
  watch: {
    modelValue(val) {
      this.user = { ...val }
    },
  },
  methods: {
    ...mapActions({
      updateUser: 'user/updateUser',
    }),
    async submit() {
      this.loading = true
      const newUser = await this.updateUser(this.user)
      if (newUser) {
        this.$emit('update:modelValue', newUser)
      }
      this.loading = false
    },
  },
  created() {
    this.user = { ...this.modelValue }
  },
}
</script>

<style scoped></style>
