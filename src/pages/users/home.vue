<template>
  <div class="row">
    <div class="col-12">
      <div class="q-py-lg q-px-md">
        <span class="text-info text-h3">{{
          user.displayName || user.userName
        }}</span>
      </div>
    </div>
    <div class="col-12">
      <q-card class="q-pa-md q-mt-lg home-card">
        <div class="row">
          <div class="col-lg-4 col-md-6 col-sm-12 q-py-lg">
            <router-link class="event-txt" to="/settings">
              <span class="text-info home-title-number">1</span>
              <span class="text-black text-bold"> Verify settings</span>
            </router-link>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-12 q-py-lg">
            <router-link class="event-txt" to="/get-paid/create">
              <span class="text-info home-title-number">2</span>
              <span class="text-black text-bold"> Get paid</span>
            </router-link>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-12 q-py-lg">
            <router-link class="event-txt" to="/pay">
              <span class="text-info home-title-number">3</span>
              <span class="text-black text-bold"> Pay</span>
            </router-link>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
export default {
  name: "userHome",
  data() {
    return {};
  },
  computed: {
    ...mapGetters({
      user: "user/getUser",
    }),
  },
};
</script>

<style>
.home-card {
  border-radius: 40px;
  padding: 40px;
}
.home-img {
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 50%;
}
.home-title-number {
  border: 1px solid #bcbcbc;
  border-radius: 50%;
  padding: 8px 12px;
  width: 100%;
  height: 100%;
}
</style>
