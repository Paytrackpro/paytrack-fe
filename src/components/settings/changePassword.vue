<template>
  <q-dialog no-backdrop-dismiss no-esc-dismiss>
    <q-card style="width: 400px">
      <q-form @submit="onSubmit">
        <q-card-section class="q-pa-lg">
          <div class="text-h6">Change your password</div>
          <q-input-pw
            class="q-mt-md"
            v-model="form.oldPassword"
            :autofocus="true"
            hint="Old Password"
            :rules="[(val) => !!val || 'Old password is required']"
          />
          <q-input-pw
            class="q-mt-md"
            v-model="form.password"
            :autofocus="true"
            hint="Password"
            :rules="[(val) => !!val || 'Password is required']"
          />
          <q-input
            class="q-mt-md"
            v-if="isOtp"
            v-model="form.otp"
            type="text"
            hint="OTP"
            :rules="[(val) => !!val || 'OTP is required']"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-pa-lg">
          <q-btn label="Confirm" color="primary" type="submit" :loading="loading" :disable="loading" />
          <q-btn
            label="Cancel"
            text-color="black"
            color="white"
            type="button"
            @click="cancel"
            :loading="loading"
            :disable="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import QInputPw from 'components/common/qInputPw'
import { responseError } from 'src/helper/error'
export default {
  name: 'changePassword',
  components: {
    QInputPw,
  },
  props: {
    isOtp: Boolean,
  },
  data() {
    return {
      loading: false,
      form: {
        oldPassword: '',
        password: '',
        otp: '',
      },
    }
  },
  methods: {
    cancel() {
      this.form = {
        oldPassword: '',
        password: '',
        otp: '',
      }
      this.$emit('update:modelValue', false)
    },
    onSubmit() {
      this.loading = true
      this.$api
        .put('/user/change-password', this.form)
        .then((data) => {
          this.$q.notify({
            message: 'Your password is updated',
            color: 'positive',
            icon: 'check',
          })
          this.cancel()
        })
        .catch((err) => {
          responseError(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
  },
}
</script>

<style scoped></style>
