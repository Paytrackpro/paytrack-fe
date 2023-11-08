<template>
  <div class="q-pa-sm">
    <q-card flat class="q-pb-md content-container">
      <q-card-section class="card-header q-pa-sm">
        <div class="row">
          <p class="text-size-20 text-weight-medium">Store List</p>
        </div>
      </q-card-section>
      <q-card-section class="q-pa-sm">
        <div class="row">
          <q-list bordered class="col-12">
            <div class="row">
              <q-item
                v-for="store in storeList"
                :key="store.ownerId"
                class="q-my-sm col-6 col-sm-4 col-lg-3"
                clickable
                v-ripple
                @click="toStoreProductList(store.ownerId)"
              >
                <q-item-section avatar>
                  <q-avatar color="primary" text-color="white">
                    {{ store.ownerName.toUpperCase().charAt(0) }}
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ store.ownerName }}</q-item-label>
                  <q-item-label caption lines="1">{{ store.count }} Products</q-item-label>
                </q-item-section>

                <q-item-section side>
                  <q-icon name="navigate_next" color="green" />
                </q-item-section>
              </q-item>
            </div>
          </q-list>
        </div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'storeList',
  data() {
    return {
      storeList: [],
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    fetchData() {
      this.loading = true
      this.$api
        .get(`/shop/product/store-list`)
        .then((data) => {
          this.storeList = data
        })
        .catch((err) => {
          console.log(err)
        })
    },
    back() {
      this.$router.push({ path: `home` })
    },
    toStoreProductList(ownerId) {
      this.$router.push({ path: `/stores/${ownerId}` })
    },
  },
  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
  },
}
</script>

<style scoped></style>
