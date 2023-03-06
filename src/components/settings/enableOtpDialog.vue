<template>
  <q-dialog no-backdrop-dismiss no-esc-dismiss @before-hide="clearForm">
    <q-card>
      <q-form @submit="onSubmit">
        <q-card-section>
          <div class="text-h6">
            Please confirm your password to active two-factor authentication
          </div>
          <q-input
            :autofocus="true"
            v-model="password"
            :type="pwdVisibility ? 'password' : 'text'"
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
import { mapActions } from "vuex";

export default {
  name: "EnableOtpDialog",
  props: {
    dialog: Boolean,
    hideDialog: Function,
  },
  data() {
    return {
      password: "",
      pwdVisibility: true,
      loading: false,
    };
  },
  methods: {
    ...mapActions({
      enableOtp: "user/enableOtp",
    }),
    async onSubmit() {
      this.loading = true;
      const ok = await this.enableOtp({ password: this.password });
      this.loading = false;
      ok && this.$emit("hideDialog");
    },
    cancel() {
      this.$emit("hideDialog");
    },
    clearForm() {
      this.password = "";
    },
  },
};
</script>
