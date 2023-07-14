<template>
  <q-form @submit="submit">
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-10 q-mx-sm">
        <p class="text-weight-medium q-mt-none title-case">User name</p>
        <div class="q-mt-none">
          <span class="text-grey-4">{{ user.userName }}</span>
        </div>
      </div>
      <div class="col-12">
        <div class="row">
          <div class="col-12 col-sm-6 col-lg-3">
            <custom-input
              class="q-mt-md q-px-sm"
              :label="'Display name'"
              v-model="user.displayName"
              :placeholder="'Your display name'"
            />
          </div>
        </div>
      </div>
      <div class="col-12">
        <div class="row">
          <div class="col-12 col-sm-6 col-lg-3">
            <custom-input
              class="q-mt-md q-px-sm"
              :label="'Email'"
              v-model="user.email"
              :placeholder="'Email'"
              :rules="[(val, rules) => !val || (val && rules.email(val)) || 'Please enter a valid email address']"
            />
          </div>
        </div>
      </div>
    </div>
    <div class="q-mt-lg">
      <q-btn label="Save" class="q-mr-xs btn-animated btn" :disable="loading" type="submit" color="primary" />
    </div>
  </q-form>
</template>

<script>
import { mapActions } from 'vuex'
import customInput from '../common/custom_input.vue'
export default {
  data() {
    return {
      user: {},
      loading: false,
    }
  },
  components: {
    customInput,
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
