<template>
  <q-layout>
    <q-page-container>
      <q-page>
        <div v-bind:style="{ maxWidth: '28rem' }" class="flex flex-center q-mx-auto">
          <div class="column justify-center q-pa-xl col-grow">
            <div class="flex items-center q-mb-md q-gutter-sm text-grey-7">
              <img v-bind:style="{ height: '2em' }" src="~assets/team_raedah.svg" />
              <span class="text-bold">MGMT</span>
            </div>
            <q-card class="col" flat bordered>
              <q-card-section class="q-pa-lg">
                <q-form class="q-gutter-y-md">
                  <q-input
                    filled
                    v-model="username"
                    label="Username"
                    placeholder="Your user name"
                    lazy-rules
                    stack-label
                  />
                  <q-input
                    type="password"
                    filled
                    v-model="password"
                    label="Password"
                    placeholder="Password"
                    lazy-rules
                    stack-label
                  />
                  <q-btn label="Sign in" to="/" type="button" color="primary" class="full-width" />
                </q-form>
              </q-card-section>
            </q-card>
            <div class="text-center text-grey-6 q-mt-md">
              Don't have account yet? <a class="link text-light-blue-6" href="/apply">Apply now</a>
            </div>
          </div>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script>
import { defineComponent } from "vue"
import { ref } from "vue"

export default defineComponent({
  setup() {
    return {
      username: ref(""),
      password: ref(""),
    }
  },
})
</script>

<style lang="scss">
  .link {
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
</style>
