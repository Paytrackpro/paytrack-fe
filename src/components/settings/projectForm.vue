<template>
  <q-form @submit="submit">
    <div class="row">
      <q-card class="col-12 col-sm-8 q-px-lg q-pb-lg shadow-primary">
        <div class="q-table__title title-case q-pt-sm">{{ this.isEdit ? 'Edit Project' : 'Add Project' }}</div>
        <div class="row q-mt-sm q-col-gutter-md profile-padding">
          <div class="col-12 col-sm-6" v-if="!isCreator">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Project Owner</p>
            <p>{{ project.creatorName }}</p>
          </div>
          <div class="col-12 col-sm-6">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Project Name</p>
            <q-input
              v-if="isCreator"
              outlined
              dense
              lazy-rules
              stack-label
              @blur="checkValidProjectName"
              :error="projectNameError"
              :error-message="project.error"
              @focus="projectNameFocus = true"
              hide-bottom-space
              v-model="project.name"
              placeholder="Project Name"
            />
            <p v-if="!isCreator">{{ project.name }}</p>
          </div>
          <div class="col-12 col-sm-6">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">{{ isCreator ? 'Members Select' : 'Members' }}</p>
            <q-select
              v-model="memberModel"
              v-if="isCreator"
              use-input
              use-chips
              multiple
              outlined
              input-debounce="0"
              @new-value="createValue"
              :options="memberFilterOptions"
              @filter="filterFn"
              @update:model-value="modelValueChange()"
            />
            <p v-if="!isCreator">{{ membersDisplay }}</p>
          </div>
          <div class="col-12 col-sm-6" v-if="!isApproverEmpty">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Approvers</p>
            <q-select
              v-model="approverModel"
              v-if="isCreator"
              use-input
              use-chips
              multiple
              outlined
              input-debounce="0"
              @new-value="createApproverValue"
              :options="approverFilterOptions"
              @filter="approverFilterFn"
              @update:model-value="approverModelValueChange()"
            />
            <p v-if="!isCreator">{{ approversDisplay }}</p>
          </div>
          <div class="col-12 col-sm-6">
            <p class="q-mt-none q-mb-xs text-weight-medium col-4">Description</p>
            <q-input
              v-if="isCreator"
              v-model="project.description"
              dense
              outlined
              stack-label
              auto
              rows="3"
              hide-bottom-space
              type="textarea"
            />
            <p v-if="!isCreator">{{ project.description }}</p>
          </div>
        </div>
        <div class="row q-col-gutter-md profile-padding">
          <div class="col-12">
            <div class="row justify-between">
              <div></div>
              <div>
                <q-btn
                  v-if="isCreator"
                  :label="isEdit ? 'Update Project' : 'Create Project'"
                  class="q-mr-xs q-mt-lg"
                  :disable="projectNameError"
                  style="height: 40px"
                  type="submit"
                  color="primary"
                />
                <q-btn
                  v-if="isEdit"
                  :label="isCreator ? 'Cancel Update' : 'Cancel'"
                  class="q-ml-xs q-mt-lg"
                  style="height: 40px"
                  type="button"
                  color="white"
                  text-color="black"
                  @click="cancelEdit()"
                />
              </div>
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
        :columns="getColumn"
        row-key="name"
        class="shadow-6"
        v-model:pagination="pagination"
        :hide-pagination="pagination.rowsNumber < 10"
        :class="pagination.rowsNumber <= pagination.rowsPerPage ? 'hide-pagination-number' : ''"
        flat
        separator="none"
        @row-click="(_, row) => editProject(row.projectId)"
      >
        <template v-slot:body-cell-action="props">
          <q-td :props="props">
            <q-btn
              :props="props"
              v-if="isCreatorUser(props.row)"
              dense
              round
              flat
              color="grey"
              @click="setDeleteProject(props.row.projectId)"
              icon="delete"
            ></q-btn>
          </q-td>
        </template>
      </q-table>
    </div>
    <q-dialog v-model="deleteConfirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="warning" color="primary" text-color="white" size="md" />
          <span class="q-ml-sm">Are you sure to delete the project?</span>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat unelevated rounded label="Delete" color="primary" v-close-popup @click="deleteProject()" />
          <q-btn flat unelevated rounded label="Cancel" color="primary" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-form>
