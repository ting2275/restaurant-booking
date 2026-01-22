<template>
  <div class='main-box'>
    <h4>
      <span v-if='currentView === STORE_MANAGE' class='prev-btn' @click='currentView = PERMISSION_MANAGE'>
        <img src='@/assets/images/icons/back-arrow.svg' alt='上一步'>
      </span>
      {{ currentView === PERMISSION_MANAGE ? '權限管理' : '店鋪管理' }}
    </h4>
    <div class='main-container'>
      <template v-if='currentView === PERMISSION_MANAGE'>
        <div v-show='isAdmin'>
          <p class='subtitle'>管理員資訊</p>
          <div class='shop-list-box'>
            <ul class='manager-info'>
              <li>
                <div class='user-avatar'>
                  <img v-if='managerInfo.avatar' :src='managerInfo.avatarUrl' :alt='managerInfo.name'>
                  <img v-else src='@/assets/images/icons/user-picture.svg' :alt='managerInfo.name'>
                </div>
                <div class='user-name'>{{ managerInfo.name }}</div>
                <div class='user-mail'>{{ managerInfo.userId }}</div>
                <!-- <div class='user-status'>{{ managerInfo.userStatus }}</div> -->
                <div class='user-type'>
                  <TagRoleStatus :variant='managerInfo.role'>
                    {{ managerInfo.role }}
                  </TagRoleStatus>
                </div>
              </li>
            </ul>
          </div>
        </div>
        <p class='subtitle'>
          店鋪管理
        </p>
        <div class='shop-list-box'>
          <ul>
            <li v-for='branch in managerInfo.branchList' :key='branch.id' @click='viewBranchDetails(branch.id)'>
              <div class='shop-name'>{{ branch.name }}</div>
              <span>
                <img src='@/assets/images/icons/right-arrow.svg' alt='進入店鋪'>
              </span>
            </li>
          </ul>
        </div>
      </template>
      <div v-else-if='currentView === STORE_MANAGE'>
        <p class='subtitle'>{{ currentBranch }}</p>
        <div class='shop-list-box'>
          <ul>

            <li
              class='add-user'
              :class="{ 'is-view-only': isViewOnly }"
              @click='isPopupAddVisible = true'>
              新增成員
            </li>
            <li v-for='(user, index) in filteredMaintainUserList' :key='user.maintainOwnerId' class='member-item' :class="{ 'is-view-only': isViewOnly }" @click='editMember(index)'>
              <div class='member-avatar'>
                <img v-if='user.userAvatar' :src='user.userAvatar' :alt='user.userName'>
                <img v-else src='@/assets/images/icons/user-picture.svg' :alt='user.userName'>
              </div>
              <div class='member-name'>{{ user.userName }}</div>
              <div class='member-mail'>{{ user.userId }}</div>
              <div class='member-status'>{{ user.userStatus }}</div>
              <div class='member-type'>
                <TagRoleStatus :key='user.maintainOwnerId' :variant='user.userRole'>
                  {{ user.userRole }}
                </TagRoleStatus>
              </div>
              <span>
                <img :src='isViewOnly ? editGrayIcon : editIcon' alt='編輯成員'>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>

  <!-- Popups -->
  <PlainPopUp ref='addRef' v-model='isPopupAddVisible'>
    <template #title>新增成員</template>
    <template #content>
      <div class='add-member-box'>
        <BaseInput
          v-model='userNameInput.model' :label='userNameInput.label'
          :type='userNameInput.type' :placeholder='userNameInput.placeholder' :locked='userNameInput.locked'
          :error-message='userNameInput.errorMessage' />
        <BaseInput
          v-model='userAccountInput.model' :label='userAccountInput.label'
          :type='userAccountInput.type' :placeholder='userAccountInput.placeholder' :locked='userAccountInput.locked'
          :error-message='userAccountInput.errorMessage' />
        <div class='select-group'>
          <DropdownMenu
            id='userRole' :key='userRoleForAdd' v-model='userRoleForAdd' label='權限' :options='filteredRolesOptions' label-key='label' value-key='value' placeholder='請選擇' :is-searchable='false' :is-readonly='true' @dropdown-open='scrollAddPopupToBottom' />
        </div>
      </div>
    </template>
    <template #buttons>
      <BaseButton
        :variant='buttonCancel.variant' :size='buttonCancel.size' @click='isPopupAddVisible = false'>
        {{ buttonCancel.label }}
      </BaseButton>
      <BaseButton
        :variant='buttonConfirm.variant' :size='buttonConfirm.size' @click='addMember()'>
        {{ buttonConfirm.label }}
      </BaseButton>
    </template>
  </PlainPopUp>
  <PlainPopUp ref='editRef' v-model='isPopupEditVisible'>
    <template #title>編輯成員</template>
    <template #content>
      <div class='member-header'>
        <div class='member-avatar'>
          <img v-if='editingUser.userAvatar' :src='editingUser.userAvatar' :alt='editingUser.userName'>
          <img v-else src='@/assets/images/icons/user-picture.svg' :alt='editingUser.userName'>
        </div>
        <div class='member-name'>{{ editingUser.userName }}</div>
        <BaseButton
          :variant='deleteButton.variant' :size='deleteButton.size'
          class='btn-delete' @click='checkDeleteMember()'>
          {{ deleteButton.label }}
        </BaseButton>
      </div>
      <div class='member-info'>
        <div class='info-group'>
          <div class='info-title'>帳號</div>
          <div class='info-content'>{{ editingUser.userId }}</div>
        </div>
        <div class='info-group'>
          <div class='info-title'>狀態</div>
          <div v-if='editingUser.userStatus === "已驗證"' class='info-content'>已驗證</div>
          <div v-else-if='editingUser.userStatus === "未驗證"' class='info-content'>
            <span class='highlight'>未驗證</span>
            <a href='javascript:void(0)' @click='sendEmail(editingUser.userId)'>重新發送驗證信</a>
          </div>
        </div>
        <div class='info-group'>
          <div class='info-title'>權限</div>
          <div class='info-content'>
            <DropdownMenu
              id='userRoleForEdit' :key='userRoleForEdit' v-model='userRoleForEdit' :options='filteredRolesOptions'
              label-key='label' value-key='value' placeholder='請選擇' :is-searchable='false' :is-readonly='true' @dropdown-open='scrollEditPopupToBottom'/>
          </div>
        </div>
      </div>
    </template>
    <template #buttons>
      <BaseButton
        :variant='buttonCancel.variant' :size='buttonCancel.size' @click='isPopupEditVisible = false'>
        {{ buttonCancel.label }}
      </BaseButton>
      <BaseButton
        :variant='saveButton.variant' :size='saveButton.size' @click='saveMember()'>
        {{ saveButton.label }}
      </BaseButton>
    </template>
  </PlainPopUp>
  <BasePopUp v-model='isPopupVisible'>
    <template #title>{{ currentPopupContent.title }}</template>
    <!-- <template #content>{{ currentPopupContent.content }}</template> -->
    <template #content>
      <div v-html='sanitizedContent'></div>
    </template>
    <template #button>
      <BaseButton variant='check' size='md' @click='isPopupVisible = !isPopupVisible'>{{ currentPopupContent.buttonText
      }}
      </BaseButton>
    </template>
  </BasePopUp>
  <DoubleCheckPopUp v-model='isPopupCheckVisible'>
    <template #title>{{ currentPopupContent.title }}</template>
    <template #content>
      <div v-html='sanitizedContent'></div>
    </template>
    <!-- <template #content>{{ currentPopupContent.content }}</template> -->
    <template #buttons>
      <BaseButton variant='cancel' size='md' @click='isPopupCheckVisible = !isPopupCheckVisible'>取消</BaseButton>
      <BaseButton variant='check' size='md' @click='currentPopupContent.buttonAction'>{{ currentPopupContent.buttonText
      }}
      </BaseButton>
    </template>
  </DoubleCheckPopUp>

