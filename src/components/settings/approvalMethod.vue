<template>
  <q-form @submit="submit">
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-12 col-sm-4 col-lg-4">
        <p class="q-mt-none q-mb-xs text-weight-medium col-4">Sender</p>
        <q-input
          outlined
          dense
          lazy-rules
          stack-label
          @blur="checkValidSender"
          :rules="[(val) => !!val || 'Sender is required']"
          :error="senderError"
          :error-message="sender.error"
          @focus="senderFocus = true"
          hide-bottom-space
          v-model="sender.value"
          placeholder="Sender"
        />
      </div>
      <div class="col-12 col-sm-6 col-lg-4">
        <p class="q-mt-none q-mb-xs text-weight-medium col-4">Approver Users</p>
        <q-input
          outlined
          dense
          lazy-rules
          stack-label
          @blur="checkValidApprovers"
          :rules="[(val) => !!val || 'Approvers is required']"
          :error="approverError"
          :error-message="approver.error"
          @focus="approverFocus = true"
          hide-bottom-space
          v-model="approver.value"
          placeholder="Separate with comma(,)"
        />
      </div>
      <div class="col-8 col-sm-10 col-lg-2">
        <q-checkbox v-model="showCost" class="q-mr-xs q-mt-lg" label="Show Cost" />
      </div>
      <div class="col-4 col-sm-2 col-lg-2">
        <q-btn
          label="Save"
          class="q-mr-xs q-mt-lg"
          :disable="loading"
          style="height: 40px"
          type="submit"
          color="primary"
        />
      </div>
    </div>
    <div class="q-mt-md">
      <q-table
        title="Approver Settings List"
        :loading="loading"
        :rows="rows"
        :columns="columns"
        row-key="name"
        v-model:pagination="pagination"
        :hide-pagination="pagination.rowsNumber < 10"
        flat
        bordered
      >
        <template v-slot:body-cell-showCost="props">
          <q-td :props="props">
            <q-checkbox :props="props" v-model="props.row.showCost" @click="updateShowCost(props)" />
          </q-td>
        </template>
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn :props="props" dense round flat color="grey" @click="editRow(props)" icon="edit"></q-btn>
            <q-btn :props="props" dense round flat color="grey" @click="deleteRow(props)" icon="delete"></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
  </q-form>
</template>

<script>
import {
  DESTINATION_CHECK_NONE,
  DESTINATION_CHECK_DONE,
  DESTINATION_CHECK_CHECKING,
  DESTINATION_CHECK_FAIL,
} from 'src/consts/common'
import { defaultPaging } from 'src/helper/paging'
import { responseError } from 'src/helper/error'
import { mapActions } from 'vuex'