</template>

<script>
import { defaultPaging } from 'src/helper/paging'
import { responseError } from 'src/helper/error'
import { mapGetters } from 'vuex'
import { ref } from 'vue'
import {
  DESTINATION_CHECK_NONE,
  DESTINATION_CHECK_DONE,
  DESTINATION_CHECK_CHECKING,
  DESTINATION_CHECK_FAIL,
} from 'src/consts/common'

let memberStringOptions = []
let approverStringOptions = []

export default {
  setup() {
    const memberModel = ref(null)
    const memberFilterOptions = ref(memberStringOptions)
    const approverModel = ref(null)
    const approverFilterOptions = ref(approverStringOptions)

    return {
      memberModel,
      approverModel,
      memberFilterOptions,
      approverFilterOptions,

      createValue(val, done) {
        if (val.length > 0) {
          const modelValue = (memberModel.value || []).slice()

          val
            .split(/[,;|]+/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
            .forEach((v) => {
              if (memberStringOptions.includes(v) === false) {
                memberStringOptions.push(v)
              }
              if (modelValue.includes(v) === false) {
                modelValue.push(v)
              }
            })
          done(null)
          memberModel.value = modelValue
        }
      },
      createApproverValue(val, done) {
        if (val.length > 0) {
          const approverModelValue = (approverModel.value || []).slice()
          val
            .split(/[,;|]+/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0)
            .forEach((v) => {
              if (approverStringOptions.includes(v) === false) {
                approverStringOptions.push(v)
              }
              if (approverModelValue.includes(v) === false) {
                approverModelValue.push(v)
              }
            })
          done(null)
          approverModel.value = approverModelValue
        }
      },
      filterFn(val, update) {
        update(() => {
          if (val === '') {
            memberFilterOptions.value = memberStringOptions
          } else {
            const needle = val.toLowerCase()
            memberFilterOptions.value = memberStringOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
          }
        })
      },
      approverFilterFn(val, update) {
        update(() => {
          if (val === '') {
            approverFilterOptions.value = approverStringOptions
          } else {
            const needle = val.toLowerCase()
            approverFilterOptions.value = approverStringOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
          }
        })
      },
    }
  },
  data() {
    return {
      user: {},
      project: {
        name: '',
        members: [],
        approvers: [],
        error: '',
        description: '',
        creatorName: '',
        status: DESTINATION_CHECK_NONE,
      },
      projectNameFocus: false,
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
          name: 'approvers',
          align: 'center',
          label: 'Approvers',
          field: (row) => {
            if (row.approvers && row.approvers.length > 0) {
              return row.approvers.map((item) => item.userName).join(',')
            } else {
              return ''
            }
          },
        },
        {
          name: 'description',
          required: true,
          label: 'Description',
          align: 'center',
          field: (row) => {
            return row.description
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
      userSelection: [],
      currentEditProject: {},
      isEdit: false,
      deleteConfirm: false,
      deleteId: 0,
    }
  },
  name: 'projectForm',
  props: {
    modelValue: Object,
    projectId: Number,
  },
  emits: ['update:modelValue'],
  watch: {
    modelValue(val) {
      this.user = { ...val }
    },
  },
  methods: {
    modelValueChange() {
      this.project.members = []
      if (this.memberModel == null) {
        return
      }
      let newSelectedUsers = String(this.memberModel)
      this.project.members = []
      newSelectedUsers
        .split(/[,;|]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .forEach((v) => {
          let userInfo = this.getUserInfo(v)
          if (userInfo == null) {
            return
          }
          this.project.members.push({
            MemberId: userInfo.id,
            UserName: userInfo.userName,
            DisplayName: userInfo.displayName,
            Role: 1,
          })
        })
    },
    approverModelValueChange() {
      this.project.approvers = []
      if (this.approverModel == null) {
        return
      }
      let newSelectedUsers = String(this.approverModel)
      this.project.approvers = []
      newSelectedUsers
        .split(/[,;|]+/)
        .map((v) => v.trim())
        .filter((v) => v.length > 0)
        .forEach((v) => {
          let userInfo = this.getUserInfo(v)
          if (userInfo == null) {
            return
          }
          this.project.approvers.push({
            MemberId: userInfo.id,
            UserName: userInfo.userName,
            DisplayName: userInfo.displayName,
            Role: 1,
          })
        })
    },
    getUserInfo(userName) {
      let result = null
      this.userSelection.forEach((userInfo) => {
        if (userInfo.userName == userName) {
          result = userInfo
          return
        }
      })
      return result
    },
    async submit() {
      if (!this.checkDestinationDone()) {
        if (this.projectNameFocus) {
          this.checkValidProjectNameSubmit()
        }
        return
      }
      this.submitHandler()
    },
    submitHandler() {
      let params = {
        ProjectName: this.project.name,
        Members: this.project.members,
        Approvers: this.project.approvers,
        Description: this.project.description,
      }
      if (this.isEdit) {
        params.ProjectId = this.currentEditProject.projectId
        this.$api
          .put('project/edit', params)
          .then((res) => {
            this.resetProject()
            this.getList(false)
            this.$q.notify({
              type: 'positive',
              message: 'Project has been updated',
              position: 'bottom',
            })
          })
          .catch((err) => {
            responseError(err)
          })
      } else {
        this.$api
          .post('project/create', params)
          .then((res) => {
            this.resetProject()
            this.getList(false)
            this.$q.notify({
              type: 'positive',
              message: 'Project has been created',
              position: 'bottom',
            })
          })
          .catch((err) => {
            responseError(err)
          })
      }
    },
    resetProject() {
      this.project = {
        name: '',
        members: [],
        approvers: [],
        description: '',
        creatorName: '',
        status: DESTINATION_CHECK_DONE,
        error: '',
      }
      this.memberModel = ref(null)
      this.approverModel = ref(null)
      this.isEdit = false
    },
    checkDestinationDone: function () {
      return !this.projectNameFocus && this.project.status === DESTINATION_CHECK_DONE
    },
    getList(isCreated) {
      this.loading = true
      this.$api
        .get('/project/get-list', {})
        .then((res) => {
          this.loading = false
          this.rows = res
          this.pagination.rowsNumber = res.length
          const hasProject = this.projectId > 0
          //check and active project
          if (this.rows && this.rows.length > 0 && isCreated && hasProject) {
            this.rows.forEach((row) => {
              if (row.projectId == this.projectId) {
                this.editProject(this.projectId)
                return
              }
            })
          }
        })
        .catch((err) => {
          responseError(err)
          this.loading = false
        })
    },
    initUserList() {
      this.$api
        .get('/user/get-user-list', {})
        .then((res) => {
          this.userSelection = res
          memberStringOptions = []
          approverStringOptions = []
          this.userSelection.forEach((userInfo) => {
            if (this.user.id !== userInfo.id) {
              memberStringOptions.push(userInfo.userName)
            }
            approverStringOptions.push(userInfo.userName)
          })
        })
        .catch((err) => {
          responseError(err)
          this.loading = false
        })
    },
    handlerValidProjectName(isSubmit) {
      if (this.project.name == '') {
        this.project.status = DESTINATION_CHECK_FAIL
        this.project.error = 'Project name is required'
        return
      }
      this.project.status = DESTINATION_CHECK_CHECKING
      let isExist = false
      if (!this.isEdit || (this.isEdit && this.currentEditProject.projectName != this.project.name)) {
        this.rows.forEach((tmpProject) => {
          if (tmpProject.projectName == this.project.name.trim()) {
            isExist = true
            return
          }
        })
      }
      if (isExist) {
        this.project.status = DESTINATION_CHECK_FAIL
        this.project.error = 'Project name already exists'
      } else {
        this.project.status = DESTINATION_CHECK_DONE
        if (isSubmit) {
          this.submitHandler()
        }
      }
    },
    checkValidProjectName() {
      this.handlerValidProjectName(false)
    },
    checkValidProjectNameSubmit() {
      this.handlerValidProjectName(true)
    },
    editProject(projectId) {
      this.rows.forEach((tmpProject) => {
        if (tmpProject.projectId == projectId) {
          this.currentEditProject = tmpProject
          this.project = {
            name: tmpProject.projectName,
            members: tmpProject.members,
            approvers: tmpProject.approvers,
            description: tmpProject.description,
            creatorName: tmpProject.creatorName,
            status: DESTINATION_CHECK_DONE,
            error: '',
          }
          this.isEdit = true
          let memberArr = []
          let approverArr = []
          if (this.project.members) {
            this.project.members.forEach((member) => {
              if (member.userName !== this.user.userName) {
                memberArr.push(member.userName)
              }
            })
          }
          this.memberModel = ref(memberArr)
          if (this.project.approvers) {
            this.project.approvers.forEach((approver) => {
              approverArr.push(approver.userName)
            })
          }
          this.approverModel = ref(approverArr)
          return
        }
      })
    },
    deleteProject() {
      this.$api
        .delete(`/project/delete/${this.deleteId}`)
        .then(() => {
          this.$q.notify({
            message: 'Project has been deleted',
            color: 'positive',
            icon: 'check',
          })
          this.getList(false)
        })
        .catch((err) => {
          responseError(err)
        })
    },
    setDeleteProject(projectId) {
      this.deleteConfirm = true
      this.deleteId = projectId
    },
    cancelEdit() {
      this.isEdit = false
      this.resetProject()
    },
    isCreatorUser(project) {
      return this.user.id == project.creatorId
    },
  },

  computed: {
    ...mapGetters({
      user: 'user/getUser',
    }),
    projectNameError: function () {
      return this.project.status === DESTINATION_CHECK_FAIL
    },
    membersDisplay: function () {
      if (this.currentEditProject.projectId < 1 || !this.currentEditProject.members) {
        return ''
      }
      var memberNames = []
      this.currentEditProject.members.forEach((member) => {
        memberNames.push(member.displayName && member.displayName !== '' ? member.displayName : member.userName)
      })
      return memberNames.join(', ')
    },
    approversDisplay: function () {
      if (this.currentEditProject.projectId < 1 || !this.currentEditProject.approvers) {
        return ''
      }
      var approverNames = []
      this.currentEditProject.approvers.forEach((approver) => {
        approverNames.push(
          approver.displayName && approver.displayName !== '' ? approver.displayName : approver.userName
        )
      })
      return approverNames.join(', ')
    },
    hasApprovers: function () {
      let hasApprover = false
      this.rows.forEach((tmpProject) => {
        if (tmpProject.approvers && tmpProject.approvers.length > 0) {
          hasApprover = true
          return
        }
      })
      return hasApprover
    },
    getColumn: function () {
      if (this.hasApprovers) {
        return this.columns
      }
      const tempColumns = []
      this.columns.forEach((column) => {
        if (column.name !== 'approvers') {
          tempColumns.push(column)
        }
      })
      return tempColumns
    },
    isCreator: function () {
      if (!this.isEdit) {
        return true
      }
      return this.currentEditProject.projectId > 0 && this.currentEditProject.creatorId == this.user.id
    },
    isApproverEmpty: function () {
      if (!this.isEdit || this.isCreator) {
        return false
      }
      return !this.currentEditProject.approvers || this.currentEditProject.approvers.length < 1
    },
  },
  created() {
    this.getList(true)
    this.user = { ...this.modelValue }
    this.initUserList()
  },
}
</script>

<style scoped></style>