</template>

<script setup>
import { ref, nextTick, computed, watch, onMounted } from 'vue';
import { changeAccount } from '@/services/accountService/changeAccount.js';
import { getMaintainUserList, insertMaintainUser, checkMaintainUser, deleteMaintainUser, updateMaintainUserType, resendUserPassword } from '@/services/api/maintainUser.js';
import DOMPurify from 'dompurify';

import { useUserStore } from '@/stores/userStore';
import { useSystemStore } from '@/stores/systemStore';
import { useAccountStore } from '@/stores/accountStore';

import editIcon from '@/assets/images/icons/right-arrow.svg';
import editGrayIcon from '@/assets/images/icons/right-arrow-gray.svg';

const userStore = useUserStore();
const systemStore = useSystemStore();

const STORE_MANAGE = 2
const PERMISSION_MANAGE = 1
const currentView = ref(PERMISSION_MANAGE);

const userStatusText = ref({
  "0": '未驗證',
  "1": '已驗證'
});

// 滾動到指定卡片位置
const addRef = ref(null)
const editRef = ref(null)
const scrollAddPopupToBottom = () => addRef.value?.scrollToBottom()
const scrollEditPopupToBottom = () => editRef.value?.scrollToBottom()

import { useUserRole } from '@/composables/useUserRole';
const { userRole, userRoleKey, isAdmin } = useUserRole();

