<template>
  <q-form @submit="submit">
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-12">
        <PaymentSetting v-model="user.paymentSettings" />
      </div>
    </div>
    <q-separator />
    <div class="q-mt-md">
      <q-btn
        label="Save"
        class="q-mr-xs"
        :disable="loading"
        type="submit"
        color="primary"
      />
    </div>
  </q-form>
</template>

<script>
import { mapActions } from "vuex";
import PaymentSetting from "components/payment/paymentSetting";

export default {
  name: "paymentMethods",
  components: {
    PaymentSetting,
  },
  props: {
    modelValue: Object,
  },
  data() {
    return {
      user: {},
      loading: false,
    };
  },
  emits: ["update:modelValue"],
  watch: {
    modelValue: {
      immediate: true,
      handler(newVal) {
        this.user = { ...newVal };
      },
    },
  },
  methods: {
    ...mapActions({
      updateUser: "user/updateUser",
    }),
    async submit() {
      this.loading = true;
      const newUser = await this.updateUser(this.user);
      if (newUser) {
        this.$emit("update:modelValue", newUser);
      }
      this.loading = false;
    },
  },
};
</script>

<style scoped></style>
