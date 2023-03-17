<template>
  <q-card class="q-px-lg">
    <q-card-section class="q-py-none">
      <q-tabs align="left" v-model="tab">
        <q-tab label="Profile" name="profile" />
        <q-tab label="Payment methods" name="payment_method" />
        <q-tab label="Security" name="security" />
        <q-tab label="Approval Settings" name="approval" />
      </q-tabs>
      <q-separator />
    </q-card-section>
    <q-card-section>
      <q-skeleton v-if="loading" height="150px" />
      <q-tab-panels
        v-else
        class="q-mx-none"
        v-model="tab"
        animated
        swipeable
        vertical
        transition-prev="jump-up"
        transition-next="jump-down"
      >
        <q-tab-panel class="q-px-none" name="profile">
          <profile-form v-model="user" />
        </q-tab-panel>
        <q-tab-panel class="q-px-none" name="payment_method">
          <payment-methods v-model="user" />
        </q-tab-panel>
        <q-tab-panel class="q-px-none" name="security">
          <security-form v-model="user" />
        </q-tab-panel>
        <q-tab-panel class="q-px-none" name="approval">
          <approval-method v-model="user" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapActions } from "vuex";
import {
  ProfileForm,
  PaymentMethods,
  SecurityForm,
  ApprovalMethod,
} from "components/settings";
export default {
  name: "userProfile",
  components: {
    ProfileForm,
    PaymentMethods,
    SecurityForm,
    ApprovalMethod,
  },
  data() {
    return {
      tab: "profile",
      loading: false,
      user: {},
    };
  },
  methods: {
    ...mapActions({
      getUser: "user/getUser",
    }),
  },
  async created() {
    this.loading = true;
    const user = await this.getUser();
    if (user) {
      this.user = user;
      this.loading = false;
    }
  },
};
</script>
<style scoped></style>
