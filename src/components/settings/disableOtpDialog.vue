<template>
  <q-dialog no-backdrop-dismiss no-esc-dismiss @before-hide="clearForm">
    <q-card>
      <q-form @submit="onSubmit">
        <q-card-section>
          <div class="text-h6">
            Please confirm your OTP to disable this function
          </div>
          <q-input
            v-model="password"
            :autofocus="true"
            :type="pwdVisibility ? 'password' : 'text'"
            hint="Password"
            :rules="[(val) => !!val || 'password is required']"
          >
            <template v-slot:append>
              <q-icon
                :name="pwdVisibility ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="pwdVisibility = !pwdVisibility"
              />
            </template>
          </q-input>
          <q-input
            v-model="otp"
            type="text"
            hint="OTP"
            :rules="[(val) => !!val || 'OTP is required']"
          />
        </q-card-section>

        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancel"
            color="primary"
            type="button"
            @click="cancel"
          />
          <q-btn
            flat
            label="Confirm"
            color="primary"
            type="submit"
            :loading="loading"
            :disable="loading"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script>
import { mapActions, mapMutations } from "vuex";

export default {
  name: "DisableOtpDialog",
  props: {
    dialog: Boolean,
    hideDialog: Function,
  },
  data: () => ({
    password: "",
    otp: "",
    pwdVisibility: true,
    loading: false,
  }),
  methods: {
    ...mapActions({
      disableOtp: "user/disableOtp",
    }),
    ...mapMutations({
      updateUser: "auth/setUser",
    }),
    async onSubmit() {
      this.loading = true;
      const ok = await this.disableOtp({
        password: this.password,
        otp: this.otp,
      });
      this.loading = false;
      if (!ok) {
        return;
      }
      this.updateUser({ ...this.user, otp: false });
      this.$emit("hideDialog");
    },
    cancel() {
      this.$emit("hideDialog");
    },
    clearForm() {
      this.password = "";
      this.otp = "";
    },
  },
};
</script>