const rolesOptions = ref(
  Object.entries(userRole)
  .filter(([key]) => key !== '1')
  .map(([key, { id, label }]) => ({
    key, label, value: id
  }))
);

const filteredRolesOptions = computed(() => {
  if (isAdmin.value) {
    return rolesOptions.value;
  } else {
    return rolesOptions.value.filter((option) => option.value === 3);
  }
});

const managerInfo = ref({
  name: userStore.userInfo?.username || '',
  avatar: userStore.userInfo?.avatar || '',
  avatarUrl: userStore.userInfo?.avatar,
  userId: userStore.userInfo?.email || '',
  role: userRoleKey.value || '',
  branchList: isAdmin.value ? userStore.ownerCompanies || [] : [userStore.maintainOwnerCompany || {}],
});

const maintainUserList = ref([])

const fetchUserList = async () => {
  try {
    const result = await getMaintainUserList('');
    maintainUserList.value = result.map(user => {
      const isInvalidImage = !user.imageUrl || user.imageUrl === `${systemStore.imageBaseUrl}`;
      return {
        maintainOwnerId: user.maintainOwnerId,
        userName: user.userName,
        userId: user.userId,
        userAvatar: isInvalidImage ? null : user.imageUrl,
        userStatus: userStatusText.value[user.userStatus],
        userRole: userRole[user.userType]?.key || '',
        userType: user.userType
      };
    });
  } catch (error) {
    console.error('Error getting maintain user:', error);
  }
}

const filteredMaintainUserList = computed(() => {
  if (!isAdmin.value) {
    return maintainUserList.value.filter((user) => user.userType === 3);
  }
  return maintainUserList.value;
});

const buttonCancel = ref({ variant: 'cancel', size: 'md', label: '取消' });
const buttonConfirm = ref({ variant: 'check', size: 'md', label: '創建成員' });
const saveButton = ref({ variant: 'check', size: 'md', label: '儲存' });
const deleteButton = ref({ variant: 'cancel', size: 'sm', label: '刪除' });

import { useCheckBookingForm } from '@/composables/common/useFormValidation.js'
const { clearErrorMessage, checkInputs, checkDropdown } = useCheckBookingForm()

const USER_TYPE = {
  MANAGER: { 'int': 2, 'string': '2', max: 2, overcapablePopup: 'overcapacity-manager' },
  STAFF: { 'int': 3, 'string': '3', max: 10, overcapablePopup: 'overcapacity-staff' }
}

const checkMaintainUserCounts = async (userType) => {
  const result = await checkMaintainUser();

  if (!result.data || !Array.isArray(result.data)) {
    return false;
  }

  const counts = result.data.reduce((acc, { maintainRoot, count }) => {
    if (maintainRoot === USER_TYPE.MANAGER.string || maintainRoot === USER_TYPE.MANAGER.int) acc.managerCount = count || 0;
    if (maintainRoot === USER_TYPE.STAFF.string || maintainRoot === USER_TYPE.STAFF.int) acc.staffCount = count || 0;
    return acc;
  }, { managerCount: 0, staffCount: 0 });

  return checkUserLimit(userType, counts);
}

