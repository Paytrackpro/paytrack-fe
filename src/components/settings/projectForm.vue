<template>
  <q-form @submit="submit">
    <div class="row">
      <q-card class="col-12 col-sm-8 q-px-lg q-pb-lg shadow-primary">
        <div class="q-table__title title-case">Add Project</div>
        <div class="row q-mt-sm q-col-gutter-md profile-padding">
          <div class="col-12 col-sm-6">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Project Name</p>
            <q-input
              outlined
              dense
              lazy-rules
              stack-label
              :rules="[(val) => !!val || 'Project name is required']"
              hide-bottom-space
              v-model="project.name"
              placeholder="Project Name"
            />
          </div>
          <div class="col-12 col-sm-6">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Client</p>
            <q-input
              outlined
              dense
              lazy-rules
              stack-label
              hide-bottom-space
              v-model="project.client"
              placeholder="Client"
            />
          </div>
          <div class="col-12 col-sm-6">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Members</p>
            <q-input
              outlined
              dense
              lazy-rules
              stack-label
              @blur="checkValidMemberIds"
              :error="memberInputError"
              :error-message="project.error"
              @focus="memberFocus = true"
              hide-bottom-space
              v-model="project.membersInput"
              placeholder="Separate with comma(,)"
            />
          </div>
          <div class="col-12 col-sm-6">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Proposal Token</p>
            <q-input
              outlined
              dense
              lazy-rules
              stack-label
              hide-bottom-space
              v-model="project.proposalToken"
              placeholder="Proposal Token"
            />
          </div>
        </div>
        <div class="row q-col-gutter-md profile-padding">
          <div class="col-12">
            <div class="row justify-between">
              <div></div>
              <q-btn
                label="Create Project"
                class="q-mr-xs q-mt-lg"
                :disable="loading"
                style="height: 40px"
                type="submit"
                color="primary"
              />
            </div>
          </div>
        </div>
      </q-card>
    </div>
    <div class="q-mt-md">
      <q-table
        title="Project List"
        :loading="loading"
        :rows="rows"
        :columns="columns"
        row-key="name"
        class="shadow-6"
        v-model:pagination="pagination"
        :hide-pagination="pagination.rowsNumber < 10"
        flat
        separator="none"
      >
      </q-table>
    </div>
  </q-form>
</template>

<script>
import { defaultPaging } from 'src/helper/paging'
import { responseError } from 'src/helper/error'
import {
  DESTINATION_CHECK_NONE,
  DESTINATION_CHECK_DONE,
  DESTINATION_CHECK_CHECKING,
  DESTINATION_CHECK_FAIL,
} from 'src/consts/common'

export default {
  data() {
    return {
      user: {},
      project: {
        name: '',
        client: '',
        members: [],
        membersInput: '',
        proposalToken: '',
        error: '',
        status: DESTINATION_CHECK_NONE,
      },
      memberFocus: false,
      loading: false,
      pagination: {
        ...defaultPaging,
      },
      columns: [
        {
          name: 'projectName',
          required: true,
          label: 'Project Name',
          align: 'center',
          field: (row) => {
            return row.projectName
          },
          format: (val) => {
            return val
          },
        },
        {
          name: 'client',
          required: true,
          label: 'Client',
          align: 'center',
          field: (row) => {
            return row.client
          },
        },
        {
          name: 'members',
          align: 'center',
          label: 'Members',
          field: (row) => {
            if (row.members && row.members.length > 0) {
              return row.members.map((item) => item.userName).join(',')
            } else {
              return ''
            }
          },
        },
        {
          name: 'proposalToken',
          align: 'center',
          label: 'Proposal Token',
          field: (row) => {
            return row.proposalToken
          },
        },
      ],
      rows: [],
    }
  },
  name: 'projectForm',
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
    checkValidMemberIds() {
      if (this.project.membersInput == '') {
        this.project.error = ''
        this.project.status = DESTINATION_CHECK_DONE
        return
      }
      this.project.status = DESTINATION_CHECK_CHECKING
      const value = this.project.membersInput.replace(/,\s*$/, '')
      this.project.membersInput = value
      this.$api
        .get(`/user/member-exist?userNames=${value}`)
        .then((data) => {
          if (data && data.length) {
            this.project.status = DESTINATION_CHECK_DONE
            this.project.members = []
            data.forEach((item) => {
              let userInfo = { MemberId: item.id, UserName: item.userName, DisplayName: item.displayName, Role: 1 }
              this.project.members.push(userInfo)
            })
          } else {
            this.project.status = DESTINATION_CHECK_FAIL
            this.project.error = data.message
          }
          this.memberFocus = false
        })
        .catch((err) => {
          this.project.status = DESTINATION_CHECK_FAIL
          this.project.error = err.message || 'the user name is not found'
          this.memberFocus = false
        })
    },
    checkValidMemberIdsSubmit() {
      if (this.project.membersInput == '') {
        this.project.error = ''
        this.project.status = DESTINATION_CHECK_DONE
        this.submitHandler()
        return
      }
      const value = this.project.membersInput.replace(/,\s*$/, '')
      this.project.membersInput = value
      this.$api
        .get(`/user/member-exist?userNames=${value}`)
        .then((data) => {
          if (data && data.length) {
            this.project.members = []
            this.project.status = DESTINATION_CHECK_DONE
            data.forEach((item) => {
              let userInfo = { MemberId: item.id, UserName: item.userName, DisplayName: item.displayName, Role: 1 }
              this.project.members.push(userInfo)
            })
            this.submitHandler()
          } else {
            return
          }
        })
        .catch((err) => {
          return
        })
    },
    async submit() {
      if (!this.checkDestinationDone()) {
        if (this.memberFocus) {
          this.checkValidMemberIdsSubmit()
        }
        return
      }
      this.submitHandler()
    },
    submitHandler() {
      this.loading = true
      this.$api
        .post('project/create', {
          ProjectName: this.project.name,
          Client: this.project.client,
          Members: this.project.members,
          ProposalToken: this.project.proposalToken,
        })
        .then((res) => {
          this.resetProject()
          this.getList()
        })
        .catch((err) => {
          responseError(err)
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetProject() {
      this.project = {
        name: '',
        client: '',
        membersInput: '',
        proposalToken: '',
        error: '',
        status: DESTINATION_CHECK_NONE,
      }
    },
    checkDestinationDone: function () {
      return !this.memberFocus && this.project.status === DESTINATION_CHECK_DONE
    },
    getList() {
      this.loading = true
      this.$api
        .get('/project/get-list', {})
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
  },

  computed: {
    memberInputError: function () {
      return this.project.status === DESTINATION_CHECK_FAIL
    },
  },
  created() {
    this.getList()
    this.user = { ...this.modelValue }
  },
}
</script>

<style scoped></style>
