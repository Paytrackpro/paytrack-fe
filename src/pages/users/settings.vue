<template>
  <q-card class="q-pa-md q-ma-lg content-container">
    <q-card-section class="q-py-none">
      <q-tabs align="left" v-model="tab" inline-label active-class="tab-active">
        <q-tab label="Profile" icon="badge" name="profile" no-caps class="tab-item" />
        <q-tab label="Payment Methods" icon="credit_card" name="payment_method" no-caps class="tab-item" />
        <q-tab label="Invoice" icon="receipt_long" name="invoice" no-caps class="tab-item" />
        <q-tab label="Security" icon="security" name="security" no-caps class="tab-item" />
        <q-tab label="Projects" icon="fact_check" name="project" no-caps class="tab-item" />
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
        <q-tab-panel class="q-px-none" name="invoice">
          <invoice-form v-model="user" />
        </q-tab-panel>
        <q-tab-panel class="q-px-none" name="security">
          <security-form v-model="user" />
        </q-tab-panel>
        <q-tab-panel class="q-px-none" name="project">
          <project-form v-model="user" :projectId="projectId" />
        </q-tab-panel>
      </q-tab-panels>
    </q-card-section>
  </q-card>
</template>

<script>
import { mapActions } from 'vuex'
import { ProfileForm, PaymentMethods, SecurityForm, InvoiceForm, ProjectForm } from 'components/settings'
export default {
  name: 'userProfile',
  components: {
    ProfileForm,
    PaymentMethods,
    SecurityForm,
    InvoiceForm,
    ProjectForm,
  },
  data() {
    return {
      tab: 'profile',
      loading: false,
      user: {},
      projectId: 0,
    }
  },
  methods: {
    ...mapActions({
      getUser: 'user/getUser',
    }),
  },
  async created() {
    this.loading = true
    const user = await this.getUser()
    if (user) {
      this.user = user
      this.loading = false
    }
    const currentTab = this.$route.params.settingTab
    if (currentTab) {
      this.tab = currentTab
      if (currentTab == 'project' && this.$route.params.project) {
        this.projectId = Number(this.$route.params.project)
      }
    } else {
      this.$router.push({ path: '/settings/profile' })
    }
  },
  watch: {
    tab(value) {
      if (value) {
        this.$router.push({ path: '/settings/' + value })
      }
    },
  },
}
</script>
<style scoped></style>