const checkUserLimit = (userType, counts) => {
  const userTypeValue = userType;
  for (const type in USER_TYPE) {
    const { int, string, max, overcapablePopup } = USER_TYPE[type];
    if ((userTypeValue === string || userTypeValue === int) && counts[`${type.toLowerCase()}Count`] >= max) {
      showPopup(isPopupVisible, overcapablePopup);
      return false;
    }
  }
  return true;
}

const userName = ref('')
const userNameInput = ref({ model: userName, label: '使用者名稱', placeholder: '請輸入使用者名稱', locked: false, required: true, errorMessage: '' })
const userAccount = ref('')
const userAccountInput = ref({ model: userAccount, label: '帳號', type: 'email', placeholder: '請輸入電子信箱', locked: false, required: true, errorMessage: '' })
const userRoleForAdd = ref('')
const userRoleForEdit = ref('')

const checkInputList = [ userNameInput, userAccountInput ]

const resetInputs = () => {
  userName.value = ''
  userAccount.value = ''
  userRoleForAdd.value = ''
}

const addMember = async () => {
  checkInputList.forEach((input) => {
    clearErrorMessage(input)
  })

  if (!checkInputs(checkInputList) || !checkDropdown(userRoleForAdd)) {
    return;
  }

  const canAddUser = await checkMaintainUserCounts(userRoleForAdd.value);

  if (!canAddUser) {
    return;
  }

  const inputs = {
    "userId": userAccount.value,
    "userName": userName.value,
    "userType": userRoleForAdd.value
  }

  try {
    const response = await insertMaintainUser(inputs);
    if (response.data.status === "error" && response.data.message === "duplicated userId") {
      const userAccountInput = checkInputList.find(input =>input.value.model === userAccount.value);
      if (userAccountInput) {
        userAccountInput.value.errorMessage = '此帳號已註冊';
      }
      return;
    }

    // Close the popup
    isPopupAddVisible.value = false;
    showPopup(isPopupVisible, 'insertSuccess')

    // 重新抓取資料
    fetchUserList();
  } catch (error) {
    console.error('新增成員失敗:', error);
  }
}

const editingUser = ref({});

const editMember = async (index) => {
  editingUser.value = maintainUserList.value[index];
  userRoleForEdit.value = editingUser.value.userType;
  userNameInput.value.model = editingUser.value.userName;
  userAccountInput.value.model = editingUser.value.userId;
  await nextTick();
  isPopupEditVisible.value = true;
}

const sendEmail = async ( userId ) => {
  await resendUserPassword(userId)
  showPopup(isPopupVisible, 'sendEmailSuccess')
}

const saveMember = async () => {
  const inputs = {
    "userType": userRoleForEdit.value,
    "maintainOwnerId": editingUser.value.maintainOwnerId
  }
  const canAddUser = await checkMaintainUserCounts(userRoleForEdit.value);

  if (!canAddUser) {
    return;
  }
  await updateMaintainUserType(inputs)
  isPopupEditVisible.value = false;
  showPopup(isPopupVisible, 'saveSuccess')
  // 重新抓取資料
  fetchUserList();
}

const deleteMember = async () => {
  const maintainOwnerId = editingUser.value.maintainOwnerId;
  await deleteMaintainUser(maintainOwnerId)
  isPopupCheckVisible.value = false;
  showPopup(isPopupVisible, 'deleteSuccess')
  // 重新抓取資料
  fetchUserList();
}

const checkDeleteMember = () => {
  isPopupEditVisible.value = false;
  showPopup(isPopupCheckVisible, 'deleteWarning')
}

const currentBranch = ref('');

const viewBranchDetails = async (branchId) => {
  const branchList = managerInfo.value.branchList || [];
  if (isAdmin.value && userStore.selectedCompanyId !== branchId) {
    try {
      await changeAccount(branchId);
      userStore.selectedCompanyId = branchId;
      currentView.value = STORE_MANAGE;
    } catch (error) {
      console.error('切換分店失敗:', error);
    }
  } else {
    userStore.selectedCompanyId = branchId;
    currentView.value = STORE_MANAGE;
  }
  const branch = branchList.find((branch)=>branch.id === branchId)
  currentBranch.value = branch ? branch.name : '無店鋪資訊';
}

