<template>
  <div class="row">
    <div class="col-12">
      <div class="q-py-lg">
        <span class="text-info text-h3"><{{user.displayName || user.userName}}></span>
      </div>
    </div>
    <div class="col-12">
      <span class="text-h3">Get Started:</span>
      <q-card class="q-pa-md q-mt-lg home-card">
        <div class="row">
          <div class="col-lg-4 col-md-6 col-sm-12">
            <div>
              <router-link class="event-txt" to="/profile">
                <span class="text-info home-title-number">1</span> <span class="text-black"> Setup your</span> <span class="text-shadow"> profile</span>
              </router-link>
              <div class="q-gutter-md row items-start">
                <img class="home-img"
                  src="~assets/home_user_info.png"
                />
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-12">
            <router-link class="event-txt" to="/pay/create">
              <span class="text-info home-title-number">2</span> <span class="text-black"> Invite your</span> <span class="text-shadow"> recipients</span>
            </router-link>
            <div class="q-gutter-md row items-start">
              <img class="home-img"
                   src="~assets/home_invite.png"
              />
            </div>
          </div>
          <div class="col-lg-4 col-md-6 col-sm-12">
            <router-link class="event-txt" to="/get-pay/create">
              <span class="text-info home-title-number">3</span> <span class="text-shadow"> Create</span> <span class="text-black"> invoices</span>
            </router-link>
            <div class="q-gutter-md row items-start">
              <img class="home-img"
                   src="~assets/home_invoice.png"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data() {
    return {}
  },
  computed: {
    ...mapGetters({
      user: "auth/getUser",
    }),
  }
}
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
  border: 1px solid #BCBCBC;
  border-radius: 50%;
  padding: 8px 12px;
  width: 100%;
  height: 100%;
}
</style>
