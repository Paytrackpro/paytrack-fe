<template>
  <q-form @submit="submit">
    <div class="row q-mb-md q-col-gutter-md profile-padding">
      <div class="col-4">
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
          hide-bottom-space
          v-model="sender.value"
          placeholder="Sender"
        />
      </div>
      <div class="col-6">
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
          hide-bottom-space
          v-model="approver.value"
          placeholder="Separate with comma(,)"
        />
      </div>
      <div class="col-2">
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
        flat
        bordered
      >
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
      loading: false,
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
        })
        .catch(() => {
          this.sender.status = DESTINATION_CHECK_FAIL
          this.sender.error = 'the user name is not found'
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
        })
        .catch((err) => {
          this.approver.status = DESTINATION_CHECK_FAIL
          this.approver.error = err.message || 'the user name is not found'
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
      this.loading = true
      let list = []

      if (this.rows) {
        list = this.rows
          .filter((item) => item.sendUserId != this.sender.id)
          .map((item) => {
            return {
              sendUserId: item.sendUserId,
              approverIds: item.approvers.map((item) => item.approverId),
            }
          })
      }
      list.push({
        sendUserId: this.sender.id,
        approverIds: this.approver.ids,
      })
      const data = {
        list,
      }
      this.save(data)
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