export default {
  data() {
    return {
      user: {},
      sender: {
        id: 0,
        value: '',
        status: DESTINATION_CHECK_NONE,
        error: '',
      },
      approver: {
        ids: [],
        value: '',
        status: DESTINATION_CHECK_NONE,
        error: '',
      },
      showCost: false,
      loading: false,
      senderFocus: false,
      approverFocus: false,
      pagination: {
        ...defaultPaging,
      },
      columns: [
        {
          name: 'sendUserName',
          required: true,
          label: 'Sender',
          align: 'center',
          field: (row) => {
            return row.sendUserName
          },
          format: (val) => {
            return val
          },
        },
        {
          name: 'Approvers',
          align: 'center',
          label: 'Approvers',
          field: (row) => {
            return row.approvers.map((item) => item.approverName).join(', ')
          },
          format: (val) => {
            return val
          },
        },
        {
          name: 'showCost',
          align: 'center',
          label: 'Show cost',
          field: (row) => {
            return row.approvers.map((item) => item.showCost).join(', ')
          },
          format: (val) => {
            return val
          },
        },
        {
          name: 'action',
          align: 'center',
          label: 'Action',
          field: '',
        },
      ],
      rows: [],
    }
  },
  name: 'approverMethod',
  props: {
    modelValue: Object,
  },
  emits: ['update:modelValue'],
  watch: {
    modelValue(val) {
      this.user = { ...val }
    },
  },
  methods: {
    checkValidSender() {
      this.sender.status = DESTINATION_CHECK_CHECKING
      this.$api
        .get(`/user/exist-checking?userName=${this.sender.value}`)
        .then((data) => {
          if (data.found) {
            this.sender.status = DESTINATION_CHECK_DONE
            this.sender.id = data.id
          } else {
            this.sender.status = DESTINATION_CHECK_FAIL
            this.sender.error = data.message
          }
          this.senderFocus = false
        })
        .catch(() => {
          this.sender.status = DESTINATION_CHECK_FAIL
          this.sender.error = 'the user name is not found'
          this.senderFocus = false
        })
    },
    checkValidSenderSubmit() {
      this.$api
        .get(`/user/exist-checking?userName=${this.sender.value}`)
        .then((data) => {
          if (data.found) {
            this.sender.status = DESTINATION_CHECK_DONE
            this.sender.id = data.id
            this.submitHandler()
          } else {
            return
          }
        })
        .catch((err) => {
          return
        })
    },
    checkValidApprovers() {
      this.approver.status = DESTINATION_CHECK_CHECKING
      const value = this.approver.value.replace(/,\s*$/, '')
      this.approver.value = value
      this.$api
        .get(`/user/exists?userNames=${value}`)
        .then((data) => {
          if (data && data.length) {
            this.approver.status = DESTINATION_CHECK_DONE
            this.approver.ids = data.map((item) => item.id)
          } else {
            this.approver.status = DESTINATION_CHECK_FAIL
            this.approver.error = data.message
          }
          this.approverFocus = false
        })
        .catch((err) => {
          this.approver.status = DESTINATION_CHECK_FAIL
          this.approver.error = err.message || 'the user name is not found'
          this.approverFocus = false
        })
    },
    checkValidApproversSubmit() {
      const value = this.approver.value.replace(/,\s*$/, '')
      this.approver.value = value
      this.$api
        .get(`/user/exists?userNames=${value}`)
        .then((data) => {
          if (data && data.length) {
            this.approver.status = DESTINATION_CHECK_DONE
            this.approver.ids = data.map((item) => item.id)
            this.submitHandler()
          } else {
            return
          }
        })
        .catch((err) => {
          return
        })
    },
    getList() {
      this.loading = true
      this.$api
        .get('/user/setting/payment', {})
        .then((res) => {
          this.loading = false
          this.rows = res
          this.pagination.rowsNumber = res.length
        })
        .catch((err) => {
          responseError(err)
          this.loading = false
        })
    },
    async submit() {
      if (!this.checkDestinationDone()) {
        if (this.senderFocus) {
          this.checkValidSenderSubmit()
        }
        if (this.approverFocus) {
          this.checkValidApproversSubmit()
        }
        return
      }
      this.submitHandler()
    },
    submitHandler() {
      this.loading = true
      let list = []
      if (this.rows) {
        list = this.rows
          .filter((item) => item.sendUserId != this.sender.id)
          .map((item) => {
            return {
              sendUserId: item.sendUserId,
              approverIds: item.approvers.map((item) => item.approverId),
              showCost: item.showCost,
            }
          })
      }
      list.push({
        sendUserId: this.sender.id,
        approverIds: this.approver.ids,
        showCost: this.showCost,
      })
      const data = {
        list,
      }
      this.save(data)
      this.showCost = false
    },
    editRow(row) {
      const data = row.row
      this.sender = {
        id: data.sendUserId,
        value: data.sendUserName,
        status: DESTINATION_CHECK_DONE,
      }
      this.approver = {
        ids: data.approvers.map((item) => item.approverId),
        value: data.approvers.map((item) => item.approverName).join(','),
        status: DESTINATION_CHECK_DONE,
        error: '',
      }
      this.showCost = data.showCost
    },
    deleteRow(row) {
      if (confirm('Are you sure to remove this?')) {
        let list = []
        if (this.rows) {
          list = this.rows
            .filter((item) => item.sendUserId != row.row.sendUserId)
            .map((item) => {
              return {
                sendUserId: item.sendUserId,
                approverIds: item.approvers.map((item) => item.approverId),
                showCost: item.showCost,
              }
            })
        }
        const data = {
          list,
        }
        this.save(data)
      }
    },
    save(data) {
      this.$api
        .put('user/setting/payment', data)
        .then((res) => {
          this.getList()
        })
        .catch((err) => {
          responseError(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    checkDestinationDone: function () {
      return (
        !this.senderFocus &&
        !this.approverFocus &&
        this.sender.status === DESTINATION_CHECK_DONE &&
        this.approver.status === DESTINATION_CHECK_DONE
      )
    },
    updateShowCost(props) {
      let list = []
      if (this.rows) {
        list = this.rows.map((item) => {
          return {
            sendUserId: item.sendUserId,
            approverIds: item.approvers.map((item) => item.approverId),
            showCost: item.showCost,
          }
        })
      }
      const data = {
        list,
      }
      this.save(data)
    },
  },

  computed: {
    senderError: function () {
      return this.sender.status === DESTINATION_CHECK_FAIL
    },
    approverError: function () {
      return this.approver.status === DESTINATION_CHECK_FAIL
    },
  },
  created() {
    this.getList()
    this.user = { ...this.modelValue }
  },
}
</script>

<style scoped></style>
