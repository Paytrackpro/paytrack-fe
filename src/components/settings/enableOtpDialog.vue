<template>
  <q-dialog no-backdrop-dismiss no-esc-dismiss @before-hide="clearForm">
    <q-card>
      <q-form @submit="onSubmit">
        <q-card-section class="q-pt-lg q-px-lg">
          <div class="text-h6">Please confirm your password to active two-factor authentication</div>
          <q-input
            :autofocus="true"
            outlined
            v-model="password"
            :type="pwdVisibility ? 'password' : 'text'"
            :rules="[(val) => !!val || 'Password is required']"
            class="q-mt-lg"
          >
            <template v-slot:append>
              <q-icon
                :name="pwdVisibility ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="pwdVisibility = !pwdVisibility"
              />
            </template>
          </q-input>
        </q-card-section>

        <q-card-actions align="right" class="q-px-lg q-pb-lg">
          <q-btn label="Confirm" color="primary" type="submit" :loading="loading" :disable="loading" />
          <q-btn label="Cancel" text-color="black" color="white" type="button" @click="cancel" />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'EnableOtpDialog',
  props: {
    dialog: Boolean,
    hideDialog: Function,
  },
  data() {
    return {
      password: '',
      pwdVisibility: true,
      loading: false,
    }
  },
  methods: {
    ...mapActions({
      enableOtp: 'user/enableOtp',
    }),
    async onSubmit() {
      this.loading = true
      const ok = await this.enableOtp({ password: this.password })
      this.loading = false
      this.$emit('hideDialog', ok)
    },
    cancel() {
      this.$emit('hideDialog', false)
    },
    clearForm() {
      this.password = ''
    },
  },
}
</script>