const isPopupVisible = ref(false);
const isPopupCheckVisible = ref(false);
const isPopupAddVisible = ref(false);
const isPopupEditVisible = ref(false);
const currentPopupContent = ref('');
const popupContentTemplates = ref({
  'insertSuccess': {
    title: '成員創建成功',
    content: '請通知成員查收電子信箱驗證登入',
    buttonText: '我知道了',
  },
  'deleteSuccess': {
    title: '刪除成員成功',
    buttonText: '我知道了',
  },
  'sendEmailSuccess': {
    title: '驗證信發送成功',
    content: '請通知成員查收電子信箱驗證登入',
    buttonText: '我知道了',
  },
  'saveSuccess': {
    title: '成員權限更新成功',
    // content: '',
    buttonText: '我知道了',
  },
  'warning': {
    title: '請輸入完整資訊',
    content: '請輸入使用者名稱、帳號與權限',
    buttonText: '我知道了',
  },
  'deleteWarning': {
    title: '確定要刪除成員?',
    content: '刪除後無法還原資料',
    buttonText: '確定刪除',
    buttonAction: () => deleteMember()
  },
  'overcapacity-manager': {
    title: '店長人數已達上限',
    content: '最多可新增<span class="highlight">2名店長</span>，如欲新增更多使用者請洽詢服務專員',
    buttonText: '我知道了',
  },
  'overcapacity-staff': {
    title: '員工人數已達上限',
    content: '最多可新增<span class="highlight">10名員工</span>，如欲新增更多使用者請洽詢服務專員',
    buttonText: '我知道了',
  }
});
const sanitizedContent = computed(() => {
  return DOMPurify.sanitize(currentPopupContent.value.content);
});
const showPopup = (visibleType, templateType) => {
  currentPopupContent.value = popupContentTemplates.value[templateType];
  visibleType.value = true;
}
watch(isPopupAddVisible, (newVal) => {
  if (newVal) {
    resetInputs()
  }
})

onMounted(() => {
  fetchUserList();
});

watch(
  () => [userStore.userInfo, userStore.ownerCompanies, userStore.maintainOwnerCompany],
  () => {
    fetchUserList();
  },
  { immediate: true }
);

const accountStore = useAccountStore();
const isViewOnly = ref(false);
const GOOGLE_STATUS = ref(8);
watch(
  () => accountStore.googleStatus,
  (newStatus) => {
    isViewOnly.value = newStatus === GOOGLE_STATUS.value;
  },
  { immediate: true }
);
</script>

<style lang="scss" scoped>
@use '@/assets/scss/pages/accountSettings/_mixins.scss' as *;

.highlight {
  color: $primary;
}
:deep(.highlight) {
  color: $primary;
}
.manager-info {
  .user-name {
    margin-right: auto;
  }

  .user-avatar {
    @include avatar(56px);
  }
}

.shop-list-box {
  overflow: hidden;
  margin: 20px 0;
  border: 1px solid $black-500;
  border-radius: 8px;

  ul {
    list-style: none;
    padding: 0;
    margin: 0;

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 20px;
      padding: 20px;
      border-bottom: 1px solid $black-500;
      cursor: pointer;

      &:last-child {
        border-bottom: none;
      }

      .member-avatar {
        @include avatar(40px);
        flex-shrink: 0;
      }

      .member-name {
        flex-basis: 100px;
      }

      .member-mail {
        margin-right: auto;
        @media (max-width: 1024px){
          display: none;
        }
      }

      .member-status {
        padding: 0 10px;
      }
    }

    li.add-user {
      color: $primary;
      &.is-view-only {
        pointer-events: none;
        color: $black-500;
      }
    }
  }
}

.member-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding: 20px 0;

  .member-name {
    margin-right: auto;
  }
  .member-avatar {
    @include avatar(40px);
    flex-shrink: 0;
  }
}

.member-info {
  display: block;
  .info-group {
    display: flex;
    align-items: center;
    gap: 20px;
    padding: 20px 0;
    width: 100%;

    .info-title {
      width: 60px;
    }

    .info-content {
      flex: 1;

      span {
        padding-right: 2rem;
      }
    }
  }
}

.add-member-box{
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.member-item {
  &.is-view-only {
    pointer-events: none;
  }
}
</style>