<template>
  <q-form>
    <div class="row">
      <q-btn
        label="Create Project"
        @click="projectDialog = true"
        class="q-mr-xs q-mt-lg"
        style="height: 40px"
        color="primary"
      />
    </div>
    <div class="q-mt-md">
      <q-table
        title="Project List"
        :loading="loading"
        :rows="displayRows"
        :columns="getColumn"
        row-key="projectName"
        class="shadow-6"
        :selection="mergeMode ? 'multiple' : 'none'"
        v-model:selected="selected"
        v-model:pagination="pagination"
        :hide-pagination="mergeMode || pagination.rowsNumber < 10"
        :class="pagination.rowsNumber <= pagination.rowsPerPage ? 'hide-pagination-number' : ''"
        flat
        separator="none"
        @row-click="(_, row) => (!mergeMode ? editProject(row.projectId) : selectRow(row))"
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
              @click.stop="setDeleteProject(props.row.projectId)"
              icon="delete"
            ></q-btn>
          </q-td>
        </template>
        <template v-slot:top-right>
          <q-btn
            label="Merge Project"
            class="q-mr-sm"
            color="primary"
            v-if="!mergeMode && showMergeButton"
            @click="setMergeMode()"
          />
          <q-btn
            label="Merge"
            class="q-mr-sm"
            color="primary"
            v-if="mergeMode"
            :disable="!canMerge"
            @click="mergeProject()"
          />
          <q-btn
            label="Cancel"
            type="button"
            text-color="black"
            color="white"
            class="btn btn-animated"
            @click="setMergeMode()"
            v-if="mergeMode"
          />
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
    <q-dialog v-model="projectDialog" persistent>
      <q-card style="width: 700px; max-width: 80vw">
        <q-card-section class="row q-pb-none">
          <div class="text-h6">{{ merging ? 'Merging' : isEdit ? 'Edit Project' : 'Add Project' }}</div>
        </q-card-section>
        <q-card-section class="q-py-none q-px-lg row">
          <div class="col-12 q-py-sm">
            <div class="row q-mt-sm q-col-gutter-md profile-padding">
              <div class="col-12 col-sm-6" v-if="!isCreator">
                <p class="q-mt-none q-mb-xs text-weight-medium col-4">Project Owner</p>
                <p>{{ project.creatorName }}</p>
              </div>
              <div class="col-12 col-sm-6">
                <p class="q-mt-none q-mb-xs text-weight-medium col-4">
                  {{ merging ? 'New Project Name' : 'Project Name' }}
                  <q-checkbox
                    size="sm"
                    class="fw-400"
                    label="Use Old Project Name"
                    v-if="merging"
                    v-model="useOldProjectName"
                  />
                </p>
                <q-input
                  v-if="(isCreator && !merging) || (merging && !useOldProjectName)"
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
                <q-select
                  v-if="merging && useOldProjectName"
                  v-model="project.name"
                  :options="oldProjectNameOptions"
                  outlined
                  dense
                  lazy-rules
                  stack-label
                  emit-value
                  map-options
                  borderless
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
                  @blur="selectBlur"
                  @filter="filterFn"
                  @keyup.enter="memberEnterType"
                  :error="memberSelectError"
                  :error-message="memberError"
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
                  @blur="approverSelectBlur"
                  @keyup.enter="approverEnterType"
                  :error="approverSelectError"
                  :error-message="approverError"
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
              <div class="col-12" v-if="isEdit && isCreator && !merging">
                <q-checkbox class="row q-mt-xs" label="Change Owner" v-model="changeOwnerFlg" />
              </div>
              <div class="col-12 col-sm-6" v-if="isEdit && isCreator && changeOwnerFlg">
                <p class="q-mt-none q-mb-xs text-weight-medium col-4">Select New Owner</p>
                <span class="text-size-13 q-mb-xs"
                  >* Can choose another member to be the new Owner of the project.</span
                >
                <q-select
                  v-model="targetChangeOwner"
                  :options="ownerTargetOptions"
                  outlined
                  dense
                  lazy-rules
                  stack-label
                  emit-value
                  map-options
                  borderless
                />
              </div>
            </div>
          </div>
        </q-card-section>
        <q-card-actions align="center" class="q-pb-md">
          <q-btn
            v-if="isCreator"
            :label="merging ? 'Finish Merge' : isEdit ? 'Update Project' : 'Create Project'"
            class="q-mr-xs q-mt-lg"
            :disable="!useOldProjectName && projectNameError"
            style="height: 40px"
            type="button"
            color="primary"
            @click="submit"
          />
          <q-btn
            :label="isEdit && isCreator && !merging ? 'Cancel Update' : 'Cancel'"
            class="q-ml-xs q-mt-lg"
            style="height: 40px"
            type="button"
            color="white"
            text-color="black"
            @click="cancelEdit()"
          />
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
let memberTyping = ''
let blurTyping = ''
let approverTyping = ''
let approverBlurTyping = ''

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
              if (!memberStringOptions.includes(v)) {
                memberStringOptions.push(v)
              }
              if (!modelValue.includes(v)) {
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
              if (!approverStringOptions.includes(v)) {
                approverStringOptions.push(v)
              }
              if (!approverModelValue.includes(v)) {
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
            blurTyping = ''
          } else {
            const needle = val.toLowerCase()
            memberTyping = needle
            blurTyping = needle
            memberFilterOptions.value = memberStringOptions.filter((v) => v.toLowerCase().indexOf(needle) > -1)
          }
        })
      },
      approverFilterFn(val, update) {
        update(() => {
          if (val === '') {
            approverFilterOptions.value = approverStringOptions
            approverBlurTyping = ''
          } else {
            const needle = val.toLowerCase()
            approverTyping = needle
            approverBlurTyping = needle
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
      memberCheckStatus: DESTINATION_CHECK_NONE,
      approverCheckStatus: DESTINATION_CHECK_NONE,
      memberHandling: '',
      approverHandling: '',
      memberError: '',
      approverError: '',
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
      changeOwnerFlg: false,
      targetChangeOwner: 0,
      mergeMode: false,
      merging: false,
      displayRows: [],
      selected: [],
      showMergeButton: false,
      useOldProjectName: false,
      projectDialog: false,
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
    membersSize: {
      immediate: true,
      handler(size) {
        if (this.targetChangeOwner == 0 && this.project.members.length > 0) {
          let setted = false
          this.project.members.forEach((member) => {
            if (!setted) {
              if (member.memberId != this.user.id) {
                setted = true
                this.targetChangeOwner = member.memberId
              }
            }
          })
        }
      },
    },
    mergeMode: {
      immediate: true,
      handler(isMerge) {
        this.updateDisplayList(isMerge)
      },
    },
    useOldProjectName: {
      immediate: true,
      handler(useFlg) {
        if (useFlg) {
          if (this.selected) {
            let exist = false
            this.selected.forEach((selectedItem) => {
              if (this.project.name == selectedItem.projectName) {
                exist = true
                return
              }
            })
            if (!exist) {
              this.project.name = this.selected[0].projectName
            }
          }
        } else {
          this.project.name = ''
        }
      },
    },
  },
  methods: {
    updateDisplayList(isMerge) {
      if (isMerge) {
        this.displayRows = []
        if (this.rows) {
          this.rows.forEach((row) => {
            if (row.creatorId == this.user.id) {
              this.displayRows.push(row)
            }
          })
        }
      } else {
        this.displayRows = this.rows
      }
    },
    selectBlur() {
      this.memberCheckStatus = DESTINATION_CHECK_CHECKING
      let existOnOptions = false
      if (blurTyping == '') {
        this.memberCheckStatus = DESTINATION_CHECK_DONE
        return
      }
      let existOnProjectMembers = false
      this.project.members.forEach((member) => {
        //check on member
        if (member.userName == blurTyping) {
          existOnProjectMembers = true
          return
        }
      })
      if (existOnProjectMembers) {
        this.memberCheckStatus = DESTINATION_CHECK_DONE
        return
      }
      let existOption
      memberStringOptions.forEach((option) => {
        if (option === blurTyping) {
          existOnOptions = true
          existOption = option
          memberTyping = ''
          blurTyping = ''
          return
        }
      })
      if (!existOnOptions) {
        //check current typing user
        this.$api
          .get(`/user/member-exist-checking?userName=${blurTyping}`)
          .then(({ found, id, userName, displayName, paymentSettings, message }) => {
            if (found) {
              this.project.members.push({
                memberId: id,
                userName: userName,
                displayName: displayName,
                role: 1,
              })
              let memberArr = []
              if (this.project.members) {
                this.project.members.forEach((member) => {
                  if (member.memberId != this.user.id) {
                    memberArr.push(member.userName)
                  }
                })
              }
              this.memberHandling = userName
              this.memberModel = ref(memberArr)
              this.memberCheckStatus = DESTINATION_CHECK_DONE
            } else {
              this.memberCheckStatus = DESTINATION_CHECK_FAIL
              this.memberError = message
            }
          })
          .catch(() => {
            this.memberCheckStatus = DESTINATION_CHECK_FAIL
            this.memberError = 'the user name is not found'
          })
          .finally(() => {
            memberTyping = ''
            blurTyping = ''
          })
      } else {
        //get userinfo by username
        const userInfo = this.getUserInfo(existOption)
        if (userInfo == null) {
          this.memberCheckStatus = DESTINATION_CHECK_FAIL
          this.memberError = 'the user info is not found'
          return
        }
        this.project.members.push({
          memberId: userInfo.id,
          userName: userInfo.userName,
          displayName: userInfo.displayName,
          role: 1,
        })
        let memberArr = []
        if (this.project.members) {
          this.project.members.forEach((member) => {
            if (member.memberId != this.user.id) {
              memberArr.push(member.userName)
            }
          })
        }
        this.memberHandling = userInfo.userName
        this.memberModel = ref(memberArr)
        this.memberCheckStatus = DESTINATION_CHECK_DONE
      }
    },
    memberEnterType() {
      if (this.memberCheckStatus == DESTINATION_CHECK_CHECKING) {
        return
      }
      this.memberCheckStatus = DESTINATION_CHECK_CHECKING
      if (memberTyping == '') {
        this.memberCheckStatus = DESTINATION_CHECK_DONE
        return
      }
      this.$api
        .get(`/user/member-exist-checking?userName=${memberTyping}`)
        .then(({ found, id, userName, displayName, paymentSettings, message }) => {
          if (!found) {
            let removeIndex = -1
            for (let i = 0; i < memberStringOptions.length; i++) {
              const option = memberStringOptions[i]
              if (option === memberTyping) {
                removeIndex = i
                break
              }
            }
            //remove typing option
            if (removeIndex >= 0) {
              memberStringOptions.splice(removeIndex, 1)
              this.memberFilterOptions.value = memberStringOptions
            }
            let memberArr = []
            let modelIndex = -1
            if (this.project.members) {
              for (let i = 0; i < this.project.members.length; i++) {
                const member = this.project.members[i]
                if (member.userName == memberTyping) {
                  modelIndex = i
                }
              }
              if (modelIndex >= 0) {
                this.project.members.splice(modelIndex, 1)
              }
              this.project.members.forEach((member) => {
                if (member.memberId != this.user.id) {
                  memberArr.push(member.userName)
                }
              })
            }
            this.memberCheckStatus = DESTINATION_CHECK_FAIL
            this.memberModel = ref(memberArr)
            return
          } else {
            let existProject = false
            this.project.members.forEach((member) => {
              if (member.userName == memberTyping) {
                existProject = true
              }
            })
            if (!existProject) {
              this.project.members.push({
                memberId: id,
                userName: userName,
                displayName: userName,
                role: 1,
              })
              let userExist = false
              this.userSelection.forEach((user) => {
                if (user.userName == userName) {
                  userExist = true
                  return
                }
              })
              if (!userExist) {
                this.userSelection.push({
                  id: id,
                  userName: userName,
                  displayName: displayName,
                  role: 1,
                })
              }
            }
            let memberArr = []
            if (this.project.members) {
              this.project.members.forEach((member) => {
                if (member.memberId != this.user.id) {
                  memberArr.push(member.userName)
                }
              })
            }
            this.memberHandling = userName
            this.memberModel = ref(memberArr)
            this.memberCheckStatus = DESTINATION_CHECK_DONE
          }
        })
        .catch(() => {
          this.memberCheckStatus = DESTINATION_CHECK_FAIL
          this.memberError = 'the user name is not found'
        })
        .finally(() => {
          memberTyping = ''
        })
    },
    approverEnterType() {
      if (this.approverCheckStatus == DESTINATION_CHECK_CHECKING) {
        return
      }
      this.approverCheckStatus = DESTINATION_CHECK_CHECKING
      if (approverTyping == '') {
        this.approverCheckStatus = DESTINATION_CHECK_DONE
        return
      }
      this.$api
        .get(`/user/member-exist-checking?userName=${approverTyping}`)
        .then(({ found, id, userName, displayName, paymentSettings, message }) => {
          if (!found) {
            let removeIndex = -1
            for (let i = 0; i < approverStringOptions.length; i++) {
              const option = approverStringOptions[i]
              if (option === approverTyping) {
                removeIndex = i
                break
              }
            }
            //remove typing option
            if (removeIndex >= 0) {
              approverStringOptions.splice(removeIndex, 1)
              this.approverFilterOptions.value = approverStringOptions
            }
            let approverArr = []
            let modelIndex = -1
            if (this.project.approvers) {
              for (let i = 0; i < this.project.approvers.length; i++) {
                const approver = this.project.approvers[i]
                if (approver.userName == approverTyping) {
                  modelIndex = i
                }
              }
              if (modelIndex >= 0) {
                this.project.approvers.splice(modelIndex, 1)
              }
              this.project.approvers.forEach((approver) => {
                approverArr.push(approver.userName)
              })
            }
            this.approverCheckStatus = DESTINATION_CHECK_FAIL
            this.approverModel = ref(approverArr)
            return
          } else {
            let existProject = false
            this.project.approvers.forEach((approver) => {
              if (approver.userName == approverTyping) {
                existProject = true
              }
            })
            if (!existProject) {
              this.project.approvers.push({
                memberId: id,
                userName: userName,
                displayName: userName,
                role: 1,
              })
              let userExist = false
              this.userSelection.forEach((user) => {
                if (user.userName == userName) {
                  userExist = true
                  return
                }
              })
              if (!userExist) {
                this.userSelection.push({
                  id: id,
                  userName: userName,
                  displayName: displayName,
                  role: 1,
                })
              }
            }
            let approverArr = []
            if (this.project.approvers) {
              this.project.approvers.forEach((approver) => {
                approverArr.push(approver.userName)
              })
            }
            this.approverHandling = userName
            this.approverModel = ref(approverArr)
            this.approverCheckStatus = DESTINATION_CHECK_DONE
          }
        })
        .catch(() => {
          this.approverCheckStatus = DESTINATION_CHECK_FAIL
          this.approverError = 'the user name is not found'
        })
        .finally(() => {
          approverTyping = ''
        })
    },
    approverSelectBlur() {
      this.approverCheckStatus = DESTINATION_CHECK_NONE
      let existOnOptions = false
      if (approverBlurTyping == '') {
        this.approverCheckStatus = DESTINATION_CHECK_DONE
        return
      }
      let existOnProjectApprovers = false
      this.project.approvers.forEach((approver) => {
        if (approver.userName == approverBlurTyping) {
          existOnProjectApprovers = true
          return
        }
      })
      if (existOnProjectApprovers) {
        this.approverCheckStatus = DESTINATION_CHECK_DONE
        return
      }
      let existOption
      approverStringOptions.forEach((option) => {
        if (option === approverBlurTyping) {
          existOnOptions = true
          existOption = option
          approverTyping = ''
          approverBlurTyping = ''
          return
        }
      })
      if (!existOnOptions) {
        //check current typing user
        this.$api
          .get(`/user/member-exist-checking?userName=${approverBlurTyping}`)
          .then(({ found, id, userName, displayName, paymentSettings, message }) => {
            if (found) {
              this.project.approvers.push({
                memberId: id,
                userName: userName,
                displayName: displayName,
                role: 1,
              })
              let approverArr = []
              if (this.project.approvers) {
                this.project.approvers.forEach((approver) => {
                  approverArr.push(approver.userName)
                })
              }
              this.approverHandling = userName
              this.approverCheckStatus = DESTINATION_CHECK_DONE
              this.approverModel = ref(approverArr)
            } else {
              this.approverCheckStatus = DESTINATION_CHECK_FAIL
              this.approverError = message
            }
          })
          .catch(() => {
            this.approverCheckStatus = DESTINATION_CHECK_FAIL
            this.approverError = 'the user name is not found'
          })
          .finally(() => {
            approverTyping = ''
            approverBlurTyping = ''
          })
      } else {
        //get userinfo by username
        const userInfo = this.getUserInfo(existOption)
        if (userInfo == null) {
          this.approverCheckStatus = DESTINATION_CHECK_FAIL
          this.approverError = 'the user info is not found'
          return
        }
        this.project.approvers.push({
          memberId: userInfo.id,
          userName: userInfo.userName,
          displayName: userInfo.displayName,
          role: 1,
        })
        let approverArr = []
        if (this.project.approvers) {
          this.project.approvers.forEach((approver) => {
            approverArr.push(approver.userName)
          })
        }
        this.approverHandling = userInfo.userName
        this.approverModel = ref(approverArr)
        this.approverCheckStatus = DESTINATION_CHECK_DONE
      }
    },
    async modelValueChange() {
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
          const userInfo = this.getUserInfo(v)
          if (userInfo == null) {
            return
          }
          this.project.members.push({
            memberId: userInfo.id,
            userName: userInfo.userName,
            displayName: userInfo.displayName,
            role: 1,
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
          const userInfo = this.getUserInfo(v)
          if (userInfo == null) {
            return
          }
          this.project.approvers.push({
            memberId: userInfo.id,
            userName: userInfo.userName,
            displayName: userInfo.displayName,
            role: 1,
          })
        })
    },
    getUserInfo(userName) {
      let result = null
      for (let i = 0; i < this.userSelection.length; i++) {
        const userInfo = this.userSelection[i]
        if (userInfo.userName == userName) {
          result = userInfo
          break
        }
      }
      return result
    },
    async submit() {
      if (!(this.merging && this.useOldProjectName) && !this.checkDestinationDone()) {
        if (this.projectNameFocus) {
          this.checkValidProjectNameSubmit()
        }
        return
      }
      this.submitHandler()
    },
    submitHandler() {
      let params = {
        projectName: this.project.name,
        members: this.project.members,
        approvers: this.project.approvers,
        description: this.project.description,
        targetOwnerId: this.isCreator && this.isEdit && this.changeOwnerFlg ? this.targetChangeOwner : 0,
      }
      if (this.isCreator && this.merging) {
        const targetMergeIds = []
        this.selected.forEach((selectedItem) => {
          targetMergeIds.push(selectedItem.projectId)
        })
        params.projectId = this.selected[0].projectId
        params.targetMergeIds = targetMergeIds.join(',')
        this.$api
          .put('project/edit', params)
          .then((res) => {
            this.resetProject()
            this.getList(false)
            this.$q.notify({
              type: 'positive',
              message: 'Project has been merged',
              position: 'bottom',
            })
            this.projectDialog = false
          })
          .catch((err) => {
            responseError(err)
          })
        return
      }
      if (this.isEdit) {
        params.projectId = this.currentEditProject.projectId
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
            this.projectDialog = false
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
            this.projectDialog = false
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
      this.mergeMode = false
      this.merging = false
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
          if (this.rows) {
            let canMergeCount = 0
            this.rows.forEach((row) => {
              if (row.creatorId == this.user.id) {
                canMergeCount++
              }
            })
            this.showMergeButton = canMergeCount >= 2
          }
          this.updateDisplayList(this.mergeMode)
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
        .get('/payment/get-payment-users', {})
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
    selectRow(project) {
      let exist = false
      let index = -1
      for (let i = 0; i < this.selected.length; i++) {
        const selectedItem = this.selected[i]
        if (selectedItem.projectId == project.projectId) {
          exist = true
          index = i
          break
        }
      }
      if (exist) {
        this.selected.splice(index, 1)
      } else {
        this.selected.push(project)
      }
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
          if (this.project.members.length > 0) {
            let setted = false
            this.project.members.forEach((member) => {
              if (!setted) {
                if (member.memberId != this.user.id) {
                  setted = true
                  this.targetChangeOwner = member.memberId
                }
              }
            })
          } else {
            this.targetChangeOwner = 0
          }
          this.changeOwnerFlg = false
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
          this.projectDialog = true
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
      this.merging = false
      this.mergeMode = false
      this.projectDialog = false
      this.selected = []
      this.resetProject()
    },
    isCreatorUser(project) {
      return this.user.id == project.creatorId
    },
    setMergeMode() {
      this.mergeMode = !this.mergeMode
      if (!this.mergeMode) {
        this.merging = false
        this.selected = []
        this.resetProject()
      }
    },
    mergeProject() {
      this.merging = true
      //TODO. edit project name
      if (!this.selected || this.selected.length < 2) {
        return
      }
      const newMembers = []
      const newApprovers = []
      const projectName = ''
      let description = ''
      let num = 0
      this.selected.forEach((selectedItem) => {
        num++
        //check and insert members
        if (selectedItem.members) {
          selectedItem.members.forEach((member) => {
            let exist = false
            newMembers.forEach((newMember) => {
              if (newMember.memberId == member.memberId) {
                exist = true
                return
              }
            })
            if (!exist) {
              newMembers.push(member)
            }
          })
        }
        //check and insert approvers
        if (selectedItem.approvers) {
          selectedItem.approvers.forEach((approver) => {
            let exist = false
            newApprovers.forEach((newApprover) => {
              if (newApprover.memberId == approver.memberId) {
                exist = true
                return
              }
            })
            if (!exist) {
              newApprovers.push(approver)
            }
          })
        }

        if (selectedItem.description && selectedItem.description !== '') {
          description += `(${selectedItem.projectName}): ${selectedItem.description}\n`
        }
      })
      this.project = {
        name: '',
        members: newMembers,
        approvers: newApprovers,
        description: description,
        creatorName: this.user.userName,
        status: DESTINATION_CHECK_DONE,
        error: '',
      }
      this.changeOwnerFlg = false
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
      this.projectDialog = true
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
    memberSelectError: function () {
      return this.memberCheckStatus === DESTINATION_CHECK_FAIL
    },
    approverSelectError: function () {
      return this.approverCheckStatus === DESTINATION_CHECK_FAIL
    },
    ownerTargetOptions: function () {
      const options = []
      this.project.members.forEach((member) => {
        if (member.memberId != this.user.id) {
          options.push({
            label: member.userName,
            value: member.memberId,
          })
        }
      })
      return options
    },
    oldProjectNameOptions: function () {
      const options = []
      if (this.selected && this.selected.length > 0) {
        this.selected.forEach((selectedItem) => {
          options.push({
            label: selectedItem.projectName,
            value: selectedItem.projectName,
          })
        })
      }
      return options
    },
    membersSize: function () {
      return this.project.members.length
    },
    canMerge: function () {
      return this.selected.length > 1
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
