<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div class="position-relative">
          <img
            class="absolute q-ma-md"
            v-bind:style="{ height: '2em' }"
            src="~assets/team_raedah.svg"
          />
          <div
            v-bind:style="{ maxWidth: '28rem' }"
            class="flex flex-center q-mx-auto window-height"
          >
            <div class="column justify-center q-pa-xl col-grow">
              <div class="flex items-center q-mb-md q-gutter-sm text-grey-7">
                <span class="text-bold">Create Account</span>
              </div>
              <q-card class="col" flat bordered>
                <q-card-section class="q-pa-lg">
                  <q-form class="q-gutter-y-md" @submit="register">
                    <div>
                      <p class="q-mt-none q-mb-xs text-weight-medium">
                        Username
                      </p>
                      <q-input
                        v-model="username"
                        placeholder="Your username"
                        outlined
                        dense
                        lazy-rules
                        stack-label
                        :rules="[
                          (val) =>
                            (val && val.length > 0) ||
                            'Please enter your username',
                        ]"
                        hide-bottom-space
                      >
                      </q-input>
                    </div>
                    <div>
                      <p class="q-mt-none q-mb-xs text-weight-medium">Email</p>
                      <q-input
                        v-model="email"
                        placeholder="Your email (optional)"
                        outlined
                        dense
                        lazy-rules
                        stack-label
                        :rules="[
                          (val, rules) =>
                            !val ||
                            (val && rules.email(val)) ||
                            'Please enter a valid email address',
                        ]"
                        hide-bottom-space
                      >
                      </q-input>
                    </div>
                    <div>
                      <p class="q-mt-none q-mb-xs text-weight-medium">
                        Password
                      </p>
                      <q-input
                        :type="isPwd ? 'password' : 'text'"
                        v-model="password"
                        outlined
                        dense
                        placeholder="Password"
                        lazy-rules
                        stack-label
                        :rules="[
                          (val) =>
                            (val && val.length >= 6) ||
                            'Please use a valid password',
                        ]"
                        hide-bottom-space
                      >
                        <template v-slot:append>
                          <q-icon
                            v-if="password && password.length > 0"
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd"
                          />
                        </template>
                      </q-input>
                    </div>
                    <div>
                      <p class="q-mt-none q-mb-xs text-weight-medium">
                        Password Confirmation
                      </p>
                      <q-input
                        :type="isPwd ? 'password' : 'text'"
                        v-model="passwordCfm"
                        outlined
                        dense
                        placeholder="Password confirmation"
                        lazy-rules
                        stack-label
                        :rules="[
                          (val) =>
                            !val ||
                            (val && val === this.password) ||
                            'Password confirmation does not match',
                        ]"
                        hide-bottom-space
                      >
                        <template v-slot:append>
                          <q-icon
                            v-if="passwordCfm && passwordCfm.length > 0"
                            :name="isPwd ? 'visibility_off' : 'visibility'"
                            class="cursor-pointer"
                            @click="isPwd = !isPwd"
                          />
                        </template>
                      </q-input>
                    </div>
                    <p v-if="error" class="q-mb-none text-red">{{ error }}</p>
                    <q-btn
                      label="Create"
                      type="submit"
                      color="primary"
                      class="full-width"
                      :loading="loading"
                    />
                  </q-form>
                </q-card-section>
              </q-card>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
export default {
  name: "pageRegister",
  data() {
    return {
      username: "",
      email: "",
      password: "",
      passwordCfm: "",
      isPwd: true,
      loading: false,
      error: null,
    };
  },
  methods: {
    register() {
      this.$store
        .dispatch("user/register", {
          username: this.username,
          password: this.password,
          ...(this.email && { email: this.email }),
        })
        .then(() => {
          this.$q.notify({
            message:
              "Your account was created. You will now be redirected to the login page.",
            color: "positive",
            icon: "check",
          });
          this.$router.push({ path: "/login" });
        })
        .catch((error) => {
          this.error = error.response
            ? error.response.data.message
            : error.message;
        });
    },
  },
};
</script>
